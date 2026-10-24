"""Write captions.srt from lines.json. Usage: python3 srt.py <lines.json> <out.srt> [tail_seconds] [display_fixes.json]"""
import sys, json
L = json.load(open(sys.argv[1], encoding='utf-8')); tail = float(sys.argv[3]) if len(sys.argv) > 3 else 1.6
fixes = json.load(open(sys.argv[4], encoding='utf-8')) if len(sys.argv) > 4 else {}
def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
out = []
for i, l in enumerate(L):
    end = L[i + 1]['start'] - 0.02 if i + 1 < len(L) else l['end'] + tail
    text = l['text']
    for a, b in fixes.items(): text = text.replace(a, b)
    out.append(f"{i + 1}\n{ts(l['start'])} --> {ts(end)}\n{text}\n")
open(sys.argv[2], 'w', encoding='utf-8').write("\n".join(out))
print(f"{len(out)} cues")
