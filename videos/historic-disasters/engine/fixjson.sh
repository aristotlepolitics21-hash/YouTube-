#!/bin/bash
sed -i -E 's/([\[ ,:])\.([0-9])/\10.\2/g' "$1" && python3 -I -c "
import json,sys; d=json.load(open(sys.argv[1])); print(sum(len(l[2].split()) for s in d['sections'] for l in s['lines']),'words', sum(len(s['lines']) for s in d['sections']),'lines')" "$1"
