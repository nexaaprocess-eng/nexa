"""Genera la locución (una pista WAV por frase) con Piper, voz es_ES-davefx-medium (CC0).
Uso: python3 audio-src/voz.py   (desde marketing/promo-reel)"""
import json, wave
from pathlib import Path
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "vo"
OUT.mkdir(parents=True, exist_ok=True)

# "Process" se escribe "Próses" para que se pronuncie como en España (/ˈpɾoses/), no /pɾoθes/.
LINES = [
    ("q",      "¿Y si tu empresa pudiera hacer en segundos, lo que hoy le lleva horas?"),
    ("intro",  "En Nexa Próses, conectamos tus herramientas, y automatizamos los procesos que frenan tu negocio."),
    ("fact",   "Facturas que se clasifican solas."),
    ("mail",   "Correos que se organizan automáticamente."),
    ("stock",  "Tu stock, bajo control."),
    ("ia",     "Y soluciones con inteligencia artificial, que trabajan para ti."),
    ("menos",  "Menos tareas repetitivas."),
    ("mas",    "Más tiempo para crecer."),
    ("brand",  "Nexa Próses."),
    ("claim1", "Automatizamos el trabajo."),
    ("claim2", "Impulsamos tu negocio."),
]

voice = PiperVoice.load(str(ROOT / "voices" / "es_ES-davefx-medium.onnx"))
cfg = SynthesisConfig(length_scale=1.0, noise_scale=0.6, noise_w_scale=0.75)
durs = {}
for key, text in LINES:
    p = OUT / f"{key}.wav"
    with wave.open(str(p), "wb") as w:
        voice.synthesize_wav(text, w, syn_config=cfg)
    with wave.open(str(p)) as w:
        durs[key] = round(w.getnframes() / w.getframerate(), 3)
    print(key, durs[key])
json.dump(durs, open(OUT / "durations.json", "w"), indent=1)
