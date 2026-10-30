#!/bin/bash
# Detached, resumable render of every 3D shot of an episode (plate + character layer + composite), in story order.
# Usage: scripts/render_shots_ep.sh 004 [sh01 sh02 ...]   — progress in output/episode-XXX/shots/render.log
EP=${1:-004}; shift
cd "$(dirname "$0")/.."
LOG=output/episode-$EP/shots/render.log
mkdir -p "$(dirname "$LOG")"
IDS=${*:-$(python3 -c "import re;print(' '.join(re.findall(r'@shot\(\"(sh[0-9]+b?)\"', open('blender/shots/ep$EP.py').read())))")}
for sh in $IDS; do
  echo "[$(date +%H:%M:%S)] start $sh" >> "$LOG"
  ${BLENDER:-blender} -b --factory-startup --python blender/render_shot.py -- --episode "$EP" --shot "$sh" --mode all 2>&1 | grep -E "PLATE|CHARS|Error|Traceback|KeyError" >> "$LOG"
  .venv/bin/python python/composite_shots.py --episode "$EP" --only "$sh" >> "$LOG" 2>&1
done
echo "[$(date +%H:%M:%S)] ALL_SHOTS_DONE" >> "$LOG"
