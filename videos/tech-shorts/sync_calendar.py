"""Copy the status column from calendar.md into calendar.csv (md is the source of truth)."""
import csv, re
st = {}
for line in open('calendar.md'):
    m = re.match(r'\|\s*(\d+)\s*\|.*\|\s*([^|]+?)\s*\|\s*$', line)
    if m: st[m[1]] = m[2]
rows = list(csv.reader(open('calendar.csv', newline='')))
for r in rows[1:]:
    r[-1] = st.get(r[0], r[-1])
csv.writer(open('calendar.csv', 'w', newline='')).writerows(rows)
