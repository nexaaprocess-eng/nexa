# Episode 005 — Why Do Hotels Sell Rooms They Don't Have? — sources, method and rights

Accessed 30 October 2026. Every number and quote in the narration is linked to a claim in `claims.json` (verbatim
evidence) and a source in `fact_check.csv`. `python python/write_docs.py script --episode 005` fails if a segment with a
number has no claim link.

## What is real and what is made up
- **The story** (our traveller, the hotel, the receptionist, the second hotel) is fictional, told with animated characters.
  No real hotel or incident is depicted. The hotel names on screen ("HOTEL", "INN"), booking numbers and screens are invented.
- **The made-up hotel** (100 rooms, $150 a night, 8% of bookings failing to arrive, $250 to relocate a guest) is a
  hypothetical example, labelled "MADE-UP HOTEL" on screen and in the narration. Its results come from a simple binomial
  model in `calculations.py` (each booking independently arrives with probability 0.92, or 0.97 in the "bad season"):
  - 100 bookings: 92.0 expected arrivals, 8.0 empty rooms, $1,200 of room revenue not earned;
  - 106 bookings: 97.5 expected arrivals, 2.7 empty rooms, probability 0.14 (about one night in seven) that at least one
    guest arrives to no room; room revenue minus relocation costs $731 a night higher than with 100 bookings;
  - 106 bookings with only 3% failing to arrive: 2.9 guests relocated per night on average.
  These are expected values for illustration only. They are room revenue, not profit, and exclude reputational costs
  (both said in the narration).
- **Real data**: the booking records of two Portuguese hotels (below). The shares quoted are our own counts from the
  published data.

## Sources
1. **Antonio, N., de Almeida, A. & Nunes, L. (2019). Hotel booking demand datasets.** *Data in Brief* 22, 41–49.
   https://doi.org/10.1016/j.dib.2018.11.126 (open access, CC BY 4.0; full text Europe PMC PMC6297060).
   - Two hotels in Portugal (a resort in the Algarve, H1, and a city hotel in Lisbon, H2): "40,060 observations of H1 and
     79,330 observations of H2. Each observation represents a hotel booking. Both datasets comprehend bookings due to
     arrive between the 1st of July of 2015 and the 31st of August 2017, including bookings that effectively arrived and
     bookings that were canceled."
   - Our counts (file `hotels.csv` as redistributed by the TidyTuesday project, 2020-02-11,
     https://github.com/rfordatascience/tidytuesday/tree/master/data/2020/2020-02-11; per-hotel row counts identical to
     the paper): 119,390 bookings; ReservationStatus "Canceled" 43,017 (36.0%), "No-Show" 1,207 (1.0%), "Check-Out" 75,166.
     By lead time: bookings made 0–6 days ahead 7.6% cancelled (18,415 bookings); 7–29 days 25.2%; 30–89 days 36.9%;
     90–179 days 43.6%; 180 days or more 56.5% (24,962 bookings).
   - Limits: two hotels, 2015–2017; not representative of all hotels (said in the narration).
2. **Yang, D., Miao, X. & Nguyen, H. (2024). Predicting hotel booking cancellations using tree-based neural network.**
   *PeerJ Computer Science* 10:e2473. https://doi.org/10.7717/peerj-cs.2473 (open access, CC BY 4.0; Europe PMC PMC11623061).
   - "most contracts permit early cancellation before the supply of services so that it shifts the risk onto the hotel, as
     it is required to ensure the availability of rooms for guests who arrive as scheduled, as well as bear the cost of
     unoccupied rooms in the event of a cancellation or no-show"
   - "In an effort to mitigate their losses, hotels adopt overbooking techniques and stringent cancellation policies"
   - "Overbooking may lead a hotel to reject service to a client, which negatively affects the business's relationship with
     the guest and incurs fees for relocating the guest to an other hotel (Noone & Lee, 2011)"
   - "it is feasible to develop a model to predict cancellations to reduce the risks for business owners"
3. **de Bastos (2022). Contribution of hotels' revenue management for supply chain sustainability.** *Journal of Revenue
   and Pricing Management* (open access; Europe PMC PMC9111949).
   - "hotel products and services are perishable"; "perishable asset revenue management (PARM"
4. **Ministerio de Derechos Sociales, Consumo y Agenda 2030 (Spain), consumer FAQ:** "Llegué al hotel con reserva
   confirmada y me dicen que no hay habitación. ¿Qué puedo hacer?"
   https://www.dsca.gob.es/es/consumo/preguntas-frecuentes/llegue-hotel-reserva-confirmada-me-dicen-que-no-hay-habitacion-que
   - "Si tienes una reserva confirmada y el hotel no puede proporcionarte la habitación contratada por sobreventa u otra
     causa que le sea imputable, reclama una solución inmediata y deja constancia de la incidencia."
   - "El establecimiento puede ofrecerte otro alojamiento y la normativa turística de la comunidad autónoma puede
     establecer obligaciones específicas de realojamiento."
   - "Si no se presta el servicio contratado, puedes reclamar la devolución de las cantidades que correspondan y, en su
     caso, los gastos y daños que puedas acreditar, como el coste razonable de tener que buscar otro alojamiento."
   - Applies to Spain only. The page shows no date.
5. **Ley 15/2018, de 7 de junio, de turismo, ocio y hospitalidad de la Comunitat Valenciana**, art. 20 "Overbooking o
   sobreventa" (as amended by Ley 9/2019). Consolidated text: https://www.boe.es/buscar/act.php?id=BOE-A-2018-8950
   (BOE núm. 157, 29/06/2018; in force since 08/07/2018; consolidated text last updated 02/07/2026; the consolidated
   text is informative, the official version is the DOGV/BOE publication).
   - Art. 20.1: "no podrán vender efectivamente mayor número de plazas de las que puedan atender."
   - Art. 20.2: "estará obligado a proporcionar alojamiento a las personas usuarias afectadas en otro establecimiento de la
     zona de igual o superior categoría y en las mismas o mejores condiciones que las pactadas. Los gastos de desplazamiento
     hasta el nuevo establecimiento en el que se alojarán, la posible diferencia de precio respecto del nuevo y cualquier
     otro que se pudiese originar, serán de cargo del establecimiento en que se haya originado la sobreventa".
   - A regional law of one Spanish region; other regions and other countries have different rules (said in the narration).

## Further reading (not used for any claim)
- Schwartz, Z., Webb, T. D., Altin, M. & Riasi, A. (2025). Overbooking and performance in hotel revenue management.
  *International Journal of Hospitality Management* 129, 104192. https://doi.org/10.1016/j.ijhm.2025.104192 (paywalled;
  the abstract could not be accessed here).
- Zhai, Q., Tian, Y., Luo, J. & Zhou, J. (2023). Hotel overbooking based on no-show probability forecasts. *Computers &
  Industrial Engineering* 180, 109226. https://doi.org/10.1016/j.cie.2023.109226 (paywalled; abstract not accessed).
- Antonio, N., de Almeida, A. & Nunes, L. (2017). Predicting hotel booking cancellations to decrease uncertainty and
  increase revenue. *Tourism & Management Studies* 13(2). https://doi.org/10.18089/tms.2017.13203

## What the video does not claim
- That overbooking is universal, always legal or always profitable.
- Any statistic for no-show or cancellation rates beyond the two-hotel dataset.
- Any legal right outside Spain; U.S., EU and Spanish rules are not presented as interchangeable.

## Production rights
- **Narration:** Chatterbox TTS 0.1.7 (Resemble AI, MIT licence), run locally on CPU, slowed slightly with ffmpeg's
  rubberband filter; outputs carry Resemble's inaudible "Perth" watermark. The voice is synthetic.
- **Music and sound effects:** generated by the project's own code (`python/music.py`, `python/mix.py`); no third-party
  recordings or licensed tracks.
- **Animation:** Blender 4.5 LTS (GPL; output is ours) and Remotion; the character, sets and props are built by the
  project's code. Fonts: Inter and Space Grotesk (SIL Open Font License).
