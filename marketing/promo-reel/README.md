# Anuncio vertical de NEXA Process (Reels / TikTok)

Vídeo publicitario de ~35 s en **1080 × 1920 (9:16), 60 fps, H.264**, con locución en español de España,
música electrónica y efectos de sonido. El render final está en `output/nexa-process-promo.mp4`
(en la raíz del repositorio).

Todo es programático y editable: animaciones con [Remotion](https://www.remotion.dev) (React + TypeScript),
voz con [Piper](https://github.com/OHF-Voice/piper1-gpl) y música/efectos sintetizados con Python.

## Estructura

```
audio-src/voz.py        Texto de la locución → public/vo/*.wav (Piper, voz es_ES-davefx-medium)
audio-src/timeline.py   Tiempos de TODO el vídeo: frases, escenas y eventos → src/timeline.json
audio-src/mezcla.py     Música + efectos (sintetizados) + mezcla final → public/audio/mix.wav
src/theme.ts            Colores y tipografías de la marca
src/components/         Logo (geometría original de assets/logo.svg), iconos, ventanas, textos animados, fondo
src/scenes/S1…S6        Las seis escenas del storyboard
src/Promo.tsx           Montaje de escenas + audio
scripts/stills.mjs      Saca fotogramas sueltos para revisar
```

| Escena | Tiempo | Contenido |
|---|---|---|
| 1 | 0–4 s | Punto verde → red de nodos → «¿Tu empresa sigue haciéndolo todo a mano?» |
| 2 | 4–9 s | Las partículas forman el logo, módulos conectados, «Automatización + IA» |
| 3 | 9–16 s | Interfaz: facturas PDF analizadas y clasificadas → correo que se organiza solo |
| 4 | 16–20 s | Dashboard de stock: KPIs, ventas, inventario, apps sincronizadas (datos demo) |
| 5 | 20–28 s | Núcleo de IA conectado a documentos, correo, inventario y CRM; «Menos tareas repetitivas» → «Más tiempo para crecer» |
| 6 | 28–35 s | Trazo de la X, logo, «Automatizamos el trabajo. Impulsamos tu negocio.» |

## Cómo modificarlo

Requisitos: Node 18+, Python 3.10+, ffmpeg.

```bash
cd marketing/promo-reel
npm install
pip install piper-tts scipy numpy
python3 -m piper.download_voices es_ES-davefx-medium --download-dir voices   # solo la primera vez
```

- **Cambiar textos en pantalla**: en el archivo de cada escena (`src/scenes/`). Colores en `src/theme.ts`.
- **Cambiar la locución**: edita `LINES` en `audio-src/voz.py` y ejecuta `python3 audio-src/voz.py`.
- **Cambiar tiempos**: edita `VO_START`, `SCENES` y `EV` en `audio-src/timeline.py`. Imagen y sonido se
  mueven juntos porque ambos leen `src/timeline.json`.
- **Previsualizar**: `npm run studio` (abre Remotion Studio en el navegador).

Después de cualquier cambio de voz, tiempos o sonido:

```bash
python3 audio-src/timeline.py    # recorta la voz y recalcula tiempos
python3 audio-src/mezcla.py      # música, efectos y mezcla (-14 LUFS, listo para redes)
npm run render                   # → ../../output/nexa-process-promo.mp4
```

`remotion.config.ts` apunta al Chromium del entorno donde se creó; en otro ordenador borra la línea
`setBrowserExecutable` y Remotion descargará el suyo.

## Licencias de los recursos

- **Voz**: Piper `es_ES-davefx-medium`, dataset con licencia CC0 (uso comercial permitido).
- **Música y efectos**: sintetizados desde cero en `audio-src/mezcla.py`; no hay muestras de terceros.
- **Tipografías**: Montserrat e Inter (SIL Open Font License), vía Fontsource.
- **Logo**: el original de la web (`assets/logo.svg`), en su versión en negativo (letras en blanco) por ir sobre fondo oscuro.
- Los nombres de empresas, facturas y cifras de las interfaces son ficticios y de demostración.
