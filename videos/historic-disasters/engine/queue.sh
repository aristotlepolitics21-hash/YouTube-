#!/bin/bash
# Processes queue.txt lines: NN|slug|say-json . Marks done in done.txt. Exits when queue has STOP and nothing pending.
D=/tmp/claude-0/-home-user-YouTube-/aece8624-b638-5e16-a980-11f89b661b06/scratchpad/doc; R=/home/user/YouTube-/videos/historic-disasters
touch $D/done.txt
while true; do
  while pgrep -f "render_ep.sh|voice.py" >/dev/null; do sleep 15; done
  next=""; while IFS= read -r line; do [ "$line" = "STOP" ] && continue; n=${line%%|*}; grep -qx "$n" $D/done.txt || { next=$line; break; }; done < $D/queue.txt
  if [ -z "$next" ]; then grep -qx STOP $D/queue.txt && exit 0; sleep 20; continue; fi
  IFS='|' read -r n slug say <<< "$next"; S=$R/$n-$slug/script.json; E=$D/ep$n; mkdir -p $E
  echo "start $n $(date +%T)"
  python3 -I $D/voice.py $S $E en_US-ryan-high "$say" > $E/run.log 2>&1 && $D/render_ep.sh $E $S historic-disasters-$n-$slug >> $E/run.log 2>&1 && echo "done $n $(date +%T)" || echo "FAILED $n"
  echo $n >> $D/done.txt
done
