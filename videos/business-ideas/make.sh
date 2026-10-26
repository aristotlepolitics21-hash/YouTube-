#!/bin/bash
# usage: make.sh EPDIR WORKDIR [hi|en ...]   (needs KOKORO_DIR, see ../tech-shorts/engine/setup_kokoro.sh)
# Voices the script, renders the frames in 3 parallel segments, adds the voices, and writes the video, captions and thumbnail into EPDIR.
# One-language episodes (batch 2 on) use script.json; batch 1 has script-hi.json and script-en.json, picked by the language arguments.
set -e
H=$(cd "$(dirname "$0")" && pwd); EP=$(cd $1 && pwd); W0=$2; shift 2
if [ -f $EP/script.json ]; then LANGS=one; else LANGS=${@:-hi en}; fi
for L in $LANGS; do
  if [ $L = one ]; then W=$W0; SUF=; export SCRIPT=script.json; else W=$W0/$L; SUF=-$L; export SCRIPT=script-$L.json; fi; mkdir -p $W
  OUT=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['out'])" $EP/$SCRIPT)
  [ -f $W/durs.json ] || python3 -I $H/engine/voice.py $EP/$SCRIPT $W
  TOT=$(python3 -c "import json;print(round(sum(json.load(open('$W/durs.json')))*30))"); N=3; S=$(( (TOT + N - 1) / N ))
  for i in $(seq 0 $((N-1))); do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); NODE_PATH=$(npm root -g) node $H/engine/render.cjs $EP $W $W/seg$i.mp4 $a $b & done; wait
  for i in $(seq 0 $((N-1))); do echo "file '$W/seg$i.mp4'"; done > $W/concat.txt
  ffmpeg -v error -y -f concat -safe 0 -i $W/concat.txt -c copy $W/video.mp4
  ffmpeg -v error -y -i $W/video.mp4 -i $W/narration.wav -af "highpass=f=70,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-14:TP=-1.5:LRA=9" \
    -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart $EP/$OUT.mp4
  cp $W/captions.srt $EP/captions$SUF.srt
  NODE_PATH=$(npm root -g) node $H/engine/render.cjs $EP $W $EP/thumbnail$SUF.jpg --still $(python3 -c "import json;d=json.load(open('$W/durs.json'));print(sum(d[:9])+1.2)")
  echo made $EP/$OUT.mp4
done
