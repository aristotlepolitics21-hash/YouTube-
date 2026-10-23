#!/bin/bash
# Renders every approved Short (listed in $WORK/approved_shorts.txt) whose video is missing or older than its
# plan or script, in order; then hands over to the long-form episode queue. Re-scans after each Short.
H=$(cd "$(dirname "$0")" && pwd); R=$H/../shorts; : "${WORK:?set WORK}"
while true; do
  next=""; for pl in $R/plans/[0-9][0-9]-*.json; do n=$(basename $pl .json); v=$R/videos/short-$n.mp4
    grep -qx "$n" $WORK/approved_shorts.txt 2>/dev/null || continue; grep -qx "$n" $WORK/failed_shorts.txt 2>/dev/null && continue
    [ -f $v ] && [ $v -nt $pl ] && [ $v -nt $R/$n.md ] && continue; next=$n; break; done
  if [ -z "$next" ]; then [ -f $WORK/shorts.stop ] && break; ls $R/plans/*.json | wc -l | grep -q "^49$" && [ "$(wc -l < $WORK/approved_shorts.txt)" -ge 49 ] && break; sleep 30; continue; fi
  echo "start short $next $(date +%T)"
  if SEGS=4 $H/render_short.sh $R/$next.md $R/plans/$next.json $WORK/shorts/w$next $R/videos/short-$next.mp4 > $WORK/shorts/$next.log 2>&1; then echo "done short $next $(date +%T)"; rm -f $WORK/shorts/w$next/seg*.mp4 $WORK/shorts/w$next/video.mp4; else echo "FAILED short $next"; echo $next >> $WORK/failed_shorts.txt; fi
done
echo "shorts finished $(date +%T); starting episode queue"
cd $H/.. && SEGS=4 exec engine/queue.sh
