#!/bin/bash
# usage: render.sh SCRIPT.json WORKDIR OUTNAME [segments]
# Voices the script with Kokoro (needs KOKORO_DIR; see ../../tech-shorts/engine/setup_kokoro.sh), builds the page,
# renders it at 24 fps in parallel segments, then mixes the narration over a low drone and muxes.
set -e
H=$(cd "$(dirname "$0")" && pwd); W=$2; FPS=24; N=${4:-3}
read VOICE RATE < <(python3 -c "import json,sys;s=json.load(open(sys.argv[1]));print(s['voice'],s.get('rate',100))" $1)
[ -f $W/durs.json ] || python3 -I $H/../../tech-shorts/engine/voice.py $1 $W $VOICE $RATE
python3 -I $H/build_page.py $1 $W $W/page.html
TOT=$(python3 -c "import json;print(round(sum(json.load(open('$W/durs.json')))*$FPS))"); S=$(( (TOT + N - 1) / N ))
for i in $(seq 0 $((N-1))); do a=$((i*S)); b=$(( (i+1)*S < TOT ? (i+1)*S : TOT )); [ -s $W/seg$i.mp4 ] || NODE_PATH=$(npm root -g) node $H/seg.cjs $W/page.html $W/seg$i.mp4 $a $b $FPS > $W/seg$i.log 2>&1 & done; wait
for i in $(seq 0 $((N-1))); do echo "file '$W/seg$i.mp4'"; done > $W/concat.txt
ffmpeg -v error -y -f concat -safe 0 -i $W/concat.txt -c copy $W/video.mp4
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $W/narration.wav)
# a low, slowly breathing drone under the voice: two detuned sines through a lowpass, faded in and out
ffmpeg -v error -y -f lavfi -i "sine=f=55:d=$D" -f lavfi -i "sine=f=82.4:d=$D" -f lavfi -i "anoisesrc=d=$D:c=brown:a=0.05" \
  -filter_complex "[0][1][2]amix=inputs=3:weights=1 0.6 0.5,lowpass=f=400,volume='0.10+0.04*sin(t*0.21)':eval=frame,afade=t=in:d=3,afade=t=out:st=$(python3 -c "print($D-4)"):d=4[m]" -map "[m]" -ar 48000 $W/bed.wav
ffmpeg -v error -y -i $W/video.mp4 -i $W/narration.wav -i $W/bed.wav -filter_complex \
  "[1]aresample=48000,highpass=f=70,acompressor=threshold=-18dB:ratio=3[v];[v][2]amix=inputs=2:weights=1 1:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart $W/$3.mp4
ls -la $W/$3.mp4; ffprobe -v error -show_entries format=duration -of csv=p=0 $W/$3.mp4; grep -h ERR $W/seg*.log | head -3 || true
