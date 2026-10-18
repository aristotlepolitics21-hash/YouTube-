#!/bin/bash
# usage: make-all.sh WORKROOT
# Render worker: renders the episodes named in WORKROOT/queue.txt (one folder name per line), in order,
# skipping any that already have a video. Waits for more when the queue is empty; touch WORKROOT/stop to end it.
H=$(cd "$(dirname "$0")" && pwd); R=$1; touch $R/queue.txt
while [ ! -f $R/stop ]; do
  N=""; while read -r e; do [ -n "$e" ] || continue; ls $H/$e/*.mp4 >/dev/null 2>&1 || grep -qx "$e" $R/failed.txt 2>/dev/null || { N=$e; break; }; done < $R/queue.txt
  if [ -z "$N" ]; then sleep 20; continue; fi
  if $H/make.sh $H/$N $R/w-$N > $R/log-$N.txt 2>&1; then echo "done $N $(date +%T)"; else echo "FAILED $N"; echo $N >> $R/failed.txt; fi
done
