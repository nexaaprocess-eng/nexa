"""Kokoro-82M (kokoro-onnx, CPU) narration for Hidden Ledger.

Subcommands
  voices     render the same ~20 s test text with am_michael, am_adam, af_heart
  narration  render every script segment (cached by hash of text+voice+speed+model)

Usage
  python python/generate_voice.py voices --episode 001
  python python/generate_voice.py narration --episode 001 [--voice am_adam] [--speed 0.95] [--force]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import (MODEL_FILE, SR, VOICES_FILE, analyze, ffprobe_duration, load_episode,  # noqa: E402
                    normalize_for_tts, output_dir, trim_silence, write_json)

TEST_VOICES = ["am_michael", "am_adam", "af_heart"]
TEST_TEXT = (
    "You order a jacket online, and three days later, you send it back. The label is free. "
    "The refund arrives. But the jacket's journey is only beginning. "
    "It gets scanned, trucked, sorted, and inspected... and every step costs somebody something. "
    "In 2025, the National Retail Federation projected $849.9 billion in returned merchandise. "
    "So who actually pays for a free return?"
)

_kokoro = None


def kokoro():
    global _kokoro
    if _kokoro is None:
        if not MODEL_FILE.exists() or not VOICES_FILE.exists():
            sys.exit(f"Model files missing in {MODEL_FILE.parent}. Run: npm run setup:model")
        os.environ.setdefault("ONNX_PROVIDER", "CPUExecutionProvider")
        from kokoro_onnx import Kokoro
        _kokoro = Kokoro(str(MODEL_FILE), str(VOICES_FILE))
    return _kokoro


def synth(text: str, voice: str, speed: float, lang: str, retries: int = 3) -> np.ndarray:
    """Synthesize and validate; raise instead of silently returning silence."""
    last = None
    for attempt in range(1, retries + 1):
        try:
            samples, sr = kokoro().create(text, voice=voice, speed=speed, lang=lang)
            assert sr == SR, f"unexpected sample rate {sr}"
            x = trim_silence(np.asarray(samples, dtype=np.float32), sr)
            a = analyze(x, sr)
            words = len(text.split())
            min_dur = 0.18 * words  # ~330 wpm upper bound -> anything shorter is broken
            problems = []
            if a["duration"] < min_dur:
                problems.append(f"too short ({a['duration']}s for {words} words)")
            if a["rms_db"] < -40:
                problems.append(f"near-silent (rms {a['rms_db']} dB)")
            if a["longest_silence"] > 1.6:
                problems.append(f"internal silence {a['longest_silence']}s")
            if problems:
                raise RuntimeError("; ".join(problems))
            return x
        except Exception as e:  # noqa: BLE001
            last = e
            print(f"   attempt {attempt} failed: {e}")
    raise RuntimeError(f"TTS failed after {retries} attempts: {last}")


def peak_normalize(x: np.ndarray, target_db: float = -3.0) -> np.ndarray:
    peak = float(np.max(np.abs(x))) or 1.0
    return (x / peak * 10 ** (target_db / 20)).astype(np.float32)


def cmd_voices(args):
    ep = load_episode(args.episode)
    out = output_dir(args.episode) / "audio" / "voices"
    out.mkdir(parents=True, exist_ok=True)
    # an episode can override the comparison set: "voiceTest": {"voices": [...], "text": "..."}
    vt = ep.get("voiceTest", {})
    test_text, test_voices = vt.get("text", TEST_TEXT), vt.get("voices", TEST_VOICES)
    text = normalize_for_tts(test_text, ep.get("lexicon"))
    rows = []
    for v in test_voices:
        t0 = time.time()
        try:
            x = peak_normalize(synth(text, v, args.speed or 0.96, "en-us"))
            path = out / f"voice_{v}.wav"
            sf.write(path, x, SR, subtype="PCM_16")
            a = analyze(x, SR)
            a.update(voice=v, ok=True, file=str(path.relative_to(out.parent.parent.parent.parent)),
                     ffprobe_duration=ffprobe_duration(path), render_seconds=round(time.time() - t0, 1),
                     wpm=round(len(test_text.split()) / a["duration"] * 60, 1))
        except Exception as e:  # noqa: BLE001
            a = {"voice": v, "ok": False, "error": str(e)}
        print(json.dumps(a))
        rows.append(a)
    write_json(out / "voices_report.json", {"text": test_text, "tts_text": text, "speed": args.speed or 0.96, "results": rows})


def seg_hash(text: str, voice: str, speed: float, lang: str) -> str:
    h = hashlib.sha256()
    h.update(json.dumps([text, voice, round(speed, 3), lang, MODEL_FILE.name, VOICES_FILE.name]).encode())
    return h.hexdigest()[:16]


def cmd_narration(args):
    ep = load_episode(args.episode)
    vc = ep["voice"]
    voice = args.voice or os.environ.get("VOICE_ID") or vc["voiceId"]
    speed = float(args.speed or vc["speed"])
    lang = vc.get("lang", "en-us")
    root = output_dir(args.episode) / "audio" / "narration"
    manifest_path = root / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    new_manifest, failures, rendered, cached = {}, [], 0, 0
    for scene in ep["scenes"]:
        for seg in scene["segments"]:
            key = f"{scene['id']}-{seg['id']}"
            tts_text = normalize_for_tts(seg.get("say", seg["text"]), ep.get("lexicon"))
            h = seg_hash(tts_text, voice, speed, lang)
            path = root / f"scene-{scene['id'][1:]}" / f"segment-{seg['id']}.wav"
            prev = manifest.get(key)
            if not args.force and prev and prev.get("hash") == h and path.exists():
                new_manifest[key] = prev
                cached += 1
                continue
            print(f"-> {key}: {tts_text[:70]}...")
            try:
                x = synth(tts_text, voice, speed, lang)
                x = peak_normalize(x, -3.0)
                path.parent.mkdir(parents=True, exist_ok=True)
                sf.write(path, x, SR, subtype="PCM_16")
                a = analyze(x, SR)
                new_manifest[key] = {"hash": h, "file": str(path.relative_to(root)), "voice": voice, "speed": speed,
                                     "tts_text": tts_text, **a}
                rendered += 1
            except Exception as e:  # noqa: BLE001
                failures.append({"segment": key, "error": str(e)})
                print(f"   FAILED {key}: {e}")
    write_json(manifest_path, new_manifest)
    print(f"narration: {rendered} rendered, {cached} cached, {len(failures)} failed (voice={voice}, speed={speed})")
    if failures:
        write_json(root / "failures.json", failures)
        sys.exit(1)
    (root / "failures.json").unlink(missing_ok=True)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("command", choices=["voices", "narration"])
    p.add_argument("--episode", default="001")
    p.add_argument("--voice")
    p.add_argument("--speed", type=float)
    p.add_argument("--force", action="store_true")
    a = p.parse_args()
    {"voices": cmd_voices, "narration": cmd_narration}[a.command](a)


if __name__ == "__main__":
    main()
