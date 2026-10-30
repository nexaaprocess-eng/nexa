"""Source of the Episode 004 narration. Writes episode.json (kept as Python so euro amounts get spoken forms).
Run: python content/episode-004/build_episode.py"""
import json
from pathlib import Path

S = []  # scenes


def scene(id, title, chapter, music, *segs):
    S.append({"id": id, "title": title, "chapter": chapter, "music": music,
              "segments": [dict({"id": f"{i + 1:02d}"}, **g) for i, g in enumerate(segs)]})


def g(text, claims=None, say=None, duck=False):
    d = {"text": text}
    if say:
        d["say"] = say
    if claims:
        d["claims"] = claims
    if duck:
        d["duck"] = True
    return d


scene("s01", "Cold open", "The twenty-dollar flight", "intro",
      g("Meet our passenger. They want to visit a friend in another city, and the airline's website says the flight costs twenty dollars."),
      g("Twenty dollars, to fly. So they book it."),
      g("Then the checkout keeps going. A cabin bag: $25. A window seat: $12. A checked suitcase: $35.", ["I01"],
        say="Then the checkout keeps going. A cabin bag: twenty-five dollars. A window seat: twelve. A checked suitcase: thirty-five."),
      g("The twenty-dollar flight now costs $92. Those prices are a made-up example. The pattern is real.", ["I01"], duck=True,
        say="The twenty-dollar flight now costs ninety-two dollars. Those prices are a made-up example. The pattern is real."),
      g("At the American budget airline Frontier, the average passenger in 2025 paid $44.60 in fares, and another $63.79 in other charges.", ["F01"], duck=True),
      g("So how can an airline sell a flight for twenty dollars? And who is really paying for it?"),
      )

scene("s02", "What a flight costs", "What one passenger costs to fly", "neutral",
      g("To find out, follow our passenger onto the plane, and look at the bill for the flight itself."),
      g("Europe's largest budget airline, Ryanair, publishes that bill every year. In the twelve months to March 2026, it carried 208 million passengers.", ["R01"],
        say="Europe's largest budget airline, Ryan air, publishes that bill every year. In the twelve months to March twenty twenty-six, it carried two hundred and eight million passengers."),
      g("Averaged over all of them, flying one passenger cost Ryanair €63.21.", ["R02"], duck=True,
        say="Averaged over all of them, flying one passenger cost Ryan air sixty-three euros and twenty-one cents."),
      g("The biggest slice is fuel: €26, about 41 percent of all its costs. Then staff, about €9. Airport and handling fees, about €8.50. The aircraft themselves, about €6.60. Air traffic control charges, about €6.30. And then sales, maintenance and everything else.", ["R02", "R03"],
        say="The biggest slice is fuel: twenty-six euros, about forty-one percent of all its costs. Then staff, about nine euros. Airport and handling fees, about eight euros fifty. The aircraft themselves, about six euros sixty. Air traffic control charges, about six euros thirty. And then sales, maintenance and everything else."),
      g("Fuel alone is close to half of that bill. Remember that: when oil prices jump, budget airlines feel it first.", ["R03"]),
      g("Now look at what the average passenger paid for the ticket: €50.66. And Ryanair counts checked bag fees and change fees inside that figure.", ["R02", "R04"], duck=True,
        say="Now look at what the average passenger paid for the ticket: fifty euros and sixty-six cents. And Ryan air counts checked bag fees and change fees inside that figure."),
      g("So on the fare alone, the average passenger is flown at a loss. The gap gets closed somewhere else. To see where, we need three secrets."),
      )

scene("s03", "The empty seat", "Secret one: the empty seat", "process",
      g("Secret one. Most of what a flight costs does not depend on who is sitting in it."),
      g("The crew gets paid, the fuel gets burned, and the airport sends its bill, whether the plane is full or half empty. Ryanair's own annual report says the operating costs of each flight do not vary significantly with the number of passengers flown.", ["R05"],
        say="The crew gets paid, the fuel gets burned, and the airport sends its bill, whether the plane is full or half empty. Ryan air's own annual report says the operating costs of each flight do not vary significantly with the number of passengers flown."),
      g("Averaged across the year, one Ryanair flight cost about €11,400 to operate, and carried about 181 passengers.", ["C01"], duck=True,
        say="Averaged across the year, one Ryan air flight cost about eleven thousand four hundred euros to operate, and carried about one hundred and eighty-one passengers."),
      g("And once the door closes, every empty seat around our passenger is gone for good. Like a concert ticket after the show, or a hotel room after midnight, it can never be sold again."),
      g("One more passenger, though, adds only a little: some per-passenger fees and taxes, and a bit of extra fuel. So for the airline, a cheap seat beats an empty one."),
      g("That changes the question. It is not, what does one seat cost? It is, how full does the plane need to be?"),
      g("Ryanair calls that its break-even load factor. In its last financial year, it was 80 percent. Its planes were actually 94 percent full.", ["R06"], duck=True,
        say="Ryan air calls that its break-even load factor. In its last financial year, it was eighty percent. Its planes were actually ninety-four percent full."),
      g("Picture one of its Boeing jets, with 197 seats. Roughly the first 158 passengers pay for the flight. The next 27 or so are where the profit is.", ["I02", "R08"], duck=True,
        say="Picture one of its Boeing jets, with one hundred and ninety-seven seats. Roughly the first hundred and fifty-eight passengers pay for the flight. The next twenty-seven or so are where the profit is."),
      )

scene("s04", "The price ladder", "Secret two: the price ladder", "tension",
      g("Secret two. The twenty-dollar seats are real, but there are not many of them."),
      g("Budget airlines change their prices constantly. Ryanair says its fares vary with how far ahead you book, how many seats are left, and demand.", ["R09"],
        say="Budget airlines change their prices constantly. Ryan air says its fares vary with how far ahead you book, how many seats are left, and demand."),
      g("And because it sells every journey one way, each seat on each flight can carry its own price.", ["R17"]),
      g("Think of every flight as a ladder of prices. Our passenger booked weeks ahead, for a quiet Tuesday, and landed on the bottom rung.", ["I03"]),
      g("As the plane fills up, each new seat costs more. The person in the next seat, who booked yesterday, may have paid many times as much, for exactly the same flight.", ["I03"]),
      g("Those cheap seats do a job. They fill the plane early, they put the airline's name at the top of every price comparison, and they bring you to its website."),
      g("Ryanair even has a name for this: load factor active, yield passive. In plain words: fill the plane first, and worry about the price of each seat second.", ["R09"],
        say="Ryan air even has a name for this: load factor active, yield passive. In plain words: fill the plane first, and worry about the price of each seat second."),
      g("It admits that promotional fares can lower its revenue on those routes while they run. It keeps running them anyway, to fill quiet periods.", ["R09"]),
      )

scene("s05", "Paying for the rest", "Secret three: everything else is extra", "lift",
      g("Secret three. A budget fare buys you less than you might think."),
      g("At the gate, our passenger finds out what the fare included. Usually, a seat and one small bag that fits under the seat in front. Almost everything else is sold separately: a bigger bag, a suitcase, choosing your seat, boarding early, changing your ticket, even a drink on board.", ["F03"]),
      g("At Ryanair, extras like priority boarding, reserved seats and onboard sales brought in €4.99 billion last year. That is about €24 per passenger, and roughly a third of all its revenue.", ["R10"], duck=True,
        say="At Ryan air, extras like priority boarding, reserved seats and onboard sales brought in four point nine nine billion euros last year. That is about twenty-four euros per passenger, and roughly a third of all its revenue."),
      g("Add the fare and the extras together, and Ryanair took in €74.60 per passenger, against a cost of €63.21. That gap, about €11 a passenger, is the profit.", ["R02", "C02"], duck=True,
        say="Add the fare and the extras together, and Ryan air took in seventy-four euros sixty per passenger, against a cost of sixty-three euros twenty-one. That gap, about eleven euros a passenger, is the profit."),
      g("In the United States, the split can be even more extreme. Frontier's passengers paid more for extras than for their tickets: $63.79 in non-fare charges, against $44.60 in fares.", ["F01"], duck=True),
      g("And Frontier's revenue from extras grew from $60.55 per passenger in 2021 to $67.57 in 2025.", ["F02"]),
      g("That is the trick behind the twenty-dollar headline. The airline competes on the one number you compare across websites, the fare, and earns its money on the numbers you see later."),
      g("For someone with one small backpack, that is a genuine bargain. For a family with suitcases, it might not be."),
      )

scene("s06", "The cost machine", "A machine built to be cheap", "process",
      g("But none of that works unless the airline's own costs stay far below everyone else's."),
      g("Ryanair fits 197 seats into its newest Boeing 737s, and 189 into the older ones. Traditional airlines fly the same Boeing 737-800 with about 162 seats in two classes.", ["R08"],
        say="Ryan air fits one hundred and ninety-seven seats into its newest Boeing seven-three-sevens, and one hundred and eighty-nine into the older ones. Traditional airlines fly the same Boeing seven-three-seven eight hundred with about one hundred and sixty-two seats in two classes."),
      g("More seats on the same plane, with the same crew, means every seat costs less."),
      g("Its aircraft fly about nine and a half hours a day on average, because a plane on the ground earns nothing.", ["R11"]),
      g("So between flights, the clock is running: passengers off, a quick clean, the next passengers on, and back in the air.", ["R15"]),
      g("Almost the whole fleet is one aircraft family, the Boeing 737, so pilots, spare parts and mechanics are interchangeable.", ["R12"],
        say="Almost the whole fleet is one aircraft family, the Boeing seven-three-seven, so pilots, spare parts and mechanics are interchangeable."),
      g("It looks for airports that charge less, uses outdoor stairs instead of jet bridges, and makes every passenger check in online.", ["R13"]),
      g("The result: leaving out fuel, Ryanair puts its own costs at €36 per passenger. It puts Wizz Air at €62, easyJet at €90, and the big network airline groups at €178 to €253.", ["R14"], duck=True,
        say="The result: leaving out fuel, Ryan air puts its own costs at thirty-six euros per passenger. It puts Wiz Air at sixty-two, easy Jet at ninety, and the big network airline groups at one hundred and seventy-eight to two hundred and fifty-three euros."),
      g("That cost gap is the real product. The twenty-dollar fare is just how it shows up on your screen."),
      )

scene("s07", "Where it breaks", "When the math stops working", "tension",
      g("The model has a weak spot. It needs full planes, steady fuel prices, and very little going wrong."),
      g("Ryanair needed its planes about 80 percent full just to break even. In 2025, Frontier's planes were 78.4 percent full.", ["R06", "F04"],
        say="Ryan air needed its planes about eighty percent full just to break even. In twenty twenty-five, Frontier's planes were seventy-eight point four percent full."),
      g("Frontier's costs came to about $116.66 per passenger, a little more than the $112.17 it took in. It lost $137 million that year.", ["F05"], duck=True),
      g("Spirit Airlines, which described itself as a pioneer of affordable travel, filed for bankruptcy in November 2024, and again in August 2025.", ["S01"],
        say="Spirit Airlines, which described itself as a pioneer of affordable travel, filed for bankruptcy in November twenty twenty-four, and again in August twenty twenty-five."),
      g("On May 2, 2026, citing a sharp rise in fuel prices, it cancelled all of its flights and began winding down.", ["S02"], duck=True,
        say="On May second, twenty twenty-six, citing a sharp rise in fuel prices, it cancelled all of its flights and began winding down."),
      g("When costs jump, a budget airline cannot simply raise its fares. Low fares are the whole reason people fly with it."),
      g("That is why Ryanair locks in fuel prices ahead of time. It says about 80 percent of its fuel for the year to March 2027 is already hedged: a cushion that weaker rivals often do not have.", ["R16"],
        say="That is why Ryan air locks in fuel prices ahead of time. It says about eighty percent of its fuel for the year to March twenty twenty-seven is already hedged: a cushion that weaker rivals often do not have."),
      g("And when one of these airlines disappears, the people who relied on it lose the cheapest way they had to travel."),
      )

scene("s08", "Who pays", "Who pays for the twenty-dollar seat", "reveal",
      g("So, how can an airline sell a flight for twenty dollars?"),
      g("Because an empty seat is worth nothing once the plane leaves, and one more passenger costs very little to carry."),
      g("Because the cheapest seats are a handful at the bottom of a price ladder, and people who book later pay much more."),
      g("Because the fare is only part of what you pay. Bags, seats and extras close the gap."),
      g("And because the airline is built, piece by piece, to fly each seat more cheaply than its rivals."),
      g("So who pays for the twenty-dollar seat? Partly the people who book late. Partly the people who add a suitcase. And partly the airline's obsession with cost. If you travel light, book early and skip the extras, you might be the one getting the deal."),
      g("This is Hidden Ledger. Every number in this video is sourced in the description."),
      )

ep = {
    "id": "004",
    "slug": "how-can-airlines-sell-flights-for-20",
    "title": "How Can Airlines Sell Flights for Just $20?",
    "channel": "Hidden Ledger",
    "tagline": "The hidden economics of everyday life",
    "language": "en-US",
    "transitions": "cut",
    "style": "cine",
    "voice": {"engine": "chatterbox", "voiceId": "chatterbox-default", "exaggeration": 0.45, "cfg": 0.5, "temperature": 0.8, "maxWer": 0.12,
              "speed": 1.0, "lang": "en-us", "pauseBetweenSegments": 0.5, "pauseBetweenScenes": 1.3, "leadIn": 0.4, "tail": 3.0},
    "lexicon": {"Ryanair": "Ryan air", "Ryanair's": "Ryan air's", "easyJet": "easy Jet", "Wizz": "Wiz"},
    "voiceTest": {"voices": ["af_heart", "af_bella", "am_michael", "am_fenrir", "am_puck", "bm_george"],
                  "text": "Meet our passenger. The airline's website says the flight costs twenty dollars. So they book it. "
                          "Then the checkout keeps going. A cabin bag: $25. A window seat: $12. "
                          "Here's the thing. Once the door closes, an empty seat can never be sold again. "
                          "So for the airline, a cheap seat beats an empty one. But who is really paying for it?"},
    "scenes": S,
    "pilot": {"scenes": ["s01", "s02"]},
    "shorts": [],
}
Path(__file__).with_name("episode.json").write_text(json.dumps(ep, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(sum(len(x["text"].split()) for s in S for x in s["segments"]), "words,", sum(len(s["segments"]) for s in S), "segments")
