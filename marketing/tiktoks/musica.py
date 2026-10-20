"""Música de suspense generada por código (sin derechos de autor).

Capas: dron grave, acorde inquietante, latido, tic-tac de reloj, un "whoosh" en cada
cambio de escena y un golpe fuerte al llegar a la escena final (la llamada a la acción).
"""
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
rng = np.random.default_rng(7)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def saw(f, t):
    return 2 * ((f * t) % 1) - 1


def env(n, a, r):
    """Envolvente de ataque y caída exponencial, en muestras."""
    e = np.exp(-np.arange(n) / max(r, 1))
    a = min(a, n)
    e[:a] *= np.linspace(0, 1, a)
    return e


def place(buf, x, at):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    x = x[max(0, -i):]
    i = max(0, i)
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n]


def reverb(x, secs=2.2, mix=0.3):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * secs / 6))
    ir = lp(ir, 5000)
    wet = fftconvolve(x, ir)[:len(x)]
    wet *= np.max(np.abs(x)) / (np.max(np.abs(wet)) + 1e-9)
    return x * (1 - mix) + wet * mix


def thump(f0=58, dur=0.35, gain=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (1 + 1.5 * np.exp(-t * 40))  # caída de tono rápida
    return gain * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 40, SR * 0.09)


def tick(freq):
    n = int(0.03 * SR)
    return bp(rng.standard_normal(n), freq * 0.8, freq * 1.25) * env(n, 5, SR * 0.004)


def whoosh(dur=0.7):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    for k in range(8):  # barrido de filtro ascendente
        seg = slice(k * n // 8, (k + 1) * n // 8)
        out[seg] = bp(noise, 300 + 3000 * k / 8, 900 + 6000 * k / 8)[seg]
    return out * t ** 2.5 * 0.5


def impact(dur=3.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 42 * (1 + 2 * np.exp(-t * 18))
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 30, SR * 0.7)
    crack = lp(rng.standard_normal(n), 2500) * env(n, 10, SR * 0.08) * 0.6
    metal = sum(np.sin(2 * np.pi * h * t) / (k + 1) for k, h in enumerate([187, 263, 351, 466]))
    metal *= env(n, 200, SR * 0.9) * 0.15
    return reverb(boom + crack + metal, 3.0, 0.35)


def make(total, cues, out_path):
    """total: duración en segundos. cues: inicio de cada escena (la última = final)."""
    n = int(total * SR)
    t = np.arange(n) / SR
    final = cues[-1]
    pre = np.clip((final - t) / 0.4, 0, 1)            # 1 antes del final, 0 desde el golpe
    build = 0.55 + 0.45 * np.clip(t / final, 0, 1)    # la tensión sube durante el vídeo
    L, R = np.zeros(n), np.zeros(n)

    # Dron grave en re, con filtro que respira
    drone = saw(36.71, t) + saw(36.9, t) + 0.6 * saw(73.42, t + 0.3) + 0.4 * saw(55.0, t)
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t)
    drone = lp(drone, 180) * (0.6 + 0.4 * lfo) + lp(drone, 520) * 0.25 * lfo
    drone *= np.clip(t / 1.2, 0, 1) * 0.2
    L += drone
    R += drone

    # Acorde agudo inquietante (re menor con novena y tritono)
    for i, (f, g) in enumerate([(293.66, 1), (349.23, .8), (440.0, .7), (659.25, .45), (415.3, .3)]):
        swell = 0.5 + 0.5 * np.sin(2 * np.pi * (0.07 + 0.03 * i) * t + i)
        v = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.003 * t)) * g * swell
        pan = 0.3 + 0.4 * (i % 2)
        L += v * 0.022 * (1 - pan) * 2
        R += v * 0.022 * pan * 2

    # Latido (lub-dub) cada 0.8 s y tic-tac cada 0.4 s, hasta justo antes del final
    beats = np.zeros(n)
    clock = np.zeros(n)
    b = 0.45
    while b < final - 0.45:
        place(beats, thump(gain=1.0), b)
        place(beats, thump(52, gain=0.6), b + 0.19)
        b += 0.8
    k, c = 0, 0.25
    while c < final - 0.3:
        place(clock, tick(2600 if k % 2 == 0 else 2000), c)
        c += 0.4
        k += 1
    L += beats * 0.55 * build
    R += beats * 0.55 * build
    clock = reverb(clock, 0.6, 0.25) * 0.12 * build
    L += clock * 1.1
    R += clock * 0.9

    # Whoosh antes de cada cambio de escena y golpe en la escena final
    fx = np.zeros(n)
    for cue in cues[1:]:
        w = whoosh(0.8 if cue == final else 0.5)
        place(fx, w * (1.0 if cue == final else 0.35), cue - len(w) / SR)
    L += fx * 0.7
    R += fx * 0.7

    # Silencio de tensión antes del golpe, y cola grave sostenida tras él
    tail = np.clip((t - final) / 0.2, 0, 1) * np.clip((total - t) / 1.0, 0, 1)
    low = lp(saw(36.71, t) + saw(36.95, t), 140) * 0.3 * tail
    L = L * (0.15 + 0.85 * pre) + low
    R = R * (0.15 + 0.85 * pre) + low
    # el golpe va después del silencio previo, para que no quede atenuado
    hit = np.zeros(n)
    place(hit, impact(), final)
    L += hit * 1.6
    R += hit * 1.6

    fade = np.clip((total - t) / 0.6, 0, 1)
    st = np.stack([hp(L, 28) * fade, hp(R, 28) * fade], axis=1)
    st *= 0.89 / np.max(np.abs(st))
    with wave.open(str(out_path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())


if __name__ == "__main__":
    make(17.4, [0.2, 3.4, 6.8, 10.2, 13.57], "musica_prueba.wav")
