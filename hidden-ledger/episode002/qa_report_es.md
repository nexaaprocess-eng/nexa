# Informe de QA — Hidden Ledger · Episodio 002 «How Supermarkets Make Money on Tiny Margins»

Fecha: 27-10-2026. Todos los valores se **midieron sobre el archivo exportado** (ffprobe, ffmpeg, `python/av_check.py`, `python/stem_check.py`, `python/content_check.py`, `python/final_scan.py`). Datos crudos en `diagnostics/` (`ep002_final_ffprobe.json`, `final_scan_hidden_ledger_episode_002_FINAL_1080p.json`, `av_check_…json`, `content_check_…json`, `stem_check_ep002_full.json`, `ep002_splice_check.json`, `ep002_final_frames/`).

## 1. Ubicación
| Archivo | Ruta |
|---|---|
| Vídeo final (subir este) | `hidden-ledger/episode002/hidden_ledger_episode_002_FINAL_1080p.mp4` (678,8 MB) |
| Copia para compartir (<400 MiB) | `hidden-ledger/episode002/hidden_ledger_episode_002_FINAL_1080p_share.mp4` (379,3 MiB) |
| Subtítulos inglés | `episode002/hidden_ledger_episode_002.srt` (147 bloques) |
| Miniaturas 1280×720 | `episode002/thumbnail_option_A.png` (recomendada), `thumbnail_option_B.png` |
| Título, descripción, capítulos, fuentes | `episode002/youtube_upload_package.md` |
| Fuentes, verificación y licencias | `episode002/sources.md` |
| Tabla de verificación (afirmación → segmento → fuente → método) | `episode002/fact_check.md` (+ `fact_check.csv`) |

Los MP4 no están en GitHub (límite de 100 MB); se regeneran con `npm run final:002`.

## 2. Archivo final
| Propiedad | Valor medido |
|---|---|
| Duración | **9:59,5** (599,533 s; vídeo y audio iguales) |
| Resolución / fps | **1920×1080, 30 fps** constantes, 16:9 |
| Fotogramas | **17.986 / 17.986** esperados por la línea de tiempo de la narración |
| Vídeo | H.264 High @ L4.2, yuv420p, BT.709, GOP cerrado de 15, dos pasadas |
| Bitrate | **8,80 Mbps** de vídeo (9,06 Mbps total). Objetivo 10 Mbps: x264 gasta menos en gráficos planos; dentro del rango pedido de 8–12 Mbps |
| Audio | **AAC-LC, 48 kHz, estéreo, 253 kbps** |
| Origen | renderizado desde las composiciones originales a 1080p; **sin reescalado** y sin preview de 720p |
| Copia para compartir | mismos 17.986 fotogramas y la misma mezcla, 5,05 Mbps; **SSIM 0,9997** frente al máster |

## 3. Comprobaciones superadas (sobre el MP4 final)
| Comprobación | Resultado |
|---|---|
| Decodificación completa con ffmpeg | **0 errores** |
| Negro (`blackdetect` ≥0,5 s) | **0 ventanas**. En una versión anterior detectó 1,1 s casi negro en 0:35; se corrigió. |
| Congelados (`freezedetect` ≥3 s) | **ninguno** |
| Silencios (≥1,5 s a −50 dB) | **ninguno** |
| Pantalla casi vacía (`content_check.py`, 2 fps, sin franjas de HUD y subtítulos) | **0 tramos**. Una versión anterior tenía 4 s casi vacíos en 4:20; se corrigió. |
| Sonoridad | **−15,3 LUFS** integrados (objetivo −16 a −14), LRA 3,2 LU |
| True peak | **−2,3 dBTP** (límite ≤ −1,5) |
| Clipping | **no** (pico de muestra −2,35 dBFS) |
| Sincronía A/V (correlación con la mezcla sin pérdidas a 0:05, 5:00, 9:34) | **0,0 / 0,0 / 0,0 ms**: sin desfase ni deriva |
| Transiciones | cortinilla en los 9 cambios de escena, ~0,14 s antes de cada inicio (posición diseñada) |
| Inteligibilidad (Whisper sobre el audio del MP4) | **1,4 % WER** (narración seca: 1,0 %) |
| Empalmes entre trozos (render por escenas) | 6 fotogramas frontera comparados con fotogramas renderizados de nuevo: 47–49 dB PSNR. Un desplazamiento de 1 fotograma da ~26 dB. **Empalmes exactos.** |
| Voz frente a música (en ventanas con voz) | mediana **26,0 dB** de separación, percentil 5 16,3 dB, mínimo 9,0 dB; música −23 dB bajo la voz con ducking anticipado de 150 ms |
| Voz | 59 segmentos, 0 recortados, 0 cortes. Un segmento (s10-03) se regeneró al ajustar el texto. |
| Texto en pantalla | `text_lint.py`: 0 textos HTML <26 px. Subtítulos de 50 px. Cifras clave de 84–220 px. |
| Hechos | 33 afirmaciones enlazadas a segmento y fuente. `write_docs.py`: «claim/visual link check: OK». |

### Revisión visual de fotogramas
Revisé fotogramas exportados del propio MP4: apertura (0, 3, 6, 9,5 s), zona de 3–8 min (diez instantes) y final (9:45 y último segundo). Además revisé 66 fotogramas de revisión de todas las escenas (`diagnostics/ep002_sheets*`).

Lo encontrado y corregido antes de la entrega:
- El primer fotograma estaba vacío (fundido de entrada).
- Textos sobre los subtítulos en las escenas 1 y 3.
- Fachadas recortadas en las escenas 2 y 6.
- El cartel «AISLE 7» tapaba la cabecera.
- Una etiqueta del waterfall estaba solapada.
- Títulos desbordados.
- El contador «+0 turns».
- 4 s sin contenido antes de la fórmula de rotación.
- 1 s casi negro en «Tiny margins».

La zona de 3–8 min no usa tarjetas fijas repetidas. Contiene:
- una caja escaneando la cesta;
- el waterfall de beneficio de la cesta, construido producto a producto;
- un plano continuo: camión → almacén → estantería que se repone y se vacía;
- carriles de «vueltas por año», un calendario de 30 días y el bucle camión–estante–caja;
- balanzas de cuentas por pagar frente a inventario;
- la línea temporal hipotética de la factura de pasta;
- flechas de pagos de proveedores y un travelling por un pasillo;
- la estantería de marca propia;
- cuatro viñetas de merma, cajas de fruta y la rebaja frente a la basura.

## 4. Datos (resumen)
- Se usan los informes anuales más recientes (10-K):
  - Kroger: año fiscal 2025, cerrado el 31-01-2026.
  - Walmart: año fiscal 2026, cerrado el 31-01-2026.
  - Costco: año fiscal 2026, cerrado el 30-08-2026.
- Sí existen cifras más nuevas que las de referencia del encargo:
  - Walmart: 24,2 % / 4,2 % (antes 24,1 % / 4,4 %).
  - Costco: 11,09 % y 5.907 M$ en cuotas (antes 11,12 % y 5.323 M$).
  - Las cifras anteriores también se comprobaron y quedan documentadas.
- Todas las cifras de empresa se leyeron en el 10-K y se cotejaron con SEC XBRL.
- El margen operativo de Kroger (1,28 %) incluye un cargo de 2.500 M$; se dice en la narración, junto con el 2,62 % del año anterior.
- La cesta, la factura de la pasta y el ejemplo del 2 % son **hipotéticos** y van rotulados en pantalla.
- No se muestran logotipos, productos de marca falsos ni economía por tienda.

## 5. Limitaciones conocidas
- **No he podido escuchar el audio.** La voz, la música y los efectos se evaluaron solo con mediciones (sonoridad, picos, separación voz/música, cortes) y con reconocimiento de voz (WER). Falta una escucha humana: naturalidad de la voz, gusto y nivel de la música, pronunciación de «Kroger», «Costco» y «Kirkland». El ASR las transcribe bien, pero eso no garantiza que suenen naturales.
- Conviene verlo una vez en un móvil para juzgar el ritmo.
- El dato del USDA es antiguo (datos de 2010). El propio informe dice que algunos usuarios lo consideran alto, y se indica en pantalla.
- La comparación de márgenes del 24 % y el 11 % se presenta como modelos distintos, no como un ranking.
- Subtítulos: 10 de 250 líneas superan los 42 caracteres (máx. 54). Se leen bien quemados en el vídeo; en YouTube el reproductor vuelve a partir las líneas.
- Los capítulos están redondeados al segundo.
- La música procedural no garantiza la ausencia de reclamaciones de Content ID; revísalo en Studio tras subir el vídeo.
- La licencia de Remotion es gratuita solo para particulares o empresas de ≤3 empleados.
- No se ha subido nada a YouTube.

## 6. Cambios de infraestructura reutilizables (corrigen fallos del Ep. 001)
1. **Render por escena con caché por hash de contenido y reanudación.** El hash cubre el código compartido, el archivo de la escena y el de la siguiente (por la cortinilla), el tramo de props y los ajustes. Cada trozo se escribe de forma atómica y se verifica su número de fotogramas.
   - Las tres rondas de correcciones re-renderizaron solo 2–3 escenas de 10, unos 5 min cada vez.
   - Un reinicio del contenedor no hizo perder trabajo.
2. **Codificación reanudable** (`encode`) y **copia para compartir automática** por debajo de 380 MiB.
3. **Comando `deliver`**: reúne en `episodeXXX/` el MP4 (enlace duro), el SRT, las miniaturas, las fuentes y la tabla de verificación.
4. **`content_check.py`**: detector de pantallas casi vacías pensado para la paleta oscura (blackdetect solo no servía en el Ep. 001). En este episodio detectó un hueco real de 4 s.
5. **`final_scan.py`**: una sola pasada para decodificación completa, negro, congelados, silencios, LUFS, true peak y clipping.
6. **`text_lint.py`** (texto <26 px) y **`fact_table.py`** (tabla de verificación en Markdown).
7. **TTS**: los céntimos se leen bien («$1.28» → «one dollar and twenty-eight cents»).
8. `SceneShell fadeIn={false}`: el primer fotograma de un episodio nunca está vacío.
9. **Miniaturas por episodio** (`Thumbnail` con registro por episodio).
10. **Kit de supermercado reutilizable**: `src/components/grocery.tsx`.
11. **Herramientas y sonido**:
    - `stills.mjs` admite fotogramas exactos (`f1234`);
    - `stem_check` escribe un archivo por episodio (antes sobrescribía el del Ep. 001);
    - nuevos efectos de escáner y caja registradora.

## 7. Reproducir
```powershell
npm run final:002      # audio → render por escenas (con caché) → codificación → QA
node scripts/pipeline.mjs deliver --episode 002
```
Tiempos medidos en esta máquina (CPU):
- render completo a 1080p ≈ 17 min (unos 15 fps);
- codificación del máster ≈ 12 min y de la copia ≈ 12 min;
- QA ≈ 8 min.
