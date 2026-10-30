# Informe de QA: Hidden Ledger · Episodio 004 «How Can Airlines Sell Flights for Just $20?»

**Fecha:** 30-10-2026.

**Cómo se midió:** todos los valores proceden del archivo exportado, con ffprobe, ffmpeg y los scripts `av_check.py`, `stem_check.py`, `content_check.py` y `final_scan.py`.

**Datos crudos** (en `diagnostics/`):
- `hidden_ledger_episode_004_FINAL_1080p_report.json`
- `final_scan_…json`, `av_check_…json`, `content_check_…json`, `stem_check_ep004_full.json`
- `ep004_final_frames/`: 4 fotogramas por escena, 32 en total, más las hojas `sheet_A.jpg` y `sheet_B.jpg`

**Revisión humana:** **no** se ha hecho ninguna revisión humana de imagen ni de escucha. Todo lo que sigue son mediciones automáticas, más mi inspección de fotogramas extraídos del MP4.

## 1. Entregables (carpeta `hidden-ledger/episode004/`)

| Entregable | Archivo |
|---|---|
| Vídeo final (para subir) | `hidden_ledger_episode_004_FINAL_1080p.mp4` (588 MiB) |
| Copia ligera para compartir | `hidden_ledger_episode_004_FINAL_1080p_share.mp4` (378 MiB; mismos fotogramas y audio, menor bitrate) |
| Guion | `episode_004_script.md` |
| Fuentes, método y licencias | `episode_004_sources.md` |
| Tabla de verificación | `fact_check.md` y `fact_check.csv`: 28 afirmaciones, 9 fuentes y 0 segmentos sin enlazar |
| Subtítulos en inglés | `episode_004_subtitles.srt`: 156 bloques |
| 2 miniaturas de 1280×720 | `thumbnail_option_A.png` (recomendada) y `thumbnail_option_B.png` |
| Paquete de publicación | `youtube_upload_package.md`: 3 títulos, descripción, capítulos, fuentes y etiquetas |
| Personaje reutilizable y fuente de la animación | `blender/hl_char.py` (modelo, rig, poses y expresiones), `blender/hl_anim.py` (actuación), `blender/hl_sets.py` (decorados), `blender/shots/ep004.py` (34 planos) |

Los MP4 no se suben a GitHub porque superan los 100 MB. Se regeneran desde el código con los comandos de `CLAUDE.md`.

**No se ha publicado nada.**

## 2. Archivo final

| Propiedad | Valor medido |
|---|---|
| Duración | **8:02,2** (482,2 s). Es lo que pide la historia: 1.410 palabras de narración, dentro del margen de 8–10 min. |
| Resolución y fps | **1920×1080 a 30 fps** constantes |
| Fotogramas | **14.466 de 14.466** esperados por la línea de tiempo |
| Vídeo | H.264 High @ L4.2, yuv420p, BT.709, GOP cerrado de 15, dos pasadas, **9,97 Mbps** |
| Audio | **AAC-LC, 48 kHz, estéreo, 256 kbps** |
| Origen | render directo a 1080p, sin reescalado y sin preview de 720p |

## 3. Comprobaciones

| Comprobación | Resultado |
|---|---|
| Decodificación completa | **0 errores** |
| Negro (`blackdetect`) | **ninguno** |
| Congelados | **ninguno** |
| Silencios largos | **ninguno** |
| Pantalla casi vacía | **0 tramos** (mediana de contenido: 0,74) |
| Sonoridad / pico real | **−15,0 LUFS**, LRA 2,8 LU / **−2,4 dBTP** |
| Clipping | **no** (pico de muestra −2,39 dBFS) |
| Sincronía A/V a 0:05, 4:01 y 7:37 | **0,0 / 0,0 / 0,0 ms**; correlación 0,98. Sin desfase ni deriva. |
| Duración vídeo = audio = línea de tiempo | sí: 482,2 s, empezando ambos en 0 |
| Cortes de escena frente a la narración | los 7 cortes caen a **≤ 17 ms** (medio fotograma) del inicio previsto de cada escena |
| Inteligibilidad (Whisper sobre el MP4 final) | **3,2 % WER**, casi todo por la forma de escribir cifras y moneda |
| Voz | 61 segmentos; 0 cortes y 0 recortados; pausas entre 0,5 y 1,3 s, como estaban configuradas |
| Voz frente a música | mediana **25,9 dB** por encima de la música; percentil 5: 15,0 dB. El mínimo, 7 dB, aparece en finales de palabra suaves (0:16, 0:53, 1:12) y no en mitad de frases. |
| Efectos de sonido | pico 16,7 dB por debajo del pico de la voz |
| Cifras | las 28 afirmaciones numéricas están enlazadas a una cita literal y a una fuente primaria. `write_docs.py` falla si alguna cifra no está enlazada. |

`av_check` marca «7 cambios de escena fuera de ±0,2 s». Es un **falso positivo**: el detector busca la cortinilla naranja de los episodios 001–003, y el 004 usa cortes secos (`"transitions": "cut"`). Por eso volví a medir los cortes con `scdet`, y el resultado es la fila «Cortes de escena» de la tabla.

## 4. Correcciones hechas durante el QA

**Planos 3D:**
- **Cola y winglets del avión con forma de hoja.** La subdivisión redondeaba una sección de 4 vértices. Se corrigió con `crisp_tail()`, solo en los planos afectados.
- **Cola cortada en el plano sh12.** Se cambió el encuadre.
- **Costuras en los bordes del recorte del personaje y sombras duplicadas.** Los objetos estáticos sombreaban dos veces: en el fondo y en la capa del personaje. Se corrigió así:
  - nueva regla de «decorado abierto»;
  - los parámetros `static_shadows` y `floor_shadows`;
  - un fundido de 32 px en los bordes del recorte.
  - Tras volver a renderizar, la diferencia medida en el borde del recorte frente al fondo es **0** en todos los planos.
- **El compuesto oscurecía el recorte en 16 niveles de luma** por la conversión YUV. Se fuerza RGB planar (gbrap), y los planos afectados se volvieron a componer.
- Personajes sentados (sh19 y sh31): ya no atraviesan el asiento con la mochila.

**Textos superpuestos**, detectados en los fotogramas del MP4 final y corregidos antes de la exportación definitiva:
- La cronología de Spirit pisaba el panel de salidas. Ahora va en un panel compacto a la izquierda.
- En el panel de salidas, la hora se pegaba al nombre de la ciudad.
- La etiqueta «€253» salía cortada por arriba.
- El subtítulo tapaba «easyJet» e «IAG».

**Pipeline:** el paso `render` no terminaba porque el servidor local de archivos seguía abierto. Ahora se cierra al acabar.

## 5. Limitaciones reales (sin maquillar)

- **Animación.** El personaje es un modelo 3D procedural con rig propio, dirigido por código: poses suavizadas, ciclo de andar, respiración, miradas, parpadeos y 12 expresiones.
  - **No** tiene el nivel de animación de una película de estudio.
  - Los personajes se animan «a dos» (12–15 poses por segundo, sobre un fondo a 30 fps). Algunos gestos se ven mecánicos.
  - No hay captura de movimiento ni animación de cara más allá de cejas y ojos.
- **Calidad de render.** La capa del personaje usa 4 muestras por píxel con desruido.
  - En los planos muy cerrados, el contorno de la cabeza puede mostrar un ligero escalonado, porque esos planos se renderizan al 67 % y se reescalan.
  - En los planos generales el protagonista es pequeño.
- **Sombras.** En los decorados abiertos los objetos estáticos no proyectan sombra sobre el personaje, para evitar sombras dobles. En sh19 y sh31 el suelo no recibe la sombra del personaje sentado. Son decisiones deliberadas, pero sí son simplificaciones.
- **Narración.**
  - La frase «Fuel alone is close to half of that bill» redondea el 41 % que se acaba de decir. Se dejó así porque reescribirla movería todos los tiempos.
  - La voz es sintética (Chatterbox) y lleva la marca de agua inaudible «Perth» de Resemble.
- **Ejemplos ilustrativos.** El vuelo de $20, la compra de $92, las webs y aerolíneas ficticias y la escalera de precios son inventados, y se rotulan como tales en pantalla y en la narración. Ver `youtube_upload_package.md`.
- **Música y efectos** generados por código (`python/music.py`), sin pistas con licencia de terceros.

## 6. Pendiente para una persona

Ver y escuchar el vídeo completo antes de publicarlo. En particular conviene revisar:
- la naturalidad de la voz;
- el volumen de la música en 0:16–1:15;
- la legibilidad de los textos en móvil;
- qué miniatura de las dos se prefiere.
