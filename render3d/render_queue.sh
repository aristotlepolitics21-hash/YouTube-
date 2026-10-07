#!/bin/bash
# Render episodes one after another, retrying once to resume failed shots, then make a 720p review copy (<30 MB).
# Usage: render3d/render_queue.sh [wait_pid] ep1 ep2 ...
cd "$(dirname "$0")/.."
if [[ "$1" =~ ^[0-9]+$ ]]; then while kill -0 "$1" 2>/dev/null; do sleep 30; done; shift; fi
for ep in "$@"; do
  out=render3d/out/$ep.mp4
  for try in 1 2 3; do
    [ -s "$out" ] && break
    python3 render3d/make_episode.py render3d/episodes/$ep.json --voice voices/en_US-ryan-high.onnx -o "$out" --workers 3 >> render3d/out/$ep.log 2>&1
  done
  if [ -s "$out" ]; then
    rev=render3d/out/${ep}_review_720p.mp4
    ffmpeg -y -loglevel error -i "$out" -vf scale=1280:720 -c:v libx264 -b:v 380k -pass 1 -passlogfile /tmp/$ep.pass -an -f mp4 /dev/null &&
    ffmpeg -y -loglevel error -i "$out" -vf scale=1280:720 -c:v libx264 -b:v 380k -pass 2 -passlogfile /tmp/$ep.pass -c:a aac -b:a 64k "$rev"
    echo "DONE $ep $(date)" >> render3d/out/queue.log
  else
    echo "FAILED $ep $(date)" >> render3d/out/queue.log
  fi
done
