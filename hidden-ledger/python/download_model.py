"""Download Kokoro-82M ONNX model files from the official kokoro-onnx release and verify SHA-256."""
from __future__ import annotations

import hashlib
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import MODELS  # noqa: E402

BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = {
    "kokoro-v1.0.onnx": "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5",
    "voices-v1.0.bin": "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
}


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    MODELS.mkdir(parents=True, exist_ok=True)
    for name, digest in FILES.items():
        dest = MODELS / name
        if dest.exists() and sha256(dest) == digest:
            print(f"ok   {name}")
            continue
        print(f"get  {name} ...")
        urllib.request.urlretrieve(BASE + name, dest)
        got = sha256(dest)
        if got != digest:
            dest.unlink()
            sys.exit(f"checksum mismatch for {name}: {got}")
        print(f"ok   {name}")


if __name__ == "__main__":
    main()
