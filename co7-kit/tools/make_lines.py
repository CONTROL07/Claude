"""Build lines.json + build/lines.js from the voice-over text and a phrase->line grouping.

Usage: python3 make_lines.py <voiceover.txt> <segments.json> <groups.json> <out_lines.json> <out_lines.js>
groups.json = [[0], [1], [3, 4], ...]  (segment indexes for each script line, in order; skip noise blips)
"""
import sys, json
txt, seg_p, grp_p, out_json, out_js = sys.argv[1:6]
lines = [l.strip() for l in open(txt, encoding='utf-8') if l.strip()]
seg = json.load(open(seg_p)); groups = json.load(open(grp_p))
assert len(groups) == len(lines), f"{len(groups)} groups for {len(lines)} lines"
out = [{"line": i, "text": lines[i], "start": seg[g[0]]['start'], "end": seg[g[-1]]['end'],
        "segs": [[seg[k]['start'], seg[k]['end']] for k in g]} for i, g in enumerate(groups)]
json.dump(out, open(out_json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(out_js, 'w', encoding='utf-8').write('window.LINES=' + json.dumps(
    [{'t': l['text'], 's': l['start'], 'e': l['end'], 'segs': l['segs']} for l in out], ensure_ascii=False) + ';')
print(f"{len(out)} lines, voice ends at {out[-1]['end']:.2f}s")
