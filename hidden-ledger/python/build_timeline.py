"""Build the synced timeline, narration track and subtitles from the REAL rendered WAV segments.

* Segment duration = sample count of each WAV (cross-checked with ffprobe).
* Pauses come from episode.json -> voice.pauseBetweenSegments / pauseBetweenScenes / leadIn / tail.
* Subtitle cues: each segment is split at punctuation into readable chunks (<= 2 lines x 42 chars).
  Chunk boundaries inside a segment are anchored to word timestamps from faster-whisper run on that
  segment's audio. Segment start/end are exact. No timing is derived from character counts.
* Each segment also carries ASR word anchors ([absolute_time, word]) used by scenes for fine sync.

Usage
  python python/build_timeline.py --episode 001 [--scenes s01,s02 --until s02-06 --name pilot]
Outputs (output/episode-XXX/audio/<name>/): timeline.json, narration.wav (24 kHz mono), <name>.srt
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import SR, ffprobe_duration, load_episode, output_dir, write_json  # noqa: E402

FPS = 30
MAX_LINE = 42


def chunk_text(text: str) -> list[str]:
    """Split into subtitle chunks at sentence/clause punctuation, max ~2 lines."""
    sentences = re.split(r"(?<=[.?!])\s+", text.strip())
    chunks = []
    for s in sentences:
        if len(s) <= MAX_LINE * 2:
            chunks.append(s)
            continue
        parts = re.split(r"(?<=[,:;])\s+", s)
        cur = ""
        for p in parts:
            if cur and len(cur) + 1 + len(p) > MAX_LINE * 2:
                chunks.append(cur)
                cur = p
            else:
                cur = f"{cur} {p}".strip()
        if cur:
            # still too long -> split on words into balanced pieces (avoids orphan words like "in / 2025.")
            words = cur.split()
            n = -(-len(cur) // (MAX_LINE * 2))
            target = len(cur) / n
            piece = []
            for w in words:
                if piece and len(" ".join(piece)) + 1 + len(w) > target * 1.08 and len(chunks) < 999:
                    chunks.append(" ".join(piece))
                    piece = []
                piece.append(w)
            chunks.append(" ".join(piece))
    return chunks


def wrap2(s: str) -> str:
    if len(s) <= MAX_LINE:
        return s
    mid = len(s) // 2
    left, right = s.rfind(" ", 0, mid + 1), s.find(" ", mid)
    cut = left if right < 0 or (left >= 0 and mid - left <= right - mid) else right
    return s[:cut] + "\n" + s[cut + 1:]


_whisper = None


def word_times(path: Path) -> list[tuple[float, float, str]]:
    global _whisper
    if _whisper is None:
        from faster_whisper import WhisperModel
        _whisper = WhisperModel("base.en", device="cpu", compute_type="int8")
    x, sr = sf.read(str(path), dtype="float32")
    t = np.arange(0, len(x) / sr, 1 / 16000)
    audio = np.interp(t, np.arange(len(x)) / sr, x).astype(np.float32)
    segs, _ = _whisper.transcribe(audio, language="en", word_timestamps=True, beam_size=5)
    return [(w.start, w.end, w.word) for s in segs for w in s.words]


def spoken_units(s: str) -> int:
    """Rough count of spoken words, so '$849.9 billion' weighs more than 'it'."""
    n = 0
    for tok in s.split():
        digits = re.sub(r"[^\d]", "", tok)
        n += 1 + (len(digits) if digits else 0)
    return n


def anchor_chunks(chunks: list[str], words: list[tuple[float, float, str]], dur: float) -> list[tuple[float, float]]:
    if len(chunks) == 1 or not words:
        if len(chunks) > 1:
            print("   warning: no ASR words; chunk boundaries split by spoken units (approximate)")
            units = [spoken_units(c) for c in chunks]
            edges = np.cumsum([0] + units) / sum(units) * dur
            return [(edges[i], edges[i + 1]) for i in range(len(chunks))]
        return [(0.0, dur)]
    units = [spoken_units(c) for c in chunks]
    total = sum(units)
    hyp_units = [spoken_units(w[2]) for w in words]
    cum_h = np.cumsum(hyp_units) / sum(hyp_units)
    bounds = [0.0]
    acc = 0
    for u in units[:-1]:
        acc += u
        frac = acc / total
        k = int(np.searchsorted(cum_h, frac - 1e-9))
        k = min(k, len(words) - 2)
        # boundary in the gap between word k and k+1 (real audio timing)
        b = (words[k][1] + words[k + 1][0]) / 2
        bounds.append(max(bounds[-1] + 0.4, min(b, dur - 0.4)))
    bounds.append(dur)
    return [(bounds[i], bounds[i + 1]) for i in range(len(chunks))]


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", default="001")
    ap.add_argument("--scenes", help="comma-separated scene ids (default: all)")
    ap.add_argument("--until", help="last segment key to include, e.g. s02-06 (for pilots)")
    ap.add_argument("--name", default="full")
    a = ap.parse_args()
    ep = load_episode(a.episode)
    vc = ep["voice"]
    base = output_dir(a.episode) / "audio"
    man = json.loads((base / "narration" / "manifest.json").read_text())
    scenes = ep["scenes"]
    if a.scenes:
        keep = a.scenes.split(",")
        scenes = [s for s in scenes if s["id"] in keep]
    if a.until:
        cut_scene, cut_seg = a.until.split("-")
        idx = next(i for i, s in enumerate(scenes) if s["id"] == cut_scene)
        scenes = scenes[: idx + 1]
        last = dict(scenes[-1])
        segs = last["segments"]
        last["segments"] = segs[: next(i for i, g in enumerate(segs) if g["id"] == cut_seg) + 1]
        scenes[-1] = last
    dest = base / a.name
    dest.mkdir(parents=True, exist_ok=True)
    cache_path = base / "narration" / "word_times.json"
    wt_cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}

    t = float(vc["leadIn"])
    pieces = [np.zeros(int(t * SR), dtype=np.float32)]
    tl_scenes, cues = [], []
    for si, sc in enumerate(scenes):
        sc_start = 0.0 if si == 0 else t - vc["pauseBetweenScenes"] / 2
        if tl_scenes:
            tl_scenes[-1]["end"] = round(sc_start, 3)
        segs = []
        for gi, seg in enumerate(sc["segments"]):
            key = f"{sc['id']}-{seg['id']}"
            if key not in man:
                sys.exit(f"missing narration for {key}; run: npm run narration")
            wav = base / "narration" / man[key]["file"]
            x, sr = sf.read(str(wav), dtype="float32")
            assert sr == SR
            dur = len(x) / SR
            fp = ffprobe_duration(wav)
            if fp is not None and abs(fp - dur) > 0.02:
                sys.exit(f"duration mismatch {key}: samples {dur} vs ffprobe {fp}")
            pieces.append(x)
            segs.append({"id": seg["id"], "key": key, "text": seg["text"], "start": round(t, 3),
                         "end": round(t + dur, 3), "duration": round(dur, 3), "claims": seg.get("claims", []),
                         "duck": bool(seg.get("duck"))})
            # subtitles
            chunks = chunk_text(seg["text"])
            h = man[key]["hash"]
            if wt_cache.get(key, {}).get("hash") != h:
                wt_cache[key] = {"hash": h, "words": word_times(wav)}
            words = wt_cache[key]["words"]
            # word-level anchors (ASR) let scenes sync a figure to the moment it is spoken
            segs[-1]["words"] = [[round(t + w0, 3), w.strip()] for w0, _, w in words]
            for c, (a0, a1) in zip(chunks, anchor_chunks(chunks, words, dur)):
                cues.append({"start": round(t + a0, 3), "end": round(t + a1, 3), "text": wrap2(c)})
            t += dur
            last_seg = gi == len(sc["segments"]) - 1
            last_scene = si == len(scenes) - 1
            gap = vc["tail"] if (last_seg and last_scene) else vc["pauseBetweenScenes"] if last_seg else vc["pauseBetweenSegments"]
            gap = float(seg.get("pauseAfter", gap))
            pieces.append(np.zeros(int(round(gap * SR)), dtype=np.float32))
            t += gap
        tl_scenes.append({"id": sc["id"], "title": sc["title"], "chapter": sc.get("chapter", sc["title"]),
                          "music": sc.get("music", "neutral"), "start": round(sc_start, 3), "end": None, "segments": segs})
    write_json(cache_path, wt_cache)
    narration = np.concatenate(pieces)
    total = len(narration) / SR
    tl_scenes[-1]["end"] = round(total, 3)
    sf.write(dest / "narration.wav", narration, SR, subtype="PCM_16")
    timeline = {"episode": ep["id"], "title": ep["title"], "name": a.name, "fps": FPS,
                "duration": round(total, 3), "durationInFrames": int(np.ceil(total * FPS)),
                "voice": man[next(iter(man))]["voice"], "scenes": tl_scenes, "subtitles": cues}
    write_json(dest / "timeline.json", timeline)
    with open(dest / f"{a.name}.srt", "w", encoding="utf-8") as f:
        for i, c in enumerate(cues, 1):
            f.write(f"{i}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}\n\n")
    words = sum(len(s["text"].split()) for sc in tl_scenes for s in sc["segments"])
    speech = sum(s["duration"] for sc in tl_scenes for s in sc["segments"])
    print(f"{a.name}: {len(tl_scenes)} scenes, {total:.2f}s total, {words} words, "
          f"{words / speech * 60:.0f} wpm while speaking, {len(cues)} subtitle cues")
    for sc in tl_scenes:
        print(f"  {sc['id']} {sc['start']:7.2f} -> {sc['end']:7.2f}  {sc['title']}")


if __name__ == "__main__":
    main()
