"""Procedural, original ambient score + UI sound effects for Hidden Ledger (NumPy only, no samples).

Everything is synthesized from sine/noise primitives with a fixed seed, so the output is reproducible.
No melodies, loops or recordings from third parties are used.

Moods (cue types)
  intro    ~72 BPM, minor, low pulse + ticking texture: intrigue
  neutral  ~84 BPM, sparse maj7/min7 pads + soft mallet arpeggio: explanation bed
  reveal   ~76 BPM, warmer major progression, resolves to the tonic: payoff / end card

Usage
  python python/music.py demos            # three 60 s standalone variations -> assets/music/generated/
  python python/music.py sfx              # UI sound effects -> assets/sfx/
  (cues for an episode are rendered by mix.py through render_cue())
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import MIX_SR, ROOT  # noqa: E402

SEED = 1001
SR = MIX_SR

NOTE = {n: i for i, n in enumerate("C C# D D# E F F# G G# A A# B".split())}


def midi(name: str) -> int:
    """'A3' -> 57"""
    pitch, octave = name[:-1], int(name[-1])
    return 12 * (octave + 1) + NOTE[pitch]


def hz(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


# Chords as MIDI note names; voicings kept close to avoid big jumps.
MOODS = {
    "intro": {
        "bpm": 72, "beats_per_chord": 8, "root_octave": 2,
        "chords": [["D3", "F3", "A3", "C4"], ["A#2", "D3", "F3", "A3"], ["G2", "A#2", "D3", "F3"], ["A2", "C#3", "E3", "A3"]],
        "pad_gain": 0.20, "pulse": True, "tick": True, "mallet": False, "bright": 0.35,
    },
    "neutral": {
        "bpm": 84, "beats_per_chord": 8, "root_octave": 2,
        "chords": [["F3", "A3", "C4", "E4"], ["D3", "F3", "A3", "C4"], ["A#2", "D3", "F3", "A3"], ["C3", "E3", "G3", "A#3"]],
        "pad_gain": 0.16, "pulse": False, "tick": False, "mallet": True, "bright": 0.25,
    },
    "reveal": {
        "bpm": 76, "beats_per_chord": 8, "root_octave": 2,
        "chords": [["A#2", "D3", "F3", "A3"], ["C3", "E3", "G3", "C4"], ["D3", "F3", "A3", "C4"], ["F3", "A3", "C4", "F4"]],
        "pad_gain": 0.20, "pulse": True, "tick": False, "mallet": True, "bright": 0.45,
    },
}


def env_adsr(n: int, a: float, r: float) -> np.ndarray:
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na:
        e[:na] = np.linspace(0, 1, na) ** 2
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def pad_note(freq: float, dur: float, bright: float, rng: np.random.Generator) -> np.ndarray:
    """Additive pad: 3 detuned voices x 6 harmonics, slow brightness LFO, stereo spread."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(0.03, 0.07) * t + rng.uniform(0, 6.28))
    for v, (cents, pan) in enumerate([(-6, 0.25), (0, 0.5), (6, 0.75)]):
        f = freq * 2 ** (cents / 1200)
        voice = np.zeros(n)
        for h in range(1, 7):
            amp = (1 / h ** 1.6) * (1 if h == 1 else bright * (0.6 + 0.4 * lfo))
            voice += amp * np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6.28))
        out[:, 0] += voice * np.cos(pan * np.pi / 2)
        out[:, 1] += voice * np.sin(pan * np.pi / 2)
    return out * env_adsr(n, min(2.2, dur * 0.4), min(2.5, dur * 0.45))[:, None] / 3


def mallet(freq: float, dur: float = 1.6) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t * 9)
    x *= np.exp(-t * 3.2) * env_adsr(n, 0.004, 0.05)
    return x


def thump(dur: float = 0.5, f0: float = 95, f1: float = 42) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 18)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * env_adsr(n, 0.002, 0.05)


def noise_burst(rng, dur: float, decay: float, hp: bool = True) -> np.ndarray:
    n = int(dur * SR)
    x = rng.standard_normal(n)
    if hp:
        x = np.diff(np.diff(x, prepend=0), prepend=0) / 4  # crude high-pass
    t = np.arange(n) / SR
    return x * np.exp(-t * decay) * env_adsr(n, 0.001, 0.01)


def place(buf: np.ndarray, sig: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.5):
    i = int(at * SR)
    if i >= len(buf):
        return
    if sig.ndim == 1:
        sig = np.stack([sig * np.cos(pan * np.pi / 2), sig * np.sin(pan * np.pi / 2)], axis=1)
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def reverb(x: np.ndarray, rng, seconds: float = 2.8, wet: float = 0.28) -> np.ndarray:
    """FFT convolution with a synthetic exponentially-decaying stereo noise impulse."""
    n_ir = int(seconds * SR)
    t = np.arange(n_ir) / SR
    ir = rng.standard_normal((n_ir, 2)) * np.exp(-t * 6.9 / seconds)[:, None]
    ir[: int(0.012 * SR)] = 0  # pre-delay
    ir /= np.sqrt(np.sum(ir ** 2, axis=0))
    n = len(x) + n_ir
    size = 1 << (n - 1).bit_length()
    y = np.zeros((len(x), 2))
    for c in range(2):
        Y = np.fft.rfft(x[:, c], size) * np.fft.rfft(ir[:, c], size)
        y[:, c] = np.fft.irfft(Y, size)[: len(x)]
    return x * (1 - wet) + y * wet * 1.4


def soft_lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    """Gentle 2nd-order-like low-pass applied in the frequency domain (zero phase, no instability)."""
    size = 1 << (len(x) - 1).bit_length()
    f = np.fft.rfftfreq(size, 1 / SR)
    h = 1 / (1 + (f / cutoff) ** 4) ** 0.5
    y = np.empty_like(x)
    for c in range(x.shape[1]):
        y[:, c] = np.fft.irfft(np.fft.rfft(x[:, c], size) * h, size)[: len(x)]
    return y


def render_cue(mood: str, duration: float, seed_offset: int = 0, intensity: float = 1.0,
               resolve_end: bool = False) -> np.ndarray:
    """Render an original cue of exactly `duration` seconds (stereo float, 48 kHz)."""
    cfg = MOODS[mood]
    rng = np.random.default_rng(SEED + seed_offset)
    n = int(duration * SR)
    buf = np.zeros((n + int(4 * SR), 2))
    beat = 60.0 / cfg["bpm"]
    chord_len = beat * cfg["beats_per_chord"]
    chords = list(cfg["chords"])
    # rotate start chord per cue so consecutive scenes don't restart identically
    shift = seed_offset % len(chords)
    chords = chords[shift:] + chords[:shift]
    n_chords = int(np.ceil(duration / chord_len))
    for k in range(n_chords):
        start = k * chord_len
        ch = chords[k % len(chords)]
        if resolve_end and k == n_chords - 1:
            ch = cfg["chords"][-1]
        # occasionally drop or lift one voice for variation
        notes = [midi(x) for x in ch]
        if rng.random() < 0.35:
            notes[rng.integers(1, len(notes))] += 12
        if rng.random() < 0.25:
            notes = notes[:-1]
        for m in notes:
            place(buf, pad_note(hz(m), chord_len + 2.0, cfg["bright"], rng), start, cfg["pad_gain"] / len(notes) * 2.2)
        # sub root
        place(buf, pad_note(hz(midi(ch[0]) - 12), chord_len + 1.5, 0.05, rng), start, 0.10)
        # rhythmic layers, density evolves with position (rise then settle)
        phase = (start / max(duration, 1e-6))
        density = intensity * (0.55 + 0.45 * np.sin(np.pi * min(1.0, phase * 1.15)))
        for b in range(cfg["beats_per_chord"]):
            tb = start + b * beat
            if tb >= duration:
                break
            if cfg["pulse"] and b % 2 == 0 and rng.random() < 0.9 * density:
                place(buf, thump(0.45, 80, 40), tb, 0.16 if b % 4 == 0 else 0.09)
            if cfg["tick"] and rng.random() < 0.7 * density:
                for sub in (0, 0.5):
                    if rng.random() < 0.6:
                        place(buf, noise_burst(rng, 0.06, 70), tb + sub * beat, 0.035, pan=rng.uniform(0.3, 0.7))
            if cfg["mallet"] and rng.random() < 0.42 * density:
                m = notes[rng.integers(0, len(notes))] + 12
                place(buf, mallet(hz(m)), tb + (0.5 * beat if rng.random() < 0.3 else 0), 0.05,
                      pan=rng.uniform(0.25, 0.75))
    x = buf[:n]
    x = reverb(x, rng)
    x = soft_lowpass(x, 5200)
    # cue envelope: soft in/out so cues can crossfade
    fade = min(2.0, duration / 4)
    x *= env_adsr(len(x), fade, fade)[:, None]
    peak = np.max(np.abs(x)) or 1
    return (x / peak * 0.5).astype(np.float32)


# ------------------------------------------------------------------ SFX
def add(*sigs: np.ndarray) -> np.ndarray:
    """Sum mono signals of different lengths."""
    out = np.zeros(max(len(x) for x in sigs))
    for x in sigs:
        out[: len(x)] += x
    return out


def sfx_set(rng) -> dict[str, np.ndarray]:
    out = {}
    # whoosh: band-limited noise with rising-then-falling envelope and moving brightness
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sm = np.convolve(noise, np.ones(24) / 24, mode="same")
    bright = noise - sm
    mix = sm * (1 - t / t[-1]) + bright * 0.3 * (t / t[-1])
    env = np.sin(np.pi * np.clip(t / 0.9, 0, 1)) ** 2.5
    w = mix * env
    out["whoosh"] = np.stack([w * np.linspace(1, 0.4, n), w * np.linspace(0.4, 1, n)], 1)
    # soft click: short filtered transient
    c = add(noise_burst(rng, 0.05, 160, hp=True), 0.3 * mallet(1800, 0.05))
    out["click"] = c
    # tick: tiny high blip, used on counters
    out["tick"] = add(mallet(2400, 0.08) * 0.6, noise_burst(rng, 0.03, 220) * 0.3)
    # thump: low soft hit for big reveals
    out["thump"] = add(thump(0.6, 110, 45), noise_burst(rng, 0.05, 80, hp=False) * 0.05)
    # pop: positive confirmation (two quick mallets, no melody)
    p = np.zeros(int(0.35 * SR))
    a = mallet(880, 0.3)
    p[: len(a)] += a
    out["pop"] = p
    for k, v in out.items():
        out[k] = (v / (np.max(np.abs(v)) or 1) * 0.7).astype(np.float32)
    return out


def write_sfx(dest: Path):
    dest.mkdir(parents=True, exist_ok=True)
    for name, sig in sfx_set(np.random.default_rng(SEED + 77)).items():
        sf.write(dest / f"{name}.wav", sig, SR, subtype="PCM_16")
        print("sfx", name, round(len(sig) / SR, 2), "s")


def write_demos(dest: Path, seconds: float = 60):
    dest.mkdir(parents=True, exist_ok=True)
    for i, mood in enumerate(["intro", "neutral", "reveal"], start=1):
        x = render_cue(mood, seconds, seed_offset=i * 10, resolve_end=(mood == "reveal"))
        p = dest / f"{i}_{mood}.wav"
        sf.write(p, x, SR, subtype="PCM_16")
        print("music", p.name, seconds, "s")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("what", choices=["demos", "sfx", "all"])
    a = ap.parse_args()
    if a.what in ("sfx", "all"):
        write_sfx(ROOT / "assets" / "sfx")
    if a.what in ("demos", "all"):
        write_demos(ROOT / "assets" / "music" / "generated")


if __name__ == "__main__":
    main()
