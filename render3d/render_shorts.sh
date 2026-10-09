#!/bin/sh
# Render the Medical Body shorts one after another (skips finished ones). Log: out/<ep>.log
cd "$(dirname "$0")"
for ep in ${@:-sneeze battery mosquito hiccups spicy funnybone bruise floaters sunburn earspop}; do
  [ -s out/$ep.mp4 ] && continue
  python3 make_episode.py episodes/$ep.json --voice ../voices/en_US-ryan-high.onnx -o out/$ep.mp4 --workers 3 > out/$ep.log 2>&1 && echo "DONE $ep" >> out/shorts.log || echo "FAILED $ep" >> out/shorts.log
done
