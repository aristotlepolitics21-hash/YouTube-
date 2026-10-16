#!/bin/bash
# usage: queue.sh QUEUEDIR  -- render worker: each job file holds "SCRIPT.json WORKDIR OUTNAME EPDIR"; runs them oldest first, forever
H=$(cd "$(dirname "$0")" && pwd); Q=$1; mkdir -p $Q/done
while true; do
  J=$(ls -tr $Q/*.job 2>/dev/null | head -1)
  if [ -z "$J" ]; then sleep 15; continue; fi
  read SC W OUT E < $J; mv $J $J.running
  if $H/render.sh $SC $W $OUT > $W/render.log 2>&1 && $H/finalize.sh $E $W $OUT >> $W/render.log 2>&1; then mv $J.running $Q/done/$(basename $J); else mv $J.running $Q/done/$(basename $J).failed; fi
done
