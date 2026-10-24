"""Shorten every pause in a voice-over to a fixed gap and log the speech segments."""
import sys, json, wave
import numpy as np

src, dst, seg_json = sys.argv[1:4]
GAP = float(sys.argv[4]) if len(sys.argv) > 4 else 0.12   # seconds kept between phrases
THRESH_DB, MIN_SIL, HOP = -40.0, 0.15, 0.01

with wave.open(src) as w:
    sr, n = w.getframerate(), w.getnframes()
    x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768

hop = int(sr * HOP)
rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x), hop)])
loud = 20 * np.log10(rms) > THRESH_DB

# speech segments = runs of loud frames, merged across gaps shorter than MIN_SIL
segs, start = [], None
for i, l in enumerate(loud):
    if l and start is None:
        start = i
    if not l and start is not None:
        segs.append([start, i]); start = None
if start is not None:
    segs.append([start, len(loud)])
merged = [segs[0]]
for s, e in segs[1:]:
    if (s - merged[-1][1]) * HOP < MIN_SIL:
        merged[-1][1] = e
    else:
        merged.append([s, e])

merged = [m for m in merged if (m[1] - m[0]) * HOP >= 0.1]   # drop clicks/blips shorter than 0.1 s
pad = int(sr * 0.03)            # keep 30 ms around each phrase so consonants aren't clipped
fade = int(sr * 0.008)
gap = np.zeros(int(sr * GAP), dtype=np.float32)
out, log, t = [], [], 0.0
for k, (s, e) in enumerate(merged):
    a, b = max(0, s * hop - pad), min(len(x), e * hop + pad)
    chunk = x[a:b].copy()
    chunk[:fade] *= np.linspace(0, 1, fade); chunk[-fade:] *= np.linspace(1, 0, fade)
    log.append({"i": k, "src_start": round(a / sr, 3), "src_end": round(b / sr, 3),
                "start": round(t, 3), "end": round(t + len(chunk) / sr, 3)})
    out.append(chunk); t += len(chunk) / sr
    if k < len(merged) - 1:
        out.append(gap); t += GAP

y = np.concatenate(out)
with wave.open(dst, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump(log, open(seg_json, "w"), indent=1)
print(f"{len(x)/sr:.2f}s -> {len(y)/sr:.2f}s, {len(merged)} phrases")
