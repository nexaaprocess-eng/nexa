"""Writes claims.json and fact_check.csv for Episode 005 (claims -> narration segments -> sources, verbatim evidence).
Segment links are read from episode.json (each segment lists the claims it uses), so they never drift."""
import csv
import json
from pathlib import Path

HERE = Path(__file__).parent
EP = json.loads((HERE / "episode.json").read_text())
SEGS = {}
for sc in EP["scenes"]:
    for g in sc["segments"]:
        for c in g.get("claims", []):
            SEGS.setdefault(c, []).append(f"{sc['id']}-{g['id']}")
CALC = json.loads((HERE / "calculations.json").read_text())
C = []


def claim(id, type, text, sources, evidence, caveat=""):
    C.append({"id": id, "type": type, "claim": text, "segments": SEGS.get(id, []), "sources": sources,
              "evidence": evidence, "method_or_caveat": caveat})


# ---- research
claim("P01", "fact", "Cancellations and no-shows shift risk onto the hotel, which bears the cost of unoccupied rooms; to mitigate losses hotels adopt overbooking techniques and stringent cancellation policies.",
      ["YANG-2024"],
      "\"most contracts permit early cancellation before the supply of services so that it shifts the risk onto the hotel, as it is required to ensure the availability of rooms for guests who arrive as scheduled, as well as bear the cost of unoccupied rooms in the event of a cancellation or no-show\"; \"In an effort to mitigate their losses, hotels adopt overbooking techniques and stringent cancellation policies\".",
      "Peer-reviewed review/introduction section citing Talluri & van Ryzin (2004). The narration says 'some hotels' and does not claim the practice is universal.")
claim("P02", "fact", "Overbooking may lead a hotel to refuse service to a guest, which harms the relationship with that guest and incurs fees for relocating the guest to another hotel.",
      ["YANG-2024"],
      "\"Overbooking may lead a hotel to reject service to a client, which negatively affects the business's relationship with the guest and incurs fees for relocating the guest to an other hotel (Noone & Lee, 2011)\".", "")
claim("P03", "fact", "Hotel rooms are perishable inventory (revenue management is also called perishable asset revenue management).",
      ["BASTOS-2022"],
      "\"hotel products and services are perishable, which implies the need for daily business cash-flows\"; \"there are related terms concerning RM, namely perishable asset revenue management (PARM\".",
      "The airline-seat and concert-ticket comparison in the narration is an explanatory analogy (both are sold for a fixed date and expire), not a statistic.")
claim("P04", "fact", "Researchers build machine-learning models on past booking data to predict which bookings will be cancelled, as an input to revenue management.",
      ["YANG-2024", "ANTONIO-2017"],
      "Yang et al.: \"it is feasible to develop a model to predict cancellations to reduce the risks for business owners\"; \"Antonio, de Almeida & Nunes (2017) ... demonstrated that predicting the cancellation likelihood of any bookings was feasible\".", "")
# ---- public dataset
d = CALC["dataset"]
claim("D01", "fact", f"Public dataset of two real Portuguese hotels (resort in the Algarve, city hotel in Lisbon): {d['by_hotel']['Resort Hotel']:,} + {d['by_hotel']['City Hotel']:,} = {d['bookings']:,} bookings due to arrive between 1 July 2015 and 31 August 2017.",
      ["ANTONIO-2019"],
      "\"31 variables describing the 40,060 observations of H1 and 79,330 observations of H2. Each observation represents a hotel booking. Both datasets comprehend bookings due to arrive between the 1st of July of 2015 and the 31st of August 2017, including bookings that effectively arrived and bookings that were canceled\"; \"H1 at the resort region of Algarve and H2 at the city of Lisbon\".",
      "Narration: 'almost 120,000 reservations'. Two hotels only: not representative of all hotels (said in the narration).")
claim("D02", "fact", f"In that dataset {d['cancelled_pct']}% of bookings have reservation status 'Canceled' ({d['cancelled']:,}) and {d['no_show_pct']}% 'No-Show' ({d['no_show']:,}).",
      ["ANTONIO-2019", "TIDY-HOTELS"],
      "Our count of the ReservationStatus variable (\"BO Canceled – booking was canceled by the customer; ... No-Show – customer did not check-in and did inform the hotel of the reason why\"). calculations.json dataset.cancelled_pct / no_show_pct.",
      "Computed by Hidden Ledger from the published data (copy distributed by the TidyTuesday project; row counts per hotel match the paper exactly). Note: the paper's variable description for No-Show reads 'did inform the hotel', the narration describes a no-show as no cancellation and no guest, which is the standard meaning of the status.")
lt = d["by_lead_time"]
claim("D03", "fact", f"Cancellation rate by lead time in that dataset: bookings made less than 7 days ahead {lt['under_7_days']['cancelled_pct']}% cancelled; 180 days or more ahead {lt['180_days_or_more']['cancelled_pct']}%.",
      ["ANTONIO-2019", "TIDY-HOTELS"],
      "Our calculation from the LeadTime and ReservationStatus variables (calculations.json dataset.by_lead_time).",
      "Narration: 'about 8 percent' and 'more than half'. Two hotels, 2015-2017.")
# ---- hypothetical hotel
A, B, Bb = CALC["A_100_bookings"], CALC["B_106_bookings"], CALC["B_106_bookings_bad_forecast"]
claim("H01", "illustrative", "Made-up hotel: 100 rooms, $150 a night, 8% of bookings fail to arrive on a typical night.", ["HL-HYPO"],
      "calculations.py inputs.", "Labelled MADE-UP EXAMPLE on screen and in the narration.")
claim("H02", "illustrative", f"100 bookings: about {A['expected_arrivals']:.0f} arrivals, {A['expected_empty']:.0f} empty rooms, ${CALC['empty_room_revenue_A_usd']:,} of room revenue lost.",
      ["HL-HYPO"], "calculations.json A_100_bookings, empty_room_revenue_A_usd.", "Expected values of a binomial model.")
claim("H03", "illustrative", f"106 bookings: about {B['expected_arrivals']:.0f} arrivals on average, about {B['expected_empty']:.0f} empty rooms.",
      ["HL-HYPO"], "calculations.json B_106_bookings (97.52 arrivals, 2.72 empty).", "")
claim("H04", "illustrative", "Distinction between physical rooms, confirmed reservations, expected arrivals and actual arrivals.", ["HL-HYPO"],
      "Definitions used in the example.", "")
claim("H05", "illustrative", f"With 106 bookings, probability that at least one guest arrives to no room: {B['p_at_least_one_moved']} (about one night in seven).",
      ["HL-HYPO"], "calculations.json B_106_bookings.p_at_least_one_moved.", "")
claim("H06", "illustrative", f"Moving a guest costs $250: option B earns about ${CALC['B_minus_A_usd_per_night']:.0f} more per night than option A, on average (room revenue minus moving costs).",
      ["HL-HYPO"], "calculations.json B_minus_A_usd_per_night.", "Room revenue, not profit (said in the narration). Excludes reputational costs.")
claim("H07", "illustrative", f"If only 3% fail to show, 106 bookings mean about {Bb['expected_moved']:.0f} guests moved per night on average.",
      ["HL-HYPO"], "calculations.json B_106_bookings_bad_forecast.expected_moved (2.88).", "")
# ---- consumer guidance and law
claim("S01", "fact", "Spain's consumer authority: with a confirmed booking and no room because of overselling or another cause attributable to the hotel, demand an immediate solution and record the incident; the establishment may offer other accommodation and the region's tourism rules may set specific rehousing obligations.",
      ["DSCA-FAQ"],
      "\"Si tienes una reserva confirmada y el hotel no puede proporcionarte la habitación contratada por sobreventa u otra causa que le sea imputable, reclama una solución inmediata y deja constancia de la incidencia.\" \"El establecimiento puede ofrecerte otro alojamiento y la normativa turística de la comunidad autónoma puede establecer obligaciones específicas de realojamiento.\"",
      "Applies to Spain only; the narration says so.")
claim("S02", "fact", "Spain's consumer authority: if the contracted service is not provided you can claim a refund of the amounts due and, where applicable, provable expenses and damages such as the reasonable cost of finding other accommodation.",
      ["DSCA-FAQ"],
      "\"Si no se presta el servicio contratado, puedes reclamar la devolución de las cantidades que correspondan y, en su caso, los gastos y daños que puedas acreditar, como el coste razonable de tener que buscar otro alojamiento.\"", "")
claim("V01", "fact", "Comunitat Valenciana, Ley 15/2018, art. 20.1: accommodation owners, intermediaries and travel agencies may not actually sell more places than they can serve.",
      ["BOE-LEY-15-2018"],
      "Art. 20.1: \"Los titulares de establecimientos de alojamiento turístico, así como las mediadoras turísticas y agencias de viaje, no podrán vender efectivamente mayor número de plazas de las que puedan atender.\"",
      "Regional law (Valencia), consolidated text on BOE; art. 20 as amended by Ley 9/2019. Not a national rule.")
claim("V02", "fact", "Ley 15/2018, art. 20.2: an establishment that oversold must accommodate affected guests in another establishment in the area of equal or higher category, on the same or better terms; travel costs and any price difference are paid by the overselling establishment (and a cheaper replacement means a refund of the difference).",
      ["BOE-LEY-15-2018"],
      "Art. 20.2: \"estará obligado a proporcionar alojamiento a las personas usuarias afectadas en otro establecimiento de la zona de igual o superior categoría y en las mismas o mejores condiciones que las pactadas. Los gastos de desplazamiento hasta el nuevo establecimiento en el que se alojarán, la posible diferencia de precio respecto del nuevo y cualquier otro que se pudiese originar, serán de cargo del establecimiento en que se haya originado la sobreventa\".", "")

SOURCES = [
    ("YANG-2024", "https://doi.org/10.7717/peerj-cs.2473", "PeerJ Computer Science (CC BY 4.0)", "Yang D., Miao X., Nguyen H. (2024) Predicting hotel booking cancellations using tree-based neural network. PeerJ Comput. Sci. 10:e2473 (full text: Europe PMC PMC11623061)", "", "2024", "text", "risk shift, overbooking, relocation fees, cancellation prediction", "Peer-reviewed, open access."),
    ("BASTOS-2022", "https://europepmc.org/article/PMC/PMC9111949", "Journal of Revenue and Pricing Management (open access)", "de Bastos (2022) Contribution of hotels' revenue management for supply chain sustainability", "", "2022", "text", "perishability; PARM", "Peer-reviewed, open access."),
    ("ANTONIO-2019", "https://doi.org/10.1016/j.dib.2018.11.126", "Data in Brief 22 (2019) 41-49 (CC BY 4.0)", "Antonio N., de Almeida A., Nunes L. Hotel booking demand datasets", "bookings arriving 2015-07-01 to 2017-08-31", "2019", "bookings", "40,060 + 79,330 bookings; variable definitions", "Peer-reviewed data article; real hotel PMS data (anonymised)."),
    ("TIDY-HOTELS", "https://github.com/rfordatascience/tidytuesday/blob/master/data/2020/2020-02-11/hotels.csv", "TidyTuesday project (copy of the Antonio et al. data)", "hotels.csv", "same", "2020-02-11", "bookings", "reservation_status, lead_time counts", "Redistribution of the paper's data; per-hotel row counts verified against the paper."),
    ("ANTONIO-2017", "https://doi.org/10.18089/tms.2017.13203", "Tourism & Management Studies", "Antonio N., de Almeida A., Nunes L. (2017) Predicting hotel booking cancellations to decrease uncertainty and increase revenue", "", "2017", "text", "cancellation prediction (cited via Yang et al. 2024)", "Peer-reviewed; cited, not quoted directly."),
    ("DSCA-FAQ", "https://www.dsca.gob.es/es/consumo/preguntas-frecuentes/llegue-hotel-reserva-confirmada-me-dicen-que-no-hay-habitacion-que", "Ministerio de Derechos Sociales, Consumo y Agenda 2030 (Spain)", "FAQ: Llegué al hotel con reserva confirmada y me dicen que no hay habitación. ¿Qué puedo hacer?", "current (no date shown)", "accessed 2026-10-30", "text", "immediate solution; rehousing set by regional rules; refund and provable costs", "Official consumer guidance (Spain)."),
    ("BOE-LEY-15-2018", "https://www.boe.es/buscar/act.php?id=BOE-A-2018-8950", "Generalitat Valenciana / BOE", "Ley 15/2018, de 7 de junio, de turismo, ocio y hospitalidad de la Comunitat Valenciana, art. 20 (as amended by Ley 9/2019)", "in force since 2018-07-08; consolidated text updated 2026-07-02", "BOE núm. 157, 2018-06-29", "text", "art. 20.1 and 20.2", "Regional law; consolidated text is informative, the official version is the DOGV/BOE publication."),
    ("SCHWARTZ-2025", "https://doi.org/10.1016/j.ijhm.2025.104192", "International Journal of Hospitality Management 129", "Schwartz Z., Webb T. D., Altin M., Riasi A. (2025) Overbooking and performance in hotel revenue management", "", "2025", "", "further reading", "Paywalled; abstract not accessible here, not used for any claim."),
    ("ZHAI-2023", "https://doi.org/10.1016/j.cie.2023.109226", "Computers & Industrial Engineering 180", "Zhai Q., Tian Y., Luo J., Zhou J. (2023) Hotel overbooking based on no-show probability forecasts", "", "2023", "", "further reading", "Paywalled; abstract not accessible here, not used for any claim."),
    ("HL-HYPO", "", "Hidden Ledger", "Hypothetical hotel (calculations.py)", "", "", "USD", "100 rooms, $150, 8% / 3% no-shows, $250 relocation", "Illustrative, labelled on screen."),
]
used = {}
for c in C:
    for s in c["sources"]:
        used.setdefault(s, {"claims": [], "segs": []})
        used[s]["claims"].append(c["id"])
        used[s]["segs"] += c["segments"]
(HERE / "claims.json").write_text(json.dumps({"_about": "Every factual claim in Episode 005, with the narration segments that use it. Sources: fact_check.csv / sources.md. Calculations: calculations.py.", "claims": C}, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
with open(HERE / "fact_check.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["source_id", "claim_ids", "scene_segments", "url", "publisher", "document", "period", "filed_or_published", "accessed", "unit", "figures_used", "exact_text_or_table", "reliability_notes"])
    for sid, url, pub, doc, per, filed, unit, figs, rel in SOURCES:
        u = used.get(sid, {"claims": [], "segs": []})
        w.writerow([sid, ";".join(u["claims"]), ";".join(sorted(set(u["segs"]))), url, pub, doc, per, filed, "2026-10-30", unit, figs, "verbatim quotes in claims.json", rel])
missing = [c["id"] for c in C if not c["segments"]]
print(len(C), "claims", "unused:", missing)
