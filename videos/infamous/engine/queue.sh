#!/bin/bash
# Voices, renders and packages every approved episode (listed in $WORK/approved.txt) whose .mp4 is missing or older than its script, in order.
# Re-scans after each episode, so scripts added while it runs are picked up. Exits when $WORK/queue.stop exists and nothing is left.
H=$(cd "$(dirname "$0")" && pwd); R=$H/..; : "${WORK:?set WORK}"; PY=${PY:-$WORK/tts/bin/python3}
while true; do
  next=""; for d in $R/[0-9][0-9]-*/; do d=${d%/}; [ -f $d/script.json ] || continue; v=$(ls $d/*.mp4 2>/dev/null | head -1); [ -n "$v" ] && [ "$v" -nt $d/script.json ] && continue; grep -qx "$(basename $d)" $WORK/approved.txt 2>/dev/null || continue; grep -qx "$(basename $d)" $WORK/failed.txt 2>/dev/null && continue; next=$d; break; done
  if [ -z "$next" ]; then [ -f $WORK/queue.stop ] && exit 0; sleep 30; continue; fi
  n=$(basename $next); E=$WORK/work/$n; mkdir -p $E; echo "start $n $(date +%T)"
  if { [ $E/durs.json -nt $next/script.json ] || $PY -I $H/voice.py $next/script.json $E > $E/run.log 2>&1; } && $H/../engine3d/render_ep.sh $E $next/script.json infamous-$n >> $E/run.log 2>&1 && python3 -I $H/package.py $next $E >> $E/run.log 2>&1; then echo "done $n $(date +%T)"; rm -f $E/seg*.mp4 $E/video.mp4 $E/vo/*.wav; else echo "FAILED $n"; echo $n >> $WORK/failed.txt; fi
done
