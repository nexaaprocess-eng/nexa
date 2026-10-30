# Informe de QA: Hidden Ledger · Episodio 003 «Why Every App Wants a Subscription»

Fecha: 28-10-2026. Todos los valores se **midieron sobre el archivo exportado** con ffprobe, ffmpeg y los scripts `av_check.py`, `stem_check.py`, `content_check.py` y `final_scan.py`. Los datos crudos están en `diagnostics/`:
- `ep003_final_ffprobe.txt`, `final_scan_hidden_ledger_episode_003_FINAL_1080p.json`;
- `av_check_…json`, `content_check_…json`, `stem_check_ep003_full.json`;
- `ep003_splice_check.json`;
- `ep003_final_frames/`, `ep003_sheets*/`.

## 1. Ubicación (carpeta `hidden-ledger/episode003/`)
| Entregable | Archivo |
|---|---|
| Vídeo final (para subir) | `hidden_ledger_episode_003_FINAL_1080p.mp4` (761,5 MB) |
| Copia para compartir | `hidden_ledger_episode_003_FINAL_1080p_share.mp4` (378,6 MiB; mismos fotogramas y audio; SSIM 0,9996 frente al máster) |
| Subtítulos (inglés) | `episode_003_subtitles.srt` (178 bloques) |
| Guion | `episode_003_script.md` |
| Fuentes, verificación y licencias | `episode_003_sources.md` |
| Tabla de verificación | `fact_check.md` (+ `fact_check.csv`): 29 afirmaciones → segmento de narración → fuente → método |
| Miniaturas 1280×720 | `thumbnail_option_A.png` (recomendada), `thumbnail_option_B.png` |
| 3 títulos, descripción, capítulos, fuentes y etiquetas | `youtube_upload_package.md` |

Los MP4 no se suben a GitHub (pesan más de 100 MB); se regeneran con `npm run final:003` o `node scripts/pipeline.mjs final --episode 003`.

## 2. Archivo final
| Propiedad | Valor medido |
|---|---|
| Duración | **11:08,9** (668,9 s), dentro del objetivo de 10–12 min |
| Resolución / fps | **1920×1080, 30 fps** constantes |
| Fotogramas | **20.067 / 20.067** esperados por la línea de tiempo de la narración |
| Vídeo | H.264 High @ L4.2, yuv420p, BT.709, GOP cerrado de 15, codificado en dos pasadas |
| Bitrate | **8,85 Mbps** de vídeo, 9,11 Mbps en total (pedido: 8–12) |
| Audio | **AAC-LC, 48 kHz, estéreo, 253 kbps** |
| Origen | renderizado a 1080p desde el código Remotion original; sin reescalado y sin preview de 720p |

## 3. Comprobaciones superadas
| Comprobación | Resultado |
|---|---|
| Decodificación completa | **0 errores** |
| Congelados (≥3 s) | **ninguno**. La primera exportación tenía 6 (escenas 2 y 3, planos totalmente quietos); se corrigieron (§5). |
| Pantalla casi vacía (`content_check`) | **0 tramos**. Antes había 2; se corrigieron. |
| Negro (`blackdetect` ≥0,5 s) | 1 ventana de 0,50 s en 5:37,4: es la cortinilla oscura de la transición hacia la escena 6, justo en el umbral del detector. Las otras dos ventanas que había se corrigieron. |
| Silencios (≥1,5 s) | **ninguno** |
| Sonoridad / pico real | **−15,3 LUFS**, LRA 3,3 LU / **−2,4 dBTP** (límite −1,5) |
| Clipping | **no** (pico de muestra −2,48 dBFS) |
| Sincronía A/V a 0:05, 5:34 y 10:44 | **0,0 / 0,0 / 0,0 ms**: sin desfase ni deriva |
| Inteligibilidad (Whisper sobre el MP4) | **1,1 % WER** (narración sola: 1,3 %, casi todo por formato de cifras) |
| Empalmes entre trozos | 6 fotogramas frontera: 47–49 dB PSNR frente a ~26 dB si hubiera 1 fotograma de desfase. **Exactos.** |
| Voz | 63 segmentos, 0 recortados, 0 cortes, pausas iguales a las configuradas |
| Voz frente a música | mediana **26 dB** por encima de la música, percentil 5: 16,3 dB, con ducking anticipado |
| Efectos de sonido | 37 efectos anclados a palabras, todos encontrados; 66 eventos en total |
| Texto | `text_lint`: 0 textos menores de 26 px fuera de las pantallas de móvil. Dentro de los móviles los textos se ampliaron hasta que se leen bien (§5). |
| Hechos | `write_docs.py`: «claim/visual link check: OK». Cada cifra de la narración está enlazada a una afirmación y a su fuente. |

## 4. Variedad visual (el principal cambio frente a los episodios 1 y 2)
- **Móviles con interfaces de apps ficticias**, de fondo claro: notificaciones de renovación, lista de suscripciones, paywalls, pantalla de renovación, comparación entre plan gratuito y de pago.
- **Escena histórica en estilo papel crema**: estantería con libros y cajas de software, recibo, actualizaciones, contratos de soporte de Oracle que se renuevan, calendario que salta a mayo de 2013, caja «Creative Suite 6» sellada.
- **Metáforas físicas**:
  - torres de bloques de Adobe, con la cámara alejándose para revelar 2025;
  - pilas de monedas que se encogen;
  - carrera de dos empresas con multitudes de clientes;
  - cubo que gotea para MRR, churn, retención, CAC y LTV;
  - horizonte de edificios con los ingresos de las apps;
  - carretera en la que los suscriptores abandonan durante un año;
  - barra de presupuesto en la que una suscripción nueva expulsa a otra;
  - embudos de descargas, tarro que se llena día a día;
  - tarjeta rechazada, laberinto de cancelación;
  - río de ingresos de Spotify que se divide.
- **Revisión de la zona de 3–8 min**: cada segmento de narración tiene una composición distinta, sin tarjetas fijas repetidas. Se revisaron 64 fotogramas, uno por segmento, más 16 del MP4 final.

## 5. Problemas encontrados y corregidos antes de entregar
- **Composición**:
  - móviles que invadían los subtítulos;
  - textos superpuestos al marco, a la leyenda, a las fuentes o a otros textos (escenas 1, 3, 4, 5, 6, 7 y 8);
  - cuadrícula de 147 iconos que se salía de la pantalla;
  - torre de 2025 cortada al alejar la cámara;
  - etiquetas ilegibles en el plano general (se añadieron etiquetas grandes en pantalla).
- **Texto pequeño dentro de los móviles**: nombres y precios de las apps a unos 18–22 px; se ampliaron, y los nombres que se cortaban caben enteros.
- **Huecos y planos quietos**:
  - 4 inicios de bloque con pantalla casi vacía o negra (escenas 3, 6 y 9);
  - 6 planos congelados ≥3 s (escenas 2 y 3).
  - Se añadió un leve movimiento de cámara reutilizable (`Camera sway`) y el contenido aparece desde el primer fotograma de cada bloque.
- **Sincronía**: un texto aparecía 1,2 s tarde respecto a la frase («Most subscriptions…»); ahora se ancla a la palabra correcta.
- **Pronunciación**: en s06-01, «whose software» sonaba como «who software» en el ASR. La frase se reescribió y solo se regeneró ese segmento; los otros 62 vienen de la caché.

## 6. Limitaciones conocidas
- **No he podido escuchar el audio.** Voz, música y efectos solo se han comprobado con mediciones y reconocimiento de voz. Falta una escucha humana: naturalidad de la voz, gusto y nivel de la música, pronunciación de «RevenueCat», «Adobe» y «Spotify».
- La revisión visual se hizo sobre fotogramas fijos, no viendo el vídeo en movimiento. Conviene verlo una vez entero en un móvil.
- **Datos de RevenueCat**: solo cubren apps que usan RevenueCat y la propia empresa vende infraestructura de suscripciones. Ambas cosas se dicen en el vídeo.
- **Formas ilustrativas**: las alturas intermedias del «horizonte» de apps y la forma de las curvas de abandono de las apps con IA son ilustrativas. Solo la mediana, el umbral del 10 % superior, el +41 % y el ~30 % son datos. Se indica en pantalla.
- **Adobe**: el vídeo aclara que no todo su crecimiento se debe al cambio a suscripciones.
- **Spotify** se presenta explícitamente como servicio de streaming, no como app típica.
- 9 de 294 líneas de subtítulos superan los 42 caracteres (máx. 52). YouTube las vuelve a partir.
- Algunos iconos usan emoji (fuente Noto Color Emoji del contenedor); en otro ordenador podrían verse algo distintos.
- La música procedural no garantiza la ausencia de reclamaciones de Content ID.
- Licencia de Remotion: gratuita solo para particulares o empresas de ≤3 empleados.
- No se ha subido nada a YouTube.

## 7. Infraestructura reutilizable añadida en este episodio
- `src/components/apps.tsx`, kit reutilizable:
  - apps ficticias, móvil con pantalla HTML nítida;
  - filas de suscripción, notificaciones, paywall, toque con onda, tarjeta de pago;
  - fondo de papel;
  - **cámara con fotogramas clave** (`Camera`, con `sway` opcional contra planos congelados);
  - figuras para multitudes.
- `final_scan.py` ahora detecta también congelados, y el paso `qa` lo ejecuta junto a `content_check`. Gracias a eso se detectaron y corrigieron los problemas de §5.
- `deliver` genera los nombres de entrega `episode_XXX_subtitles.srt`, `episode_XXX_script.md` y `episode_XXX_sources.md`.
- `stills.mjs` admite fotogramas exactos (`f1234`), lo que permite la comprobación de empalmes.
- Nuevos efectos de sonido: `chime`, `buzz` y `decline`.
- **Caché por escena**: al tocar solo una escena se re-renderiza esa (y la anterior, por la transición). Al tocar un componente compartido se invalida todo, como debe ser.
- **Tiempos medidos (CPU, 4 hilos)**:

  | Paso | Tiempo |
  |---|---|
  | Narración (63 segmentos) | ≈ 8 min (luego, caché) |
  | Render 1080p completo | ≈ 20 min |
  | Máster + copia | ≈ 25 min |
  | QA | ≈ 8 min |
