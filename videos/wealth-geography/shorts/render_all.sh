#!/bin/bash
# usage: KOKORO_DIR=DIR render_all.sh WORKROOT [parallel]  -> renders every Short (3 at a time by default) to WORKROOT/NN-slug/NN-slug.mp4
# and copies its captions into the Short's folder. Finished renders are skipped, so it can be re-run after an interruption.
H=$(cd "$(dirname "$0")" && pwd); export H R=$1
one() { n=$(basename $1); W=$R/$n; mkdir -p $W; [ -s $W/$n.mp4 ] && { echo "$n already done"; return; }
  if $H/../engine/render.sh $1/script.json $W $n 1 > $W/render.log 2>&1; then cp $W/captions.srt $1/; echo "$n done $(ffprobe -v error -show_entries format=duration -of csv=p=0 $W/$n.mp4)s"; else echo "$n FAILED"; fi; }
export -f one; ls -d $H/[0-9][0-9]-*/ | sed 's:/$::' | xargs -P ${2:-3} -I{} bash -c 'one {}'
