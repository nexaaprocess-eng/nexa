# Vídeo de marketing de NEXA Process

Vídeo de unos 85 segundos en Full HD (1920×1080), con voz en off en español y música de fondo suave.

- `guion.json`: texto de la locución de cada escena (y su duración, que se rellena al generar la voz).
- `template.html`: diseño y animaciones de las escenas.
- `build.py`: sincroniza las animaciones con la voz y genera `video.html`.
- `frames.js`: captura el vídeo fotograma a fotograma con Chromium.

## Cómo regenerarlo

1. Voz: [Piper](https://github.com/rhasspy/piper) con la voz `es_ES-davefx-medium`, un archivo `vo_<escena>.wav` por escena.
2. `python3 build.py` (genera `video.html` y `timing.json`).
3. `node frames.js $PWD/video.html $PWD/frames 30` (necesita `playwright-core`).
4. Mezclar la voz en los tiempos de `timing.json` y unir con ffmpeg:
   `ffmpeg -framerate 30 -i frames/f%05d.jpg -i audio.wav -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -shortest nexa-process-video.mp4`

## Versión vertical (TikTok / Instagram Reels)

En `vertical/`: vídeo de unos 32 segundos en 1080×1920, con el texto importante dentro de la zona segura (sin quedar tapado por los botones de la app). Se genera igual, ejecutando `build.py` desde esa carpeta y renderizando con `W=1080 H=1920 node ../frames.js ...`.
