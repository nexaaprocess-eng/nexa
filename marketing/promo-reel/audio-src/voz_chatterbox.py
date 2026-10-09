"""Locución masculina y enérgica con Chatterbox Multilingual (Resemble AI, licencia MIT).

- Acento de España: se toma de public/vo/ref_es.wav, una muestra generada con la voz Piper
  es_ES-davefx-medium (dataset CC0). No se clona a ninguna persona real.
- `exaggeration` sube la intensidad/expresividad; `cfg_weight` bajo da un ritmo más ágil.
- Para cada frase se generan varias tomas; se transcriben con Whisper y se elige la que dice
  exactamente el texto y cabe en su hueco del vídeo (ver audio-src/timeline.py).

Necesita un entorno aparte con torch:  python3 -m venv /ruta/cbx && /ruta/cbx/bin/pip install chatterbox-tts openai-whisper
Uso (desde marketing/promo-reel):  /ruta/cbx/bin/python audio-src/voz_chatterbox.py
Revisa siempre public/vo/chatterbox_report.json: si una frase sale "DIFERENTE", vuelve a generarla.
"""
import json, re, subprocess, unicodedata
from pathlib import Path
import torch, torchaudio as ta, whisper
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "vo"
REF = OUT / "ref_es.wav"
TAKES = 3

# (clave, texto, duración máxima en s para no pisar la frase siguiente)
LINES = [
    ("q",      "¿Y si tu empresa pudiera hacer en segundos lo que hoy le lleva horas?", 3.75),
    ("intro",  "En Nexa Próses automatizamos los procesos de tu empresa, para que ahorres tiempo y dinero.", 5.75),
    ("fact",   "Facturas que se procesan solas.", 2.6),
    ("mail",   "Correos que se organizan automáticamente.", 3.1),
    ("stock",  "Tu stock, siempre bajo control.", 3.0),
    ("ia",     "Todo conectado y funcionando solo, mientras tú ahorras tiempo y dinero.", 4.1),
    ("menos",  "¡Menos tareas repetitivas!", 1.8),
    ("mas",    "¡Más tiempo para crecer!", 1.85),
    ("brand",  "Néksa Prósess.", 1.4),  # esta grafía es la que mejor pronuncia la marca
    ("claim1", "Automatizamos el trabajo.", 1.8),
    ("claim2", "Impulsamos tu negocio.", 2.4),
]


def words(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.findall(r"[a-zñ]+", s.replace("proses", "process").replace("nexa", ""))


def speech_len(path):
    w, sr = ta.load(str(path))
    e = torch.nn.functional.avg_pool1d(w.abs()[None], 480, 1, 240)[0, 0]
    idx = torch.nonzero(e > 0.012)
    return (idx[-1] - idx[0]).item() / sr if len(idx) else 0


import sys
ONLY = set(sys.argv[1:])  # opcional: claves a regenerar (p. ej. intro fact); sin argumentos, todas
tts = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
asr = whisper.load_model("small")
rp = OUT / "chatterbox_report.json"
report = json.load(open(rp)) if ONLY and rp.exists() else {}
for key, text, max_d in LINES:
    if ONLY and key not in ONLY:
        continue
    best = None
    for take in range(TAKES):
        torch.manual_seed(100 + take)
        wav = tts.generate(text, language_id="es", audio_prompt_path=str(REF),
                           exaggeration=0.7, cfg_weight=0.35, temperature=0.75)
        tmp = OUT / f"{key}.take{take}.wav"
        ta.save(str(tmp), wav, tts.sr)
        heard = asr.transcribe(str(tmp), language="es", fp16=False)["text"]
        ok = words(heard) == words(text)
        d = speech_len(tmp)
        score = (ok, d <= max_d, -abs(d - max_d * 0.85))
        print(f"{key} toma {take}: {d:.2f}s (máx {max_d}) {'OK' if ok else 'DIFERENTE'} → {heard.strip()}", flush=True)
        if best is None or score > best[0]:
            best = (score, tmp, d, heard.strip())
    _, tmp, d, heard = best
    final = OUT / f"{key}.wav"
    if d > max_d:  # acelera un poco sin cambiar el tono
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", f"atempo={min(1.12, d / max_d + 0.01):.3f}", str(final)], check=True)
    else:
        tmp.replace(final)
    report[key] = {"heard": heard, "speech_s": round(d, 2)}
    for f in OUT.glob(f"{key}.take*.wav"):
        f.unlink()
json.dump(report, open(OUT / "chatterbox_report.json", "w"), indent=1, ensure_ascii=False)
