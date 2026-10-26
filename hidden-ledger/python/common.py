"""Shared helpers: project paths, episode loading, TTS text normalization, WAV analysis."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / "models"
MODEL_FILE = MODELS / "kokoro-v1.0.onnx"
VOICES_FILE = MODELS / "voices-v1.0.bin"
SR = 24000  # Kokoro native sample rate
MIX_SR = 48000


def episode_dir(ep: str) -> Path:
    return ROOT / "content" / f"episode-{ep}"


def output_dir(ep: str) -> Path:
    return ROOT / "output" / f"episode-{ep}"


def load_episode(ep: str) -> dict:
    return json.loads((episode_dir(ep) / "episode.json").read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- normalization
_ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
_TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def two_digits(n: int) -> str:
    if n < 20:
        return _ONES[n]
    t, o = divmod(n, 10)
    return _TENS[t] + ("-" + _ONES[o] if o else "")


def int_words(n: int) -> str:
    if n < 100:
        return two_digits(n)
    if n < 1000:
        h, r = divmod(n, 100)
        return _ONES[h] + " hundred" + (" " + two_digits(r) if r else "")
    th, r = divmod(n, 1000)
    return int_words(th) + " thousand" + (" " + int_words(r) if r else "")


def year_words(y: int) -> str:
    """2025 -> 'twenty twenty-five', 2005 -> 'two thousand five' (US usage)."""
    hi, lo = divmod(y, 100)
    if hi == 20 and lo < 10:
        return "two thousand" + (" " + _ONES[lo] if lo else "")
    return two_digits(hi) + " " + (two_digits(lo) if lo >= 10 else ("oh " + _ONES[lo] if lo else "hundred"))


def normalize_for_tts(text: str, lexicon: dict[str, str] | None = None) -> str:
    """Turn display text into text the phonemizer reads the way a US narrator would.

    espeak (used by kokoro-onnx) reads '$849.9 billion' as 'dollar eight hundred...'
    and '2025' as 'two thousand twenty five', so we rewrite those patterns.
    """
    s = text
    for k, v in (lexicon or {}).items():
        s = re.sub(rf"(?<![\w']){re.escape(k)}(?![\w])", v, s)
    # $849.9 billion -> 849.9 billion dollars ; $100 -> 100 dollars
    s = re.sub(r"\$(\d+(?:,\d{3})*(?:\.\d+)?)(\s+(?:billion|million|trillion|thousand))?",
               lambda m: f"{m.group(1)}{m.group(2) or ''} dollars", s)
    # years 1900-2099 that are not followed by %/digits
    s = re.sub(r"\b(19|20)(\d\d)\b(?![%.,]?\d)", lambda m: year_words(int(m.group(0))), s)
    # decimals: espeak's unstressed "point" gets swallowed ("15, 8"), so spell them out
    s = re.sub(r"\b(\d+)\.(\d+)\b",
               lambda m: int_words(int(m.group(1))) + " point " + " ".join(_ONES[int(d)] for d in m.group(2)), s)
    s = s.replace("%", " percent")
    return re.sub(r"\s+", " ", s).strip()


# ---------------------------------------------------------------- analysis
def analyze(samples: np.ndarray, sr: int) -> dict:
    x = samples.astype(np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    dur = len(x) / sr if sr else 0.0
    if len(x) == 0:
        return {"duration": 0.0, "peak_db": -120.0, "rms_db": -120.0, "silence_ratio": 1.0, "clipped_samples": 0, "longest_silence": dur}
    peak = float(np.max(np.abs(x)))
    rms = float(np.sqrt(np.mean(x ** 2)))
    win = max(1, int(sr * 0.02))
    n = len(x) // win
    frames = x[: n * win].reshape(n, win) if n else x.reshape(1, -1)
    frame_db = 20 * np.log10(np.sqrt(np.mean(frames ** 2, axis=1)) + 1e-9)
    silent = frame_db < -50
    longest = run = 0
    for v in silent:
        run = run + 1 if v else 0
        longest = max(longest, run)
    return {
        "duration": round(dur, 3),
        "peak_db": round(20 * np.log10(peak + 1e-9), 2),
        "rms_db": round(20 * np.log10(rms + 1e-9), 2),
        "silence_ratio": round(float(silent.mean()), 3),
        "longest_silence": round(longest * win / sr, 3),
        "clipped_samples": int(np.sum(np.abs(x) >= 0.999)),
    }


def ffprobe_duration(path: Path) -> float | None:
    if not shutil.which("ffprobe"):
        return None
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True)
    try:
        return float(out.stdout.strip())
    except ValueError:
        return None


def trim_silence(x: np.ndarray, sr: int, thresh_db: float = -45.0, keep: float = 0.04) -> np.ndarray:
    """Trim leading/trailing near-silence, keep a short margin, apply 6 ms fades."""
    if len(x) == 0:
        return x
    win = int(sr * 0.01)
    n = len(x) // win
    if n == 0:
        return x
    db = 20 * np.log10(np.sqrt(np.mean(x[: n * win].reshape(n, win) ** 2, axis=1)) + 1e-9)
    voiced = np.where(db > thresh_db)[0]
    if len(voiced) == 0:
        return x
    a = max(0, voiced[0] * win - int(keep * sr))
    b = min(len(x), (voiced[-1] + 1) * win + int(keep * 2 * sr))
    y = x[a:b].copy()
    f = int(sr * 0.006)
    if len(y) > 2 * f:
        y[:f] *= np.linspace(0, 1, f)
        y[-f:] *= np.linspace(1, 0, f)
    return y
