#!/bin/bash
# usage: make.sh EPDIR WORKDIR   (needs KOKORO_DIR, see ../tech-shorts/engine/setup_kokoro.sh, and EPDIR/images/s1.jpg ... from the image prompts)
# Voices the script, renders the scenes with slow camera moves and captions, adds the narration, and writes the video and a thumbnail into EPDIR.
set -e
H=$(cd "$(dirname "$0")" && pwd); EP=$(cd $1 && pwd); W=$2; mkdir -p $W/img
OUT=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['out'])" $EP/script.json)
[ -f $W/durs.json ] || python3 -I $H/../tech-shorts/engine/voice.py $EP/script.json $W kokoro:am_michael 108
for f in $EP/images/*.jpg; do ffmpeg -v error -y -i $f -vf "scale=1296:-2" -q:v 3 $W/img/$(basename $f); done
TOT=$(python3 -c "import json;print(round(sum(json.load(open('$W/durs.json')))*30))"); N=3; S=$(( (TOT + N - 1) / N ))
for i in $(seq 0 $((N-1))); do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); NODE_PATH=$(npm root -g) node $H/engine/render.cjs $EP $W $W/seg$i.mp4 $a $b & done; wait
for i in $(seq 0 $((N-1))); do echo "file '$W/seg$i.mp4'"; done > $W/concat.txt
ffmpeg -v error -y -f concat -safe 0 -i $W/concat.txt -c copy $W/video.mp4
ffmpeg -v error -y -i $W/video.mp4 -i $W/narration.wav -af "highpass=f=70,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-14:TP=-1.5:LRA=9" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart $EP/$OUT.mp4
cp $W/captions.srt $EP/
ffmpeg -v error -y -i $EP/images/s1.jpg -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -q:v 2 $EP/thumbnail.jpg
echo made $EP/$OUT.mp4
