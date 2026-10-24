"""Align script lines to detected speech phrases (DP on duration vs. text length)."""
import sys, json, math, re
lines = [l.strip() for l in open(sys.argv[1], encoding='utf-8') if l.strip()]
seg = json.load(open(sys.argv[2]))
L, S = len(lines), len(seg)
w = [len(re.sub(r'[\s…؟!.ًٌٍَُِّْ]', '', l)) for l in lines]
speech = sum(s['end'] - s['start'] for s in seg)
rate = speech / sum(w)
INF = 1e18
dp = [[INF] * (S + 1) for _ in range(L + 1)]; bk = [[0] * (S + 1) for _ in range(L + 1)]
dp[0][0] = 0
for i in range(1, L + 1):
    for j in range(i, S + 1):
        for k in range(i - 1, j):
            if dp[i - 1][k] == INF: continue
            d = seg[j - 1]['end'] - seg[k]['start'] - 0.12 * (j - 1 - k)
            c = math.log(max(d, 0.05) / (w[i - 1] * rate)) ** 2
            if dp[i - 1][k] + c < dp[i][j]:
                dp[i][j] = dp[i - 1][k] + c; bk[i][j] = k
out, j = [], S
for i in range(L, 0, -1):
    k = bk[i][j]; out.append({"line": i - 1, "text": lines[i - 1], "start": seg[k]['start'], "end": seg[j - 1]['end'], "segs": list(range(k, j))}); j = k
out.reverse()
json.dump(out, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for o in out:
    d = o['end'] - o['start']; exp = w[o['line']] * rate
    print(f"{o['line']:2d} {o['start']:6.2f}-{o['end']:6.2f} dur {d:4.2f} exp {exp:4.2f} segs {o['segs']}  {o['text']}")
