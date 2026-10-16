#!/bin/bash
# usage: finalize.sh EPDIR WORKDIR OUTNAME
# Copies the render, captions and chapters into the episode folder and renders a caption-free title-card thumbnail (line 2 of the script).
set -e
H=$(cd "$(dirname "$0")" && pwd); E=$1; W=$2
cp $W/$3.mp4 $W/captions.srt $W/chapters.txt $E/
NODE_PATH=$(npm root -g) node $H/thumb.cjs $W/page3d.html $E/thumbnail.jpg
S=$(stat -c %s $E/$3.mp4); if [ $S -gt 31000000 ]; then ffmpeg -v error -y -i $E/$3.mp4 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart $W/$3-preview.mp4; fi
echo finalized $E
