"""Environment diagnosis: tools, versions, memory, CPU, fonts, model, write permissions, paths.

Writes diagnostics/doctor.json and prints a readable summary with concrete fixes and suggested render settings.
"""
from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import MODEL_FILE, ROOT, VOICES_FILE, write_json  # noqa: E402


def ver(cmd: list[str]) -> str | None:
    exe = shutil.which(cmd[0])
    if not exe:
        return None
    try:
        out = subprocess.run([exe, *cmd[1:]], capture_output=True, text=True, timeout=30)
        return (out.stdout or out.stderr).strip().splitlines()[0]
    except Exception as e:  # noqa: BLE001
        return f"error: {e}"


def mem_gb() -> float | None:
    try:
        if sys.platform == "win32":
            import ctypes

            class MS(ctypes.Structure):
                _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong), ("ullTotalPhys", ctypes.c_ulonglong),
                            ("ullAvailPhys", ctypes.c_ulonglong), ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                            ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong), ("sullAvailExtendedVirtual", ctypes.c_ulonglong)]
            m = MS()
            m.dwLength = ctypes.sizeof(MS)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))
            return round(m.ullTotalPhys / 1e9, 1)
        return round(os.sysconf("SC_PAGE_SIZE") * os.sysconf("SC_PHYS_PAGES") / 1e9, 1)
    except Exception:  # noqa: BLE001
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", default="001")
    a = ap.parse_args()
    checks, blockers, warnings = {}, [], []

    checks["os"] = f"{platform.system()} {platform.release()} ({platform.machine()})"
    checks["python"] = sys.version.split()[0]
    checks["node"] = ver(["node", "-v"])
    checks["npm"] = ver(["npm.cmd" if sys.platform == "win32" else "npm", "-v"])
    checks["ffmpeg"] = ver(["ffmpeg", "-version"])
    checks["ffprobe"] = ver(["ffprobe", "-version"])
    cpus = os.cpu_count() or 1
    checks["cpu_threads"] = cpus
    checks["ram_gb"] = mem_gb()
    checks["disk_free_gb"] = round(shutil.disk_usage(ROOT).free / 1e9, 1)

    for k in ("node", "ffmpeg", "ffprobe"):
        if not checks[k]:
            blockers.append(f"{k} not found on PATH. Windows: `winget install OpenJS.NodeJS.LTS` / `winget install Gyan.FFmpeg`")
    if sys.version_info < (3, 10):
        blockers.append("Python 3.10+ required")

    # python packages
    pk = {}
    for mod in ("kokoro_onnx", "onnxruntime", "numpy", "soundfile", "faster_whisper", "jiwer"):
        try:
            m = __import__(mod)
            pk[mod] = getattr(m, "__version__", "installed")
        except Exception as e:  # noqa: BLE001
            pk[mod] = None
            (blockers if mod in ("kokoro_onnx", "onnxruntime", "numpy", "soundfile") else warnings).append(f"python package {mod} missing ({e.__class__.__name__}): run `npm run setup`")
    checks["python_packages"] = pk
    try:
        import onnxruntime as ort
        checks["onnx_providers"] = ort.get_available_providers()
    except Exception:  # noqa: BLE001
        pass

    checks["model"] = {"kokoro-v1.0.onnx": MODEL_FILE.exists(), "voices-v1.0.bin": VOICES_FILE.exists()}
    if not all(checks["model"].values()):
        blockers.append("Kokoro model files missing: run `npm run setup` (downloads + verifies SHA-256)")

    fonts = ROOT / "assets" / "fonts"
    checks["fonts"] = sorted(p.name for p in fonts.glob("*.woff2"))
    if len(checks["fonts"]) < 2:
        warnings.append("brand fonts missing in assets/fonts (render falls back to system fonts)")
    checks["node_modules"] = (ROOT / "node_modules" / "remotion").exists()
    if not checks["node_modules"]:
        blockers.append("node_modules missing: run `npm ci`")

    # write permission
    try:
        t = ROOT / "output" / ".write_test"
        t.parent.mkdir(parents=True, exist_ok=True)
        t.write_text("ok")
        t.unlink()
        checks["output_writable"] = True
    except Exception as e:  # noqa: BLE001
        checks["output_writable"] = False
        blockers.append(f"cannot write to output/: {e}")

    if " " in str(ROOT) and sys.platform == "win32":
        warnings.append("project path contains spaces; it should work, but a path like C:\\hl\\hidden-ledger avoids edge cases")
    ram = checks["ram_gb"] or 8
    conc = max(1, min(4, cpus // 2, int(ram // 3)))
    checks["suggested"] = {
        "render_concurrency": conc,
        "pilot_quality": "preview (1280x720)",
        "episode_quality": "hd (1920x1080)" if ram >= 8 else "preview (1280x720); 1080p may swap on <8 GB RAM",
        "note": "CPU only; CUDA is never required. Lower --concurrency if the machine becomes unresponsive.",
    }
    if ram < 8:
        warnings.append(f"only {ram} GB RAM: use `--concurrency 1` and preview quality")
    report = {"checks": checks, "blockers": blockers, "warnings": warnings}
    write_json(ROOT / "diagnostics" / "doctor.json", report)

    print("Hidden Ledger · doctor\n")
    for k, v in checks.items():
        print(f"  {k:18} {v}")
    print("\nBlockers:" if blockers else "\nBlockers: none")
    for b in blockers:
        print("  ✖", b)
    print("Warnings:" if warnings else "Warnings: none")
    for w in warnings:
        print("  !", w)
    sys.exit(1 if blockers else 0)


if __name__ == "__main__":
    main()
