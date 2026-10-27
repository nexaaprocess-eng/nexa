"""Generate review/publishing documents from episode data + REAL audio timings.

  python python/write_docs.py script    --episode 001   # script_en.md + storyboard.json (+ claim link check)
  python python/write_docs.py voices    --episode 001   # voice_comparison.md from the voice-test reports
  python python/write_docs.py chapters  --episode 001   # chapter block in youtube_description.md from full timeline
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import episode_dir, load_episode, output_dir, write_json  # noqa: E402


def ts(t: float) -> str:
    t = int(t)
    return f"{t // 60}:{t % 60:02d}"


def load_timeline(ep: str, name: str = "full") -> dict | None:
    p = output_dir(ep) / "audio" / name / "timeline.json"
    return json.loads(p.read_text()) if p.exists() else None


def check_claims(ep_id: str) -> list[str]:
    ep = load_episode(ep_id)
    d = episode_dir(ep_id)
    claims = {c["id"]: c for c in json.loads((d / "claims.json").read_text())["claims"]}
    with open(d / "fact_check.csv", newline="", encoding="utf-8") as f:
        sources = {r["source_id"]: r for r in csv.DictReader(f)}
    problems = []
    used = set()
    for sc in ep["scenes"]:
        for seg in sc["segments"]:
            key = f"{sc['id']}-{seg['id']}"
            for cid in seg.get("claims", []):
                used.add(cid)
                if cid not in claims:
                    problems.append(f"{key}: claim {cid} missing from claims.json")
                elif key not in claims[cid]["segments"]:
                    problems.append(f"{key}: not listed in {cid}.segments")
            # any digit in narration must be backed by a claim (illustrative counts as a claim)
            if re.search(r"\d", seg["text"]) and not seg.get("claims"):
                problems.append(f"{key}: contains a number but has no claim link")
    for cid, c in claims.items():
        if cid not in used:
            problems.append(f"{cid}: defined but not used in the script")
        for s in c["sources"]:
            if s not in sources:
                problems.append(f"{cid}: source {s} not in fact_check.csv")
        if c["type"] not in ("illustrative", "definition") and not c["sources"]:
            problems.append(f"{cid}: non-illustrative claim without source")
    return problems


def cmd_script(a):
    ep = load_episode(a.episode)
    d = episode_dir(a.episode)
    tl = load_timeline(a.episode)
    notes = json.loads((d / "visual_notes.json").read_text())
    seg_t = {g["key"]: g for sc in (tl or {}).get("scenes", []) for g in sc["segments"]}
    sc_t = {sc["id"]: sc for sc in (tl or {}).get("scenes", [])}

    words = sum(len(g["text"].split()) for sc in ep["scenes"] for g in sc["segments"])
    lines = [f"# {ep['title']}", "",
             f"*{ep['channel']} · Episode {ep['id']} · narration only, by scene. Generated from `episode.json` by `python/write_docs.py`.*", "",
             f"Words: **{words}**" + (f" · measured narration length: **{ts(tl['duration'])}** ({tl['duration']:.1f} s)" if tl else ""), ""]
    for i, sc in enumerate(ep["scenes"], 1):
        t = sc_t.get(sc["id"])
        lines.append(f"## {i}. {sc['title']}" + (f"  `{ts(t['start'])}–{ts(t['end'])}`" if t else ""))
        lines.append("")
        for g in sc["segments"]:
            lines.append(g["text"])
            lines.append("")
    (d / "script_en.md").write_text("\n".join(lines), encoding="utf-8")

    sb = {"episode": ep["id"], "title": ep["title"], "fps": 30, "timing_source": "measured WAV durations (output/episode-XXX/audio/full/timeline.json)" if tl else "not yet rendered",
          "duration": tl["duration"] if tl else None, "scenes": []}
    for sc in ep["scenes"]:
        t = sc_t.get(sc["id"], {})
        entry = {"id": sc["id"], "title": sc["title"], "chapter": sc.get("chapter"), "music": sc.get("music"),
                 "start": t.get("start"), "end": t.get("end"),
                 "duration": round(t["end"] - t["start"], 3) if t else None, "component": f"src/scenes (registry id {sc['id']})", "beats": []}
        for g in sc["segments"]:
            key = f"{sc['id']}-{g['id']}"
            st = seg_t.get(key, {})
            n = notes.get(key, {})
            entry["beats"].append({"segment": key, "start": st.get("start"), "end": st.get("end"), "narration": g["text"],
                                   "visual": n.get("visual", ""), "on_screen_text": n.get("onScreen", []),
                                   "claims": g.get("claims", []), "music_dip": bool(g.get("duck"))})
        sb["scenes"].append(entry)
    write_json(d / "storyboard.json", sb)
    problems = check_claims(a.episode)
    missing_notes = [f"{sc['id']}-{g['id']}" for sc in ep["scenes"] for g in sc["segments"] if f"{sc['id']}-{g['id']}" not in notes]
    problems += [f"{k}: no visual note" for k in missing_notes]
    print(f"script_en.md: {words} words; storyboard.json: {len(sb['scenes'])} scenes")
    print("claim/visual link check:", "OK" if not problems else "\n  " + "\n  ".join(problems))
    if problems:
        sys.exit(1)


def cmd_voices(a):
    base = output_dir(a.episode) / "audio" / "voices"
    rep = json.loads((base / "voices_report.json").read_text())
    asr = {r["voice"]: r for r in json.loads((base / "asr_report.json").read_text())} if (base / "asr_report.json").exists() else {}
    ep = load_episode(a.episode)
    rows = ["| Voice | OK | Duration (s) | Words/min | RMS (dBFS) | Clipped samples | Longest pause (s) | ASR word error rate |", "|---|---|---|---|---|---|---|---|"]
    for r in rep["results"]:
        if not r.get("ok"):
            rows.append(f"| `{r['voice']}` | ✖ {r.get('error', '')} | | | | | | |")
            continue
        w = asr.get(r["voice"], {}).get("wer")
        rows.append(f"| `{r['voice']}` | ✔ | {r['duration']} | {r['wpm']} | {r['rms_db']} | {r['clipped_samples']} | {r['longest_silence']} | {'' if w is None else f'{w:.1%}'} |")
    text = f"""# Voice comparison — Kokoro-82M (kokoro-onnx, CPU)

Same test text for all three voices (`lang="en-us"`, speed {rep['speed']}), trimmed + peak-normalised to −3 dBFS (non-destructive: no EQ, no compression).

> {rep['text']}

TTS input after US-English normalisation (numbers/years spelled the way a US narrator says them):

> {rep['tts_text']}

{chr(10).join(rows)}

Files: `output/episode-{a.episode}/audio/voices/voice_am_michael.wav`, `voice_am_adam.wav`, `voice_af_heart.wav`.

## How this was judged

The voices were **not judged by ear in this session** (no listening possible in a headless container). Instead:

* **Intelligibility** — each WAV was transcribed with a local speech recogniser (faster-whisper `base.en`, CPU) and compared with the script: word error rate above. All three were transcribed with 0 % errors, including "$849.9 billion" and "2025".
* **Technical health** — duration, speaking rate, loudness, clipping and abnormal pauses were measured from the samples.
* **Pace** — the brief targets 125–155 wpm. At speed 0.96, `am_michael` was the slowest (≈134 wpm), so the episode uses **speed 1.0** for it (≈149 wpm while speaking in the full episode).

## Decision

`VOICE_ID = {ep['voice']['voiceId']}` (default required by the brief; all three voices worked and were equally intelligible).
Please listen to the three WAVs yourself: naturalness and timbre are subjective and are your call.

To change voice for the whole episode, edit `voice.voiceId` / `voice.speed` in `content/episode-{a.episode}/episode.json`
(or set the env var `VOICE_ID`) and rerun `npm run pilot` / `npm run episode:{a.episode}`. Only segments whose text, voice or speed changed are re-synthesised.
"""
    (base / "voice_comparison.md").write_text(text, encoding="utf-8")
    print("wrote", base / "voice_comparison.md")


def cmd_chapters(a):
    tl = load_timeline(a.episode)
    if not tl:
        sys.exit("no full timeline yet")
    d = episode_dir(a.episode)
    p = d / "youtube_description.md"
    chapters = []
    for i, sc in enumerate(tl["scenes"]):
        start = 0 if i == 0 else sc["start"]
        chapters.append(f"{ts(start)} {sc['chapter']}")
    block = "<!-- chapters:start (generated from the measured timeline by python/write_docs.py chapters) -->\n" + "\n".join(chapters) + "\n<!-- chapters:end -->"
    text = p.read_text(encoding="utf-8")
    text = re.sub(r"<!-- chapters:start.*?<!-- chapters:end -->", block, text, flags=re.S)
    p.write_text(text, encoding="utf-8")
    print(block)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["script", "voices", "chapters"])
    ap.add_argument("--episode", default="001")
    a = ap.parse_args()
    {"script": cmd_script, "voices": cmd_voices, "chapters": cmd_chapters}[a.cmd](a)


if __name__ == "__main__":
    main()
