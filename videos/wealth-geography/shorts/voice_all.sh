#!/bin/bash
# usage: KOKORO_DIR=DIR voice_all.sh WORKROOT  -> voices every Short into WORKROOT/NN-slug (skips ones already voiced)
H=$(cd "$(dirname "$0")" && pwd)
for d in $H/[0-9][0-9]-*/; do n=$(basename $d); W=$1/$n; mkdir -p $W; [ -f $W/durs.json ] && continue
  read V R < <(python3 -c "import json,sys;s=json.load(open(sys.argv[1]));print(s['voice'],s['rate'])" $d/script.json)
  echo "$n $(python3 -I $H/../../tech-shorts/engine/voice.py $d/script.json $W $V $R | tail -1)"; done
