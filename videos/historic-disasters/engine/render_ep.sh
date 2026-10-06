#!/bin/bash
# usage: render_ep.sh EPDIR SCRIPT OUTNAME
set -e
D=/tmp/claude-0/-home-user-YouTube-/aece8624-b638-5e16-a980-11f89b661b06/scratchpad/doc; E=$1; FPS=30
python3 -I $D/build_page.py $2 $E/durs.json $E/page.html
TOT=$(python3 -c "import json;print(round(sum(json.load(open('$E/durs.json')))*$FPS))")
N=3; S=$(( (TOT + N - 1) / N ))
for i in 0 1 2; do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); NODE_PATH=$(npm root -g) node $D/seg.cjs $E/page.html $E/seg$i.mp4 $a $b $FPS > $E/seg$i.log 2>&1 & done; wait
printf "file '%s'\n" $E/seg0.mp4 $E/seg1.mp4 $E/seg2.mp4 > $E/concat.txt
ffmpeg -v error -y -f concat -safe 0 -i $E/concat.txt -c copy $E/video.mp4
ffmpeg -v error -y -i $E/video.mp4 -i $E/narration.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart $E/master.mp4
ffmpeg -v error -y -i $E/master.mp4 -c:v libx264 -crf 27 -preset slow -c:a aac -b:a 128k -movflags +faststart $E/$3.mp4
ls -la $E/$3.mp4; ffprobe -v error -show_entries format=duration -of csv=p=0 $E/$3.mp4; grep -h ERR $E/seg*.log | head -3 || true
