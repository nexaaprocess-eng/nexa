"""Writes episode_005_storyboard.md: per scene, what the narration says, what the protagonist wants and does, what
changes, what the audience learns, the intended emotion, the camera plan and the assets; then every 3D shot (from
blender/shots/ep005.py, parsed without Blender) with its timing from the narration timeline when it exists.

  python content/episode-005/build_storyboard.py [--out episode005/episode_005_storyboard.md]
"""
import ast
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
EP = json.loads((HERE / "episode.json").read_text())
TL_PATH = ROOT / "output" / "episode-005" / "audio" / "full" / "timeline.json"
TL = json.loads(TL_PATH.read_text()) if TL_PATH.exists() else None

PLAN = {
    "s01": dict(wants="To check in and sleep after a long day.",
                does="Pulls a suitcase to the hotel, looks up at the sign, walks to the desk, rings the bell, shows the confirmed booking on the phone; reacts as the clerk says there is no room (surprise, glance at the phone, confusion, frustration, palms up).",
                changes="A confirmed, paid booking turns out to be worthless tonight.",
                learns="The hotel took more reservations than it has rooms: the mystery.",
                emotion="Tired calm, then disbelief.",
                camera="Low street tracking shot; wide from behind the desk; over-the-shoulder onto the clerk's screen; clerk close-up; reverse close-up on the hero; side two-shot.",
                assets="Street + facade, lobby, suitcase (pulled), phone (held), desk bell, reservation screen UI, clerk."),
    "s02": dict(wants="To understand why a full hotel kept selling.",
                does="Looks up at the lit facade (hands on hips), walks a corridor and stops at an open dark room, watches from the lobby sofa as a guest checks out early, walks among 100 room blocks while cancellations are marked.",
                changes="Rooms are reframed as nights that expire; bookings are shown to be unreliable.",
                learns="A room night is perishable; real data from two hotels: 36% of bookings cancelled, about 1% no-shows.",
                emotion="Curiosity, then a small realisation.",
                camera="Wide low facade; corridor dolly towards the hero; lobby over the guest's shoulder; stage three-quarter wide; empty-room push-in.",
                assets="Facade window anchors, corridor with open door, sofa sit, second guest with suitcase, room-block stage, guest room."),
    "s03": dict(wants="To see the hotel's side of the bet.",
                does="Presents a made-up 100-room hotel and its six extra bookings, points, walks along four columns naming them, weighs two mistakes (empty room vs walked guest).",
                changes="The decision becomes a calculation under uncertainty.",
                learns="Physical rooms vs confirmed bookings vs expected vs actual arrivals; the made-up numbers (8 empty rooms vs about 3).",
                emotion="Engaged, thoughtful.",
                camera="Behind-the-desk insert on the booking screen; stage wides and mediums with the hero presenting to camera.",
                assets="Booking-count screen UI, room blocks + extra blocks, four columns, second guest + suitcase, empty block."),
    "s04": dict(wants="Back in the story: a room.",
                does="Guests arrive and take the last key cards; he walks in last; outside every window is lit; at the desk he drums his fingers while the clerk phones around; writes a review on the phone, then hesitates.",
                changes="The forecast fails and the cost lands on a person.",
                learns="With 106 bookings this happens about one night in seven; relocation costs and lost goodwill.",
                emotion="Frustration, tension.",
                camera="Wide lobby (multi-character), facade wide, over the clerk's shoulder on the hero, phone close-up from the front.",
                assets="Three guests, key cards, clerk phone call, facade fully lit, star-rating overlay."),
    "s05": dict(wants="To judge whether overbooking pays.",
                does="Picks up a guest token and puts it on a balance; reacts when the beam tips against him (hand to forehead, shrug); walks along lead-time columns.",
                changes="Overbooking is a bet whose outcome depends on the forecast.",
                learns="Option A vs B (+$730 a night in the example), the bad-forecast case (about 3 guests moved), revenue is not profit, cancellation rises with booking lead time (8% vs more than half).",
                emotion="Satisfaction, then doubt.",
                camera="Stage mediums with a moving balance; wide on the lead-time columns.",
                assets="Balance with animated beam, carried token (pick up, carry, place), lead-time columns."),
    "s06": dict(wants="To know what he is owed.",
                does="Reads on the lobby sofa and nods, takes a voucher card from the clerk, photographs the receipt.",
                changes="He goes from victim to informed guest.",
                learns="Spain: immediate solution and record the incident; regional rules; Valencia's law (equal or higher category, hotel pays); refund + provable costs; intentional vs accidental causes; rules differ elsewhere.",
                emotion="Relief, resolve.",
                camera="Sofa three-quarter front; over the clerk's shoulder for the hand-over and the receipt.",
                assets="Phone, voucher card hand-over between characters, receipt, legal quote cards."),
    "s07": dict(wants="Just a bed.",
                does="Gets a key card at the second hotel, walks the corridor, taps the reader, opens the door, sits on the bed and looks out at the city.",
                changes="The night ends; the idea settles.",
                learns="A hotel sells nights that vanish; the same logic makes empty rooms costly and turns some guests away.",
                emotion="Relief and quiet understanding.",
                camera="Over the clerk's shoulder, corridor walk towards camera with a door opening, room wide from the front.",
                assets="Second lobby variant, key card, card reader, door on a hinge, guest room, bed sit."),
}


def shots():
    src = (ROOT / "blender" / "shots" / "ep005.py").read_text()
    out = []
    for node in ast.parse(src).body:
        if isinstance(node, ast.FunctionDef):
            for d in node.decorator_list:
                if isinstance(d, ast.Call) and getattr(d.func, "id", "") == "shot":
                    args = [a.value for a in d.args if isinstance(a, ast.Constant)]
                    out.append({"id": args[0], "scene": args[1], "from": args[2] if len(args) > 2 else None, "doc": ast.get_docstring(node) or ""})
    return out


def ts(t):
    return f"{int(t // 60)}:{int(t % 60):02d}"


def main():
    out = Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else ROOT / "episode005" / "episode_005_storyboard.md"
    sh = shots()
    meta = {}
    man = ROOT / "output" / "episode-005" / "shots" / "manifest.json"
    if man.exists():
        meta = json.loads(man.read_text())
    L = [f"# {EP['title']} — storyboard", "",
         "*Hidden Ledger · Episode 005. Each scene: narration, what the protagonist wants and does, what changes, what the "
         "audience learns, the intended emotion, the camera plan and the assets; then the 3D shots (blender/shots/ep005.py) "
         "with their times in the final video.*", ""]
    for sc in EP["scenes"]:
        p = PLAN[sc["id"]]
        span = ""
        if TL:
            t = next(x for x in TL["scenes"] if x["id"] == sc["id"])
            span = f"  `{ts(t['start'])}–{ts(t['end'])}`"
        L += [f"## {sc['id'][1:]}. {sc['chapter']}{span}", ""]
        L.append("**Narration:** " + " ".join(g["text"] for g in sc["segments"]))
        L += ["", f"- **Protagonist wants:** {p['wants']}", f"- **Does:** {p['does']}", f"- **What changes:** {p['changes']}",
              f"- **Audience learns:** {p['learns']}", f"- **Emotion:** {p['emotion']}", f"- **Camera:** {p['camera']}",
              f"- **Assets:** {p['assets']}", "", "| Shot | Starts on | Time | Action |", "|---|---|---|---|"]
        for s in [x for x in sh if x["scene"] == sc["id"]]:
            m = meta.get(s["id"])
            when = f"{ts(m['t0'])}–{ts(m['t1'])}" if m else ""
            L.append(f"| {s['id']} | {s['from'] or 'scene start'} | {when} | {s['doc'].replace(chr(10), ' ')} |")
        L.append("")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(L) + "\n", encoding="utf-8")
    print(f"wrote {out} ({len(sh)} shots)")


if __name__ == "__main__":
    main()
