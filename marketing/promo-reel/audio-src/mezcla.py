"""Música, efectos de sonido y mezcla final.

Todo el audio (salvo la voz, generada con Piper) se sintetiza aquí desde cero con numpy,
así que no hay ninguna pista ni muestra de terceros: se puede usar comercialmente sin licencias.
Lee src/timeline.json y escribe public/audio/{music,sfx,voice,mix}.wav

Uso (desde marketing/promo-reel):  python3 audio-src/timeline.py && python3 audio-src/mezcla.py
"""
import json, wave, subprocess
from pathlib import Path
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, stft, istft

ROOT = Path(__file__).resolve().parent.parent
TL = json.load(open(ROOT / "src" / "timeline.json"))
EV, VO, TOTAL = TL["ev"], TL["vo"], TL["total"]
SR = 48000
N = int(TOTAL * SR) + SR
OUT = ROOT / "public" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)


def T(d):
    return np.arange(int(d * SR)) / SR


def hz(note):  # nota MIDI → Hz
    return 440.0 * 2 ** ((note - 69) / 12)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x, axis=0)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, a, b, order=2):
    return sosfilt(butter(order, [a, b], "band", fs=SR, output="sos"), x, axis=0)


def add(buf, sig, at, gain=1.0, pan=0.0):
    """Suma `sig` (mono o estéreo) en `buf` estéreo a partir del segundo `at`."""
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
    i = int(at * SR)
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), len(buf) - i)
    if n > 0:
        buf[i:i + n] += sig[:n] * gain


def reverb(x, seconds=2.6, wet=0.3, damp=3000, pre=0.02):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = []
    for s in (1, 2):
        noise = np.random.default_rng(s).standard_normal(n) * np.exp(-t * 6.9 / seconds)
        noise = lp(noise, damp)
        noise[: int(pre * SR)] = 0
        ir.append(noise / np.sqrt(np.sum(noise ** 2)))
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    y = np.stack([fftconvolve(x[:, c], ir[c])[: len(x)] for c in range(2)], 1)
    return x * (1 - wet) + y * wet * 2.2


def saw(f, t, phase=0.0):
    return 2 * ((f * t + phase) % 1) - 1


def env_adsr(n, a, r, sus=1.0):
    e = np.ones(n) * sus
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) ** 2 * sus if na else e[:na]
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


# ----------------------------------------------------------------- MÚSICA (120 BPM, La menor)
BEAT = 0.5
music = np.zeros((N, 2))
pad_bus = np.zeros((N, 2))
arp_bus = np.zeros((N, 2))
drum_bus = np.zeros((N, 2))

# Progresión: Am(add9) – Fmaj7 – C(add9) – G6 ... cada acorde 4 s (2 compases)
CH = [[57, 64, 67, 71, 72], [53, 60, 64, 67, 69], [48, 55, 62, 64, 67], [55, 59, 62, 64, 69]]
ROOTS = [45, 41, 48, 43]


def pad_chord(notes, dur, bright=1200):
    t = T(dur)
    out = np.zeros((len(t), 2))
    for k, n in enumerate(notes):
        for d, side in ((-0.09, 0), (0.0, None), (0.09, 1)):
            s = saw(hz(n + d), t, rng.random())
            if side is None:
                out += np.stack([s, s], 1) * 0.5
            else:
                out[:, side] += s * 0.7
    out = lp(out, bright, 4) / (len(notes) * 2.2)
    return out * env_adsr(len(t), 1.2, 1.6)[:, None]


def pluck(f, dur=0.6, bright=8):
    t = T(dur)
    s = sum(np.sin(2 * np.pi * f * h * t) / h * np.exp(-t * (4 + h * bright)) for h in range(1, 10))
    return s * np.minimum(1, t / 0.003)


def kick(dur=0.45):
    t = T(dur)
    f = 45 + 80 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(np.sin(ph) * np.exp(-t * 7.5) * 1.6) + bp(rng.standard_normal(len(t)), 1500, 5000) * np.exp(-t * 180) * 0.15


def hat(dur=0.08, open_=False):
    t = T(dur if not open_ else 0.3)
    return hp(rng.standard_normal(len(t)), 7000, 4) * np.exp(-t * (60 if not open_ else 14))


def clap():
    t = T(0.35)
    n = bp(rng.standard_normal(len(t)), 900, 3500)
    e = np.exp(-t * 18) + sum(np.exp(-np.maximum(0, t - d) * 140) * (t >= d) * 0.6 for d in (0.0, 0.011, 0.023))
    return n * e * 0.6


def bass_note(f, dur):
    t = T(dur)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.tanh(3 * saw(f, t)) * 0.4
    return lp(s, 380) * env_adsr(len(t), 0.008, 0.12)


# Pads: suenan todo el vídeo, con brillo creciente
for bar in range(int(TOTAL / 4) + 1):
    t0 = bar * 4.0
    if t0 > 28.0:
        break
    ci = bar % 4
    bright = 700 if t0 < 4 else 1100 if t0 < 20 else 1700
    g = 0.5 if t0 < 4 else 0.62
    add(pad_bus, pad_chord(CH[ci], 4.6, bright), t0 - 0.3, g)
    # sub-grave
    add(pad_bus, np.sin(2 * np.pi * hz(ROOTS[ci] - 12) * T(4.2)) * env_adsr(int(4.2 * SR), 0.3, 0.6) * (0.16 if t0 >= 4 else 0.1), t0)

# Arpegio de plucks (desde la marca)
ARP = [0, 2, 3, 4, 3, 2, 1, 2]
for i in range(int((28.0 - 4.0) / (BEAT / 2))):
    tt = 4.0 + i * BEAT / 2
    ci = int(tt // 4) % 4
    notes = sorted(CH[ci])[1:]
    n = notes[ARP[i % 8] % len(notes)] + 12
    vel = (0.55 if i % 4 == 0 else 0.35) * (0.7 if tt < 9 else 1.0) * (1.25 if tt > 20 else 1)
    add(arp_bus, pluck(hz(n), 0.5, 6 if tt < 20 else 3.5), tt, vel * 0.32, pan=0.35 * np.sin(i * 0.9))

# Batería y bajo (desde la demo de producto)
for i in range(int((28.0 - 9.0) / BEAT)):
    tt = 9.0 + i * BEAT
    ci = int(tt // 4) % 4
    if i % 2 == 0 or tt >= 20:
        add(drum_bus, kick(), tt, 0.55 if tt < 20 else 0.62)
    add(drum_bus, hat(), tt + BEAT / 2, 0.09, pan=0.25)
    if tt >= 16:
        add(drum_bus, hat(), tt + BEAT / 4 * 3, 0.05, pan=-0.3)
    if tt >= 20 and i % 2 == 1:
        add(drum_bus, clap(), tt, 0.22)
    for k in range(2):
        add(pad_bus, bass_note(hz(ROOTS[ci] - 12), BEAT / 2 - 0.02), tt + k * BEAT / 2, 0.30 if k else 0.22)

# Riser antes del cierre
rd = 2.4
t = T(rd)
riser = bp(rng.standard_normal(len(t)), 300, 9000) * (t / rd) ** 2.5 * 0.22
riser += np.sin(2 * np.pi * np.cumsum(220 + 900 * (t / rd) ** 2) / SR) * (t / rd) ** 3 * 0.05
add(music, riser, EV["s6_line"] - rd + 0.05)

# Cierre: pad amplio en La menor → resolución en Fa mayor 7 sobre la marca y final en La (add9)
END = [(EV["s6_line"] - 0.1, [57, 64, 67, 71, 76], 2.9, 1500),
       (EV["s6_claim1"] - 0.15, [53, 60, 64, 67, 72], 2.0, 1900),
       (EV["s6_claim2"] - 0.15, [55, 59, 62, 67, 74], 1.75, 2100),
       (EV["s6_end"], [57, 64, 69, 71, 76], TOTAL - EV["s6_end"] + 0.6, 2400)]
for at, notes, d, br in END:
    add(pad_bus, pad_chord(notes, d + 0.8, br), at, 0.75)
    add(pad_bus, np.sin(2 * np.pi * hz(notes[0] - 24) * T(d + 0.6)) * env_adsr(int((d + 0.6) * SR), 0.05, 0.8), at, 0.22)
# campanas en el final
for k, n in enumerate([81, 76, 72, 69, 76, 81]):
    add(arp_bus, pluck(hz(n), 1.6, 1.2), EV["s6_end"] + k * 0.16, 0.13 * (1 - k * 0.1), pan=0.4 * np.sin(k * 2))

pad_bus = reverb(pad_bus, 3.2, 0.35, 2600)
arp_bus = reverb(arp_bus, 2.2, 0.38, 5000)
music += pad_bus + arp_bus + reverb(drum_bus, 0.8, 0.08, 5000)
# fundido del final
fade_i = int((TOTAL - 0.9) * SR)
music[fade_i:] *= np.linspace(1, 0, len(music) - fade_i)[:, None] ** 2
music[: int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]


# ----------------------------------------------------------------- EFECTOS DE SONIDO
sfx = np.zeros((N, 2))


def whoosh(dur=0.7, f0=400, f1=4000, peak=0.55, gain=1.0):
    n = int(dur * SR)
    x = rng.standard_normal(n + 2048)
    f, tt, Z = stft(x, SR, nperseg=1024)
    prog = np.clip(tt / dur, 0, 1)
    fc = f0 * (f1 / f0) ** prog
    mask = np.exp(-0.5 * (np.log(f[:, None] + 1) - np.log(fc[None, :])) ** 2 / 0.35)
    amp = np.where(prog < peak, (prog / peak) ** 2, (1 - (prog - peak) / (1 - peak)) ** 1.6)
    _, y = istft(Z * mask * amp[None, :], SR, nperseg=1024)
    y = y[:n]
    return y / (np.max(np.abs(y)) + 1e-9) * gain


def stereo_whoosh(dur, f0, f1, peak=0.55, gain=1.0, pan_from=-0.6, pan_to=0.6):
    w = whoosh(dur, f0, f1, peak, gain)
    pan = np.linspace(pan_from, pan_to, len(w))
    return np.stack([w * np.cos((pan + 1) * np.pi / 4), w * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414


def click(f=2400, dur=0.05, g=1.0):
    t = T(dur)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 90) + hp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 400) * 0.3) * g


def pop(f0=900, f1=450, dur=0.12):
    t = T(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30)


def ding(notes=(88, 95), dur=0.9):
    t = T(dur)
    return sum(np.sin(2 * np.pi * hz(n) * t) * np.exp(-t * (5 + i * 2)) / (i + 1) for i, n in enumerate(notes)) * np.minimum(1, t / 0.002)


def impact(dur=2.2, big=1.0):
    t = T(dur)
    f = 38 + 70 * np.exp(-t * 14)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    crack = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 16) * 0.5
    air = hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 5) * 0.06
    return reverb(np.tanh((boom + crack + air) * 1.3) * big, 2.5, 0.35, 3000)


def shimmer(dur=1.6, base=76):
    t = T(dur)
    s = sum(np.sin(2 * np.pi * hz(base + o) * t + k) * (0.5 + 0.5 * np.sin(2 * np.pi * (3 + k) * t)) for k, o in enumerate([0, 7, 12, 19]))
    return s * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2 * 0.2


def scan(dur=1.5):
    t = T(dur)
    f = 600 + 1400 * (0.5 - 0.5 * np.cos(np.pi * t / dur))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 + bp(rng.standard_normal(len(t)), 2000, 6000) * 0.25
    return s * np.sin(np.pi * t / dur) ** 1.5 * (0.75 + 0.25 * np.sin(2 * np.pi * 14 * t))


def zap(dur=0.7):  # trazo de luz del logo
    t = T(dur)
    f = 300 + 2600 * (t / dur) ** 1.5
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + bp(rng.standard_normal(len(t)), 3000, 9000) * 0.3
    return s * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.8


# Escena 1
add(sfx, reverb(ding((81,), 1.6), 2.5, 0.5), EV["s1_dot"], 0.32)
add(sfx, reverb(shimmer(2.4, 69), 2.5, 0.4), EV["s1_net"], 0.9)
add(sfx, stereo_whoosh(0.9, 200, 1500, 0.8, 1.0, -0.2, 0.2), EV["s1_text1"] - 0.2, 0.18)
add(sfx, reverb(click(1800, 0.05), 1.0, 0.3), EV["s1_text2"] + 0.45, 0.22)
# Escena 2
add(sfx, stereo_whoosh(0.9, 3000, 300, 0.35, 1.0, 0.5, -0.5), EV["s2_whoosh"] - 0.25, 0.42)
add(sfx, reverb(shimmer(0.8, 81), 1.5, 0.4), EV["s2_whoosh"], 0.5)
add(sfx, impact(2.6, 1.0), EV["s2_logo"] - 0.06, 0.6)
add(sfx, reverb(ding((84, 91), 1.2), 2.0, 0.45), EV["s2_logo"] + 0.02, 0.18)
add(sfx, reverb(click(1500, 0.06), 1.2, 0.3), EV["s2_sub"], 0.25)
for i in range(5):
    add(sfx, reverb(pop(1400 + i * 120, 700, 0.1), 1.2, 0.3), EV["s2_links"] - 0.3 + i * 0.18, 0.13, pan=[-0.6, 0.6, -0.6, 0.6, 0][i])
# Escena 3 · facturas
add(sfx, stereo_whoosh(0.8, 300, 3500, 0.6, 1.0, -0.4, 0.4), EV["s3_whoosh"] - 0.2, 0.42)
for i, at in enumerate(EV["s3_pdf"]):
    add(sfx, stereo_whoosh(0.35, 5000, 1200, 0.3, 1.0, 0.7, 0.0), at - 0.05, 0.16)
    add(sfx, pop(700, 380, 0.1), at + 0.3, 0.24)
add(sfx, reverb(scan(1.5), 1.0, 0.25), EV["s3_scan"], 0.22)
for i, at in enumerate(EV["s3_state"]):
    add(sfx, reverb(ding((88, 95) if i != 2 else (79, 83), 0.6), 1.2, 0.25), at, 0.16)
    add(sfx, click(3000, 0.03), at, 0.18)
add(sfx, stereo_whoosh(0.6, 800, 5000, 0.5, 1.0, 0.6, -0.6), EV["s3_toMail"] - 0.1, 0.33)
for at in EV["s3_mailIn"]:
    add(sfx, click(2200, 0.04), at, 0.14, pan=0.2)
for i, at in enumerate(EV["s3_sort"]):
    add(sfx, stereo_whoosh(0.45, 1500, 6000, 0.6, 1.0, 0.0, [-0.6, -0.2, 0.2, 0.6, -0.2][i]), at - 0.05, 0.16)
    add(sfx, pop(1100, 800, 0.08), at + 0.48, 0.18, pan=[-0.6, -0.2, 0.2, 0.6, -0.2][i])
add(sfx, reverb(ding((84, 88, 91), 1.2), 2.0, 0.4), EV["s3_sort"][4] + 0.5, 0.15)
# Escena 4 · stock
add(sfx, stereo_whoosh(0.9, 200, 2500, 0.6, 1.0, -0.3, 0.3), EV["s4_whoosh"] - 0.25, 0.42)
for k in range(5):
    add(sfx, click(1700 + k * 180, 0.04), EV["s4_whoosh"] + 0.25 + k * 0.1, 0.1, pan=-0.5 + k * 0.25)
add(sfx, reverb(scan(1.6), 1.2, 0.3), EV["s4_chart"], 0.14)
for i, at in enumerate(EV["s4_sync"]):
    for k in range(4):
        add(sfx, click(2600 + k * 200, 0.03), at + k * 0.08, 0.09, pan=-0.6 + k * 0.4)
    if i == 1:
        add(sfx, reverb(ding((86, 93), 0.7), 1.2, 0.3), at, 0.17)
# Escena 5 · IA
add(sfx, stereo_whoosh(1.0, 3500, 150, 0.4, 1.0, 0.3, -0.3), EV["s5_whoosh"] - 0.3, 0.42)
add(sfx, impact(2.2, 0.7), EV["s5_core"], 0.55)
add(sfx, reverb(shimmer(1.6, 76), 2.5, 0.45), EV["s5_core"] + 0.1, 0.55)
for i, at in enumerate(EV["s5_nodes"]):
    add(sfx, reverb(pluck(hz([76, 79, 81, 84][i]), 0.9, 1.5), 2.2, 0.45), at, 0.3, pan=[-0.5, 0.5, -0.5, 0.5][i])
    add(sfx, stereo_whoosh(0.4, 800, 3000, 0.8, 1.0, 0, [-0.5, 0.5, -0.5, 0.5][i]), at - 0.38, 0.1)
add(sfx, stereo_whoosh(0.7, 200, 1800, 0.7, 1.0, -0.2, 0.2), EV["s5_menos"] - 0.4, 0.22)
add(sfx, impact(1.6, 0.45), EV["s5_menos"] + 0.05, 0.3)
add(sfx, reverb(shimmer(1.4, 81), 2.5, 0.5), EV["s5_mas"] - 0.6, 0.55)
add(sfx, impact(2.0, 0.6), EV["s5_mas"] + 0.1, 0.45)
add(sfx, stereo_whoosh(0.55, 6000, 300, 0.2, 1.0, 0.3, -0.3), TL["scenes"]["s5"][1] - 0.5, 0.26)
# Escena 6 · cierre
add(sfx, reverb(zap(0.75), 2.0, 0.4), EV["s6_line"], 0.3)
add(sfx, impact(3.2, 1.1), EV["s6_logo"] - 0.1, 0.55)
add(sfx, reverb(shimmer(2.2, 81), 3.0, 0.5), EV["s6_logo"], 0.45)
add(sfx, reverb(click(1500, 0.06), 1.5, 0.35), EV["s6_claim1"], 0.18)
add(sfx, reverb(click(1700, 0.06), 1.5, 0.35), EV["s6_claim2"], 0.18)
add(sfx, reverb(shimmer(1.2, 88), 2.5, 0.5), EV["s6_end"] - 0.75, 0.35)
add(sfx, impact(2.5, 0.55), EV["s6_end"], 0.5)
add(sfx, reverb(pop(1300, 900, 0.1), 1.5, 0.35), EV["s6_web"], 0.2)
add(sfx, reverb(click(1600, 0.05), 1.2, 0.3), EV["s2_web"], 0.14)


# ----------------------------------------------------------------- VOZ
def read_wav(p):
    with wave.open(str(p)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768


def compress(x, thr=0.18, ratio=3.0, att=0.004, rel=0.12):
    env = np.zeros_like(x)
    a, r, e = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR)), 0.0
    ax = np.abs(x)
    for i in range(len(x)):
        c = a if ax[i] > e else r
        e = c * e + (1 - c) * ax[i]
        env[i] = e
    gain = np.where(env > thr, (thr + (env - thr) / ratio) / np.maximum(env, 1e-9), 1.0)
    return x * gain


voice = np.zeros(N)
for k, v in VO.items():
    x = read_wav(ROOT / "public" / "vo" / "trim" / f"{k}.wav")
    x = hp(x, 75, 2)
    # calidez y presencia
    x = x + 0.1 * lp(x, 200) + 0.08 * bp(x, 3000, 6000)
    x = compress(x / (np.max(np.abs(x)) + 1e-9) * 0.9)
    x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.11
    i = int(v["start"] * SR)
    voice[i:i + len(x)] += x
# un poco de sala para que no suene "en seco"
voice_st = reverb(voice, 0.9, 0.09, 4500, 0.012)

# ----------------------------------------------------------------- MEZCLA
# la música baja mientras habla la voz (sidechain suave); al final baja menos
act = np.zeros(N)
for v in VO.values():
    act[int((v["start"] - 0.12) * SR):int((v["end"] + 0.1) * SR)] = 1
k = np.ones(int(0.25 * SR)) / int(0.25 * SR)
act = np.convolve(act, k, mode="same")
depth = np.where(np.arange(N) / SR < 28.3, 0.5, 0.25)
duck = 1 - depth * act
music *= duck[:, None]


def norm(x, peak):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


music_n = norm(music, 0.42)
sfx_n = norm(sfx, 0.55)
mix = voice_st + music_n + sfx_n * 0.9
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
mix = mix[: int(TOTAL * SR)]


def write(p, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(p), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


write(OUT / "music.wav", music_n[: int(TOTAL * SR)])
write(OUT / "sfx.wav", sfx_n[: int(TOTAL * SR)])
write(OUT / "voice.wav", voice_st[: int(TOTAL * SR)])
write(OUT / "mix_raw.wav", mix)
# loudness para redes sociales: -14 LUFS, pico real -1 dBTP
# (dos pasadas, ganancia lineal: no altera la dinámica de la mezcla)
LN = "loudnorm=I=-14:TP=-1.0:LRA=11"
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(OUT / "mix_raw.wav"), "-af", LN + ":print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True, check=True).stderr
m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
LN2 = (LN + f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
       f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(OUT / "mix_raw.wav"),
                "-af", LN2, "-ar", str(SR), str(OUT / "mix.wav")], check=True)
(OUT / "mix_raw.wav").unlink()
print("mezcla lista:", OUT / "mix.wav")
