"""Objective intelligibility check: transcribe WAVs with faster-whisper (CPU, MIT) and compute WER.

This is QA only; it never changes audio. Model: Systran/faster-whisper-base.en (downloaded once from Hugging Face).

Usage
  python python/asr_check.py voices --episode 001
  python python/asr_check.py narration --episode 001
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import load_episode, normalize_for_tts, output_dir, write_json  # noqa: E402

_model = None


def model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel("base.en", device="cpu", compute_type="int8")
    return _model


def transcribe(path: Path) -> str:
    # decode ourselves (PyAV API differs between versions); linear resample to 16 kHz is fine for ASR
    import numpy as np
    import soundfile as sf
    x, sr = sf.read(str(path), dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    t = np.arange(0, len(x) / sr, 1 / 16000)
    audio = np.interp(t, np.arange(len(x)) / sr, x).astype(np.float32)
    segs, _ = model().transcribe(audio, language="en", beam_size=5, vad_filter=False)
    return " ".join(s.text.strip() for s in segs)



def canon(s: str) -> str:
    """Lowercase, drop punctuation and spell digits so '15.8%' and 'fifteen point eight percent' compare."""
    s = normalize_for_tts(s).lower().replace("-", " ")
    s = s.replace("u p s", "ups").replace("n r f", "nrf")
    s = re.sub(r"(\d),(\d)", r"\1\2", s)

    def num(m):
        from math import floor  # noqa: F401
        txt = m.group(0)
        whole, _, frac = txt.partition(".")
        words = int_words(int(whole))
        if frac:
            words += " point " + " ".join(int_words(int(d)) for d in frac)
        return words

    s = re.sub(r"\d+(?:\.\d+)?", num, s)
    s = re.sub(r"[^a-z' ]", " ", s).replace("'", "")
    return re.sub(r"\s+", " ", s).strip()


ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def int_words(n: int) -> str:
    if n < 20:
        return ONES[n]
    if n < 100:
        t, o = divmod(n, 10)
        return TENS[t] + (" " + ONES[o] if o else "")
    if n < 1000:
        h, r = divmod(n, 100)
        return ONES[h] + " hundred" + (" " + int_words(r) if r else "")
    th, r = divmod(n, 1000)
    return int_words(th) + " thousand" + (" " + int_words(r) if r else "")


def wer(ref: str, hyp: str) -> float:
    import jiwer
    return round(jiwer.wer(canon(ref), canon(hyp)), 3)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("target", choices=["voices", "narration"])
    p.add_argument("--episode", default="001")
    a = p.parse_args()
    out = output_dir(a.episode) / "audio"
    rows = []
    if a.target == "voices":
        rep = json.loads((out / "voices" / "voices_report.json").read_text())
        for r in rep["results"]:
            if not r.get("ok"):
                continue
            hyp = transcribe(out / "voices" / f"voice_{r['voice']}.wav")
            rows.append({"voice": r["voice"], "wer": wer(rep["text"], hyp), "transcript": hyp})
            print(json.dumps(rows[-1]))
        write_json(out / "voices" / "asr_report.json", rows)
    else:
        ep = load_episode(a.episode)
        man = json.loads((out / "narration" / "manifest.json").read_text())
        for sc in ep["scenes"]:
            for seg in sc["segments"]:
                key = f"{sc['id']}-{seg['id']}"
                hyp = transcribe(out / "narration" / man[key]["file"])
                rows.append({"segment": key, "wer": wer(seg["text"], hyp), "ref": seg["text"], "transcript": hyp})
                flag = "  <-- check" if rows[-1]["wer"] > 0.12 else ""
                print(f"{key} WER={rows[-1]['wer']}{flag}")
        total_words = sum(len(canon(r["ref"]).split()) for r in rows)
        mean = sum(r["wer"] * len(canon(r["ref"]).split()) for r in rows) / max(1, total_words)
        write_json(out / "narration" / "asr_report.json", {"weighted_wer": round(mean, 4), "segments": rows})
        print(f"weighted WER: {mean:.3%}")


if __name__ == "__main__":
    main()
