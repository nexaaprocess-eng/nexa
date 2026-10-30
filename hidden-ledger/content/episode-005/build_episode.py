"""Source of the Episode 005 narration. Writes episode.json (kept as Python so euro amounts get spoken forms).
Run: python content/episode-005/build_episode.py"""
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


scene("s01", "Cold open", "The room that isn't there", "intro",
      g("It's almost midnight. Our traveler has been on the road all day, and there's only one thing left to do: check in."),
      g("The booking is confirmed. It's paid for. It's right there on the phone."),
      g("The receptionist types. Pauses. Types again."),
      g("And then: I'm so sorry. We don't have a room for you tonight."),
      g("The hotel is full. Not with people who walked in off the street, but with people who booked, just like our traveler."),
      g("So how can a hotel take more reservations than it has rooms? And why would it ever do that on purpose?"),
      )

scene("s02", "The empty room problem", "A product that expires every night", "neutral",
      g("To understand it, look at the hotel the way its managers do. Not as a building, but as nights for sale: one per room, every single day."),
      g("A room night is a strange product. If nobody sleeps in a room tonight, the hotel can't keep that night on a shelf and sell it tomorrow. At the end of the night, it's gone."),
      g("Researchers call this perishable inventory. Airline seats work the same way, and so do concert tickets.", ["P03"]),
      g("And a booking is not the same thing as a guest. People cancel. Plans change. Some guests simply never show up.", ["P01"]),
      g("It works the other way too. Some guests leave a day early. Others decide to stay an extra night, in a room someone else has already booked."),
      g("How often? Researchers in Portugal published the booking records of two real hotels: almost 120,000 reservations, from 2015 to 2017.", ["D01"],
        say="How often? Researchers in Portugal published the booking records of two real hotels: almost a hundred and twenty thousand reservations, from twenty fifteen to twenty seventeen."),
      g("36 percent of those bookings were cancelled. About 1 percent were no-shows: no cancellation, and no guest.", ["D02"], duck=True,
        say="Thirty-six percent of those bookings were cancelled. About one percent were no-shows: no cancellation, and no guest."),
      g("Those are just two hotels, but the problem is the same everywhere. Many cancellations come early enough to sell the room again. The late ones, and the no-shows, leave a hole that's hard to fill."),
      g("The building, the staff and the bills are there either way. The empty room just earns nothing.", ["P01"]),
      )

scene("s03", "The overbooking bet", "Selling more rooms than you have", "process",
      g("So some hotels make a bet. They accept a few more reservations than they have rooms, expecting that not everyone will arrive."),
      g("Researchers describe it plainly: to limit what cancellations and no-shows cost them, hotels use overbooking and strict cancellation policies.", ["P01"]),
      g("Let's build a made-up hotel to see the math. 100 rooms. $150 a night.", ["H01"],
        say="Let's build a made-up hotel to see the math. One hundred rooms. A hundred and fifty dollars a night."),
      g("Say that on a typical night, 8 percent of the people with a booking don't turn up.", ["H01"],
        say="Say that on a typical night, eight percent of the people with a booking don't turn up."),
      g("If the hotel only ever accepts 100 bookings, about 92 guests arrive. Eight rooms stay dark: $1,200 the hotel will never see.", ["H02"], duck=True,
        say="If the hotel only ever accepts a hundred bookings, about ninety-two guests arrive. Eight rooms stay dark: twelve hundred dollars the hotel will never see."),
      g("Now let it accept 106 bookings instead. On an average night, about 97 guests arrive, and only three rooms stay empty.", ["H03"], duck=True,
        say="Now let it accept a hundred and six bookings instead. On an average night, about ninety-seven guests arrive, and only three rooms stay empty."),
      g("Four numbers matter here, and they're easy to mix up. The rooms the hotel physically has. The reservations it has confirmed. The arrivals it expects. And the guests who actually walk through the door.", ["H04"]),
      g("The hotel controls the first two. It can only forecast the third. And the fourth is only known late at night.", ["H04"]),
      g("Revenue managers are trying to avoid two opposite mistakes: a room left empty that could have been sold, and a guest with a booking and no room. Overbooking trades a little of the first for a little of the second."),
      g("One guest is impossible to predict. But a hundred guests, on average, are surprisingly predictable. That's what the bet relies on."),
      )

scene("s04", "When the forecast fails", "When too many guests show up", "tension",
      g("Tonight, the forecast was wrong. More people showed up than the hotel expected."),
      g("The receptionist didn't make that decision. It was made weeks earlier, by a forecast."),
      g("One by one, the rooms filled. And our traveler arrived after all of them."),
      g("In our made-up hotel, with 106 bookings, this happens on about one night in seven: at least one guest with a confirmed booking finds no room.", ["H05"], duck=True,
        say="In our made-up hotel, with a hundred and six bookings, this happens on about one night in seven: at least one guest with a confirmed booking finds no room."),
      g("Now the hotel has to fix it, and it pays. Usually that means finding the guest a room somewhere else, and covering the cost.", ["P02"]),
      g("Researchers note that turning a guest away hurts the hotel's relationship with that customer, and costs it fees to move them to another hotel.", ["P02"]),
      g("And the bill may not end there. A guest turned away at midnight can leave a public review, and may never book that hotel again."),
      )

scene("s05", "The trade-off", "Overbooking is a bet, not free money", "neutral",
      g("So is overbooking free money? No. It's a trade-off."),
      g("Option A: never sell more rooms than you have. Nobody is ever turned away, but on an average night, eight rooms earn nothing.", ["H02"]),
      g("Option B: sell a few extra. More rooms are full on most nights, but sometimes a guest has to be moved, at the hotel's expense."),
      g("In our example, if moving one guest costs the hotel $250, option B still comes out about $730 a night ahead, on average.", ["H06"], duck=True,
        say="In our example, if moving one guest costs the hotel two hundred and fifty dollars, option B still comes out about seven hundred and thirty dollars a night ahead, on average."),
      g("But that answer depends entirely on the forecast. If, one season, only 3 percent of guests fail to show, the same 106 bookings mean moving about three guests a night.", ["H07"], duck=True,
        say="But that answer depends entirely on the forecast. If, one season, only three percent of guests fail to show, the same hundred and six bookings mean moving about three guests a night."),
      g("And that math doesn't even count the angry reviews."),
      g("It's also room revenue, not profit. Every extra guest needs cleaning, laundry and breakfast, so the real gain is smaller than it looks."),
      g("Forecasts look at how each booking was made. In those Portuguese records, bookings made less than a week ahead were cancelled about 8 percent of the time. Bookings made more than six months ahead: more than half.", ["D03"], duck=True,
        say="Forecasts look at how each booking was made. In those Portuguese records, bookings made less than a week ahead were cancelled about eight percent of the time. Bookings made more than six months ahead: more than half."),
      g("That's why overbooking is really a forecasting problem. Researchers train models on past bookings to predict who is likely to cancel, so hotels can decide how far to go, or whether to overbook at all.", ["P04"]),
      )

scene("s06", "What you're owed", "What happens to the guest", "process",
      g("So what is our traveler owed? That depends on where the hotel is, and on the terms of the booking."),
      g("Take Spain. Its consumer authority says that if a hotel can't give you the room you booked because it oversold, you should demand an immediate solution, and make sure the problem is recorded.", ["S01"]),
      g("It adds that each region's tourism rules can set specific obligations to rehouse you.", ["S01"]),
      g("In the Valencia region, for example, the law says hotels may not sell more places than they can serve.", ["V01"]),
      g("And if it happens anyway, the hotel must put the guest in another hotel in the area, of the same or higher category, on the same or better terms, and pay for the transfer and any price difference.", ["V02"]),
      g("Spain's consumer authority also says you can claim back what you paid for the service you didn't get, and costs you can prove, like having to find somewhere else to stay.", ["S02"]),
      g("Notice the wording: oversold, or another cause the hotel is responsible for. Not every full hotel is overbooking on purpose. A broken room, a guest who stays longer or a booking error can leave you at the same desk.", ["S01"]),
      g("Outside Spain, the rules can be very different. So keep the confirmation, the receipts and the names, and check the rules where you are."),
      )

scene("s07", "The real lesson", "The inventory that disappears every night", "reveal",
      g("An hour later, in our story, the traveler is checking in somewhere else, on the first hotel's bill."),
      g("And somewhere between the two lobbies, it all makes sense."),
      g("A hotel isn't really selling rooms. It's selling nights, and every night it doesn't sell is gone for good."),
      g("That's why an empty room hurts so much. And it's the same reason someone with a confirmed booking can end up at the desk at midnight with nowhere to sleep."),
      g("For the hotel, it's a percentage. For the guest at the desk, it's the whole night."),
      g("The hotel bet that a few guests wouldn't come. Tonight, they all did."),
      g("This is Hidden Ledger. The sources for every number are in the description."),
      )

ep = {
    "id": "005",
    "slug": "why-do-hotels-sell-rooms-they-dont-have",
    "title": "Why Do Hotels Sell Rooms They Don't Have?",
    "channel": "Hidden Ledger",
    "tagline": "The hidden economics of everyday life",
    "language": "en-US",
    "transitions": "cut",
    "style": "cine",
    "voice": {"engine": "chatterbox", "voiceId": "chatterbox-default", "exaggeration": 0.45, "cfg": 0.3, "tempo": 0.87, "temperature": 0.8, "maxWer": 0.12,
              "speed": 1.0, "lang": "en-us", "pauseBetweenSegments": 0.5, "pauseBetweenScenes": 1.3, "leadIn": 0.4, "tail": 3.0},
    "lexicon": {},
    "scenes": S,
    "pilot": {"scenes": ["s01", "s02"]},
    "shorts": [],
}
Path(__file__).with_name("episode.json").write_text(json.dumps(ep, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(sum(len(x["text"].split()) for s in S for x in s["segments"]), "words,", sum(len(s["segments"]) for s in S), "segments")
