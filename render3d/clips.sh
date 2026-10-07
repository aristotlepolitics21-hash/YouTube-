#!/bin/sh
# Render all six shots as 2.5 s / 24 fps clips (two Chromium workers), then encode.
set -e
cd "$(dirname "$0")"
FR=${FRAMES:-60}
( for s in 0 2 4; do node render.mjs --shot $s --frames $FR; done ) &
( for s in 1 3 5; do node render.mjs --shot $s --frames $FR; done ) &
wait
mkdir -p out
for i in 1 2 3 4 5 6; do
  ffmpeg -y -loglevel error -framerate 24 -i frames/shot$i/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 out/shot$i.mp4
done
printf "file 'shot%s.mp4'\n" 1 2 3 4 5 6 > out/list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/swallow_gum_3d.mp4
echo DONE
