"""Pone voz en off a los TikToks de Expediente Rojo.

Uso: python3 voz.py <carpeta_con_los_mp4> <carpeta_salida>
Necesita ffmpeg y `pip install edge-tts`. Lee el texto de guion.json.
"""
import asyncio, json, os, ssl, subprocess, sys, tempfile
from pathlib import Path

import edge_tts
import musica
if os.environ.get("TTS_CA_BUNDLE"):  # proxy con certificado propio
    import edge_tts.communicate as C
    C._SSL_CTX = ssl.create_default_context(cafile=os.environ["TTS_CA_BUNDLE"])

VOZ = "es-ES-AlvaroNeural"
LEAD = 0.05   # retraso de la voz respecto al inicio de la escena
MUSICA_DB = -9   # volumen de la música respecto a la voz
GAP = 0.1     # margen mínimo antes de la escena siguiente
GUION = json.load(open(Path(__file__).with_name("guion.json")))


def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))


def tts(text, out, rate):
    asyncio.run(edge_tts.Communicate(text, VOZ, rate=f"{rate:+d}%", pitch="-4Hz").save(str(out)))
    # quita el silencio inicial y final que añade el sintetizador
    trimmed = out.with_suffix(".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                    "-ar", "48000", "-ac", "1", str(trimmed)], check=True)
    return trimmed


def build(video, name, outdir, tmp):
    total = dur(video)
    segs = GUION[name]
    inputs, filters = [], []
    for i, (t, text) in enumerate(segs):
        last = i + 1 == len(segs)
        slot = (total if last else segs[i + 1][0]) - t - LEAD - (0.15 if last else GAP)
        rate = 0
        while True:
            wav = tts(text, tmp / f"{name}_{i}.mp3", rate)
            d = dur(wav)
            if d <= slot or rate >= 30:
                break
            rate += 6
        tempo = d / slot if d > slot else 1.0
        print(f"  {t:6.2f}s  {d:4.2f}/{slot:4.2f}s  rate {rate:+d}%{f'  tempo {tempo:.2f}' if tempo > 1 else ''}  {text}")
        inputs += ["-i", str(wav)]
        delay = int((t + LEAD) * 1000)
        filters.append(f"[{i + 1}:a]atempo={tempo:.3f},adelay={delay}[a{i}]")
    mix = "".join(f"[a{i}]" for i in range(len(segs)))
    # música de suspense, que baja de volumen cuando habla la voz
    music = tmp / f"{name}_musica.wav"
    musica.make(total, [t for t, _ in segs], music)
    m = len(segs) + 1
    filters.append(f"{mix}amix=inputs={len(segs)}:normalize=0,aformat=channel_layouts=stereo,apad,asplit[voz][clave]")
    filters.append(f"[{m}:a]volume={MUSICA_DB}dB[mus]")
    filters.append("[mus][clave]sidechaincompress=threshold=0.02:ratio=5:attack=15:release=350[musb]")
    filters.append("[voz][musb]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[vo]")
    out = outdir / f"{name}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), *inputs, "-i", str(music),
                    "-filter_complex", ";".join(filters), "-map", "0:v", "-map", "[vo]",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{total}",
                    "-movflags", "+faststart", str(out)], check=True)
    return out


if __name__ == "__main__":
    src, outdir = Path(sys.argv[1]), Path(sys.argv[2])
    outdir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for video in sorted(src.glob("*.mp4")):
            name = next((k for k in GUION if k in video.stem), None)
            if not name:
                print(f"(sin guion) {video.name}")
                continue
            print(name)
            build(video, name, outdir, Path(tmp))
