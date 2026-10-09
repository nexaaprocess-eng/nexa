"""Fuente única de tiempos del vídeo.

Recorta los silencios de la locución (public/vo/*.wav), los pasa a 48 kHz y escribe
src/timeline.json con: inicio de cada frase de voz, límites de escena y eventos clave.
Las animaciones (Remotion) y los efectos de sonido (mezcla.py) leen ese mismo archivo,
así que mover aquí un tiempo lo mueve en imagen y en sonido a la vez.
"""
import json, wave
from pathlib import Path
import numpy as np
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parent.parent
VO = ROOT / "public" / "vo"
SR = 48000

# ---- Inicio (s) de cada frase de la locución ----
VO_START = {
    "q": 0.5, "intro": 4.45, "fact": 10.4, "mail": 13.2, "stock": 16.5,
    "ia": 20.45, "menos": 24.55, "mas": 26.5,
    "brand": 29.45, "claim1": 31.0, "claim2": 32.95,
}
TOTAL = 36.4

# ---- Escenas: [inicio, fin] (se solapan para las transiciones) ----
SCENES = {
    "s1": [0.0, 4.35], "s2": [4.05, 9.45], "s3": [9.15, 16.3],
    "s4": [16.0, 20.45], "s5": [20.15, 28.55], "s6": [28.2, TOTAL],
}

# ---- Eventos clave (s, absolutos). Los usan imagen y sonido. ----
EV = {
    "s1_dot": 0.15, "s1_net": 0.45, "s1_text1": 1.05, "s1_text2": 1.55,
    "s2_whoosh": 4.05, "s2_logo": 4.75, "s2_sub": 6.0, "s2_links": 6.6, "s2_web": 7.3,
    "s3_whoosh": 9.15, "s3_pdf": [9.6, 9.85, 10.1, 10.35], "s3_scan": 10.6,
    "s3_state": [11.05, 11.45, 11.85, 12.25], "s3_toMail": 12.85,
    "s3_mailIn": [13.25, 13.4, 13.55, 13.7, 13.85], "s3_sort": [14.2, 14.5, 14.8, 15.1, 15.4],
    "s4_whoosh": 16.0, "s4_chart": 16.5, "s4_sync": [17.6, 18.4, 19.2],
    "s5_whoosh": 20.15, "s5_core": 20.55, "s5_nodes": [21.35, 21.95, 22.55, 23.15],
    "s5_menos": 24.5, "s5_mas": 26.5,
    "s6_line": 28.75, "s6_logo": 29.45, "s6_claim1": 31.0, "s6_claim2": 32.95, "s6_end": 34.65, "s6_web": 33.9,
}


def trim(path):
    with wave.open(str(path)) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if sr != SR:
        from math import gcd
        g = gcd(SR, sr)
        x = resample_poly(x, SR // g, sr // g)
    env = np.convolve(np.abs(x), np.ones(480) / 480, mode="same")
    idx = np.where(env > 0.012)[0]
    a = max(idx[0] - int(0.03 * SR), 0)
    b = min(idx[-1] + int(0.08 * SR), len(x))
    return x[a:b]


durs = {}
(VO / "trim").mkdir(exist_ok=True)
for k in VO_START:
    y = trim(VO / f"{k}.wav")
    durs[k] = round(len(y) / SR, 3)
    with wave.open(str(VO / "trim" / f"{k}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())

keys = list(VO_START)
for a, b in zip(keys, keys[1:]):
    end = VO_START[a] + durs[a]
    assert end + 0.15 <= VO_START[b], f"la frase '{a}' (acaba en {end:.2f}s) se pisa con '{b}'"
assert VO_START[keys[-1]] + durs[keys[-1]] < TOTAL - 0.6

vo = {k: {"start": VO_START[k], "end": round(VO_START[k] + durs[k], 3)} for k in keys}
json.dump({"total": TOTAL, "vo": vo, "scenes": SCENES, "ev": EV},
          open(ROOT / "src" / "timeline.json", "w"), indent=1)
for k in keys:
    print(f"{k:7s} {vo[k]['start']:6.2f} → {vo[k]['end']:6.2f}")
