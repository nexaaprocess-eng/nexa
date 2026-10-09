"""Genera la locución (una pista WAV por frase) con Kokoro-82M (licencia Apache 2.0), voz femenina "ef_dora".
Uso: python3 audio-src/voz.py   (desde marketing/promo-reel)
Modelos: voices/kokoro-v1.0.onnx y voices/voices-v1.0.bin
(https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0)"""
import json
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

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

VOICE, SPEED = "ef_dora", 0.94   # algo más pausada que la velocidad por defecto: suena más natural
tts = Kokoro(str(ROOT / "voices" / "kokoro-v1.0.onnx"), str(ROOT / "voices" / "voices-v1.0.bin"))
durs = {}
for key, text in LINES:
    audio, sr = tts.create(text, voice=VOICE, speed=SPEED, lang="es")
    sf.write(OUT / f"{key}.wav", audio, sr, subtype="PCM_16")
    durs[key] = round(len(audio) / sr, 3)
    print(key, durs[key])
json.dump(durs, open(OUT / "durations.json", "w"), indent=1)
