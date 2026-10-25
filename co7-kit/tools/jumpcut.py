"""Prepare a user video for footage mode.

Usage: python3 jumpcut.py <in_video> <out_dir> [cut|keep] [gap]
  cut  (default): remove every pause (jump cuts), keeping `gap` seconds (default 0.12) after each phrase
  keep          : keep the video as is (only conform to 30 fps)
Writes <out_dir>/footage.mp4, <out_dir>/voice.wav and <out_dir>/segments.json (phrase times in the OUTPUT timeline),
so the rest of the pipeline (asr_segments.py, make_lines.py) works the same as for a voice-over.
"""
import sys, os, json, subprocess, wave
import numpy as np

src, out = sys.argv[1], sys.argv[2]
mode = sys.argv[3] if len(sys.argv) > 3 else 'cut'
GAP = float(sys.argv[4]) if len(sys.argv) > 4 else 0.12
os.makedirs(out, exist_ok=True)
raw = os.path.join(out, '_raw.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-vn', '-ac', '1', '-ar', '24000', raw], check=True)
with wave.open(raw) as w:
    sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

hop = int(sr * 0.01)
db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x), hop)]))
loud = db > -40
segs, st = [], None
for i, l in enumerate(loud):
    if l and st is None: st = i
    if not l and st is not None: segs.append([st, i]); st = None
if st is not None: segs.append([st, len(loud)])
merged = [segs[0]]
for a, b in segs[1:]:
    if (a - merged[-1][1]) * 0.01 < 0.15: merged[-1][1] = b
    else: merged.append([a, b])
merged = [m for m in merged if (m[1] - m[0]) * 0.01 >= 0.1]
pad = 0.03
spans = [(max(0, a * 0.01 - pad), min(len(x) / sr, b * 0.01 + pad)) for a, b in merged]

log = []
if mode == 'keep':
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-r', '30', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '192k', os.path.join(out, 'footage.mp4')], check=True)
    log = [{"i": k, "src_start": a, "src_end": b, "start": round(a, 3), "end": round(b, 3)} for k, (a, b) in enumerate(spans)]
else:
    parts, t = [], 0.0
    for k, (a, b) in enumerate(spans):
        b2 = min(len(x) / sr, b + GAP) if k < len(spans) - 1 else b
        parts.append((a, b2)); log.append({"i": k, "src_start": round(a, 3), "src_end": round(b, 3), "start": round(t, 3), "end": round(t + b - a, 3)})
        t += b2 - a
    fc = ''.join(f'[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,fps=30[v{k}];[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st={max(0, b - a - 0.008):.3f}:d=0.008[a{k}];' for k, (a, b) in enumerate(parts))
    fc += ''.join(f'[v{k}][a{k}]' for k in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=1[v][a]'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-filter_complex', fc, '-map', '[v]', '-map', '[a]',
                    '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', os.path.join(out, 'footage.mp4')], check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(out, 'footage.mp4'), '-vn', '-ac', '1', '-ar', '24000', os.path.join(out, 'voice.wav')], check=True)
os.remove(raw)
json.dump(log, open(os.path.join(out, 'segments.json'), 'w'), indent=1)
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(out, 'footage.mp4')], capture_output=True, text=True).stdout)
print(f"{len(x) / sr:.2f}s -> {dur:.2f}s ({mode}), {len(log)} phrases")
