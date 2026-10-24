"""Transcribe each tightened speech phrase separately with sherpa-onnx Whisper."""
import sys, json, wave
import numpy as np, sherpa_onnx
model_dir, wav, seg_json, out_json = sys.argv[1:5]
name = model_dir.rstrip('/').split('-')[-1]
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{model_dir}/{name}-encoder.int8.onnx", decoder=f"{model_dir}/{name}-decoder.int8.onnx",
    tokens=f"{model_dir}/{name}-tokens.txt", language="ar", task="transcribe", num_threads=4)
with wave.open(wav) as w:
    sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
seg = json.load(open(seg_json))
for s in seg:
    a, b = int(s['start'] * sr), int(s['end'] * sr)
    st = rec.create_stream(); st.accept_waveform(sr, x[a:b]); rec.decode_stream(st)
    s['asr'] = st.result.text.strip()
    print(s['i'], f"{s['start']:.2f}", s['asr'], flush=True)
json.dump(seg, open(out_json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
