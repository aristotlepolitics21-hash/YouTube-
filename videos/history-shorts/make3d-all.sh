#!/bin/bash
# usage: make3d-all.sh WORKROOT MAXMIN  -> renders episodes listed in WORKROOT/queue.txt that have no video yet, one by one;
# waits for more while the queue is empty, and stops after MAXMIN minutes (so a batch fits its time limit) or when WORKROOT/stop exists.
H=$(cd "$(dirname "$0")" && pwd); R=$1; END=$(( $(date +%s) + ${2:-100} * 60 )); touch $R/queue.txt
while [ ! -f $R/stop ] && [ $(date +%s) -lt $END ]; do
  N=""; while read -r e; do [ -n "$e" ] || continue; ls $H/$e/*.mp4 >/dev/null 2>&1 || grep -qx "$e" $R/failed.txt 2>/dev/null || { N=$e; break; }; done < $R/queue.txt
  if [ -z "$N" ]; then sleep 20; continue; fi
  if $H/make3d.sh $H/$N $R/w-$N > $R/log-$N.txt 2>&1; then echo "done $N $(date +%T)"; else echo "FAILED $N"; echo $N >> $R/failed.txt; fi
done
