# TikToks de Expediente Rojo: voz en off

- `guion.json`: texto de la locución de cada TikTok, una frase por escena, con el segundo en que aparece el texto en pantalla.
- `voz.py`: genera la voz (Edge TTS, voz `es-ES-AlvaroNeural`), la ajusta para que cada frase quepa en su escena y la mezcla con el vídeo (normalizada a -14 LUFS, el nivel de TikTok).

## Cómo regenerarlo

```bash
pip install edge-tts   # además necesita ffmpeg
python3 voz.py <carpeta_con_los_mp4_originales> <carpeta_salida>
```

Los vídeos se emparejan con el guion por nombre (`01_reto_gratis`, `02_quien_miente`…). Si una frase no cabe en su escena, se acelera un poco; para que suene natural es mejor acortar el texto en `guion.json`.
