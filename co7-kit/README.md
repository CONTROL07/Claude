# CO7 Kit: brand video engine

Every CO7 video uses the same shell, engine and pipeline, so they all look the same. Only the content changes from one video to the next: the voice-over, the script lines, the chapters and the scene drawing.

```
co7-kit/
  shell/              BRAND-LOCKED: never edit per video
    index.html        layout 1080×1920: frame, logo, chapter timeline, window, captions, recap + CTA cards
    engine.js         camera, iris sting, micro panel, dim, badges, captions, timeline, cards, frame clock
    lib/gsap.min.js   easing functions (GSAP 3)
    fonts/            IBM Plex Sans Arabic (Arabic + Latin subsets, 400–700)
    logo_light.png    CO7 logo for the light theme (CO ink, 7 red)
  tools/
    new_video.sh      creates videos/<slug>/build from the shell
    tighten.py        shortens every pause in the voice-over to 0.12 s and logs the speech phrases
    asr_segments.py   transcribes each phrase (sherpa-onnx Whisper) to map phrases to script lines
    align.py          fallback: maps script lines to phrases by duration when transcription fails
    make_lines.py     writes lines.json + build/lines.js from the phrase→line grouping
    render.js         stills / cover / final MP4 (Playwright + ffmpeg, −14 LUFS)
    srt.py            captions.srt from lines.json
    logo_light.py     rebuilds logo_light.png from the logo on a black background
  examples/microwave/ reference video: video.js, lines.js, scene.js, voiceover_tight.wav
```

## Per-video files (in `videos/<slug>/build/`)
| File | What it holds |
|---|---|
| `video.js` | `window.VIDEO`: audio length, sting / recap / CTA line indexes, chapters, caption keywords, recap card, CTA text, cover |
| `lines.js` | `window.LINES`: each script line with its start and end time in the tightened voice-over |
| `scene.js` | `window.SCENE = { build(K), render(t, K), recap(svg, K) }`, the illustration and its keyframe tracks |

## Scene contract
- `build(K)` draws the world into `K.layers.camera`, and micro scenes into `K.micro()` groups. It defines tracks with `K.track(name, initial, [[start, duration, target, ease]])`.
- Tracks the engine reads: `cam` = `[focusX, focusY, scale]` (default `[480,560,1.18]`), `micro` (blue panel opacity), `dim`.
- `render(t, K)` sets attributes from `K.V(name, t)` and from `t` itself (loops). Never use `Date.now()` or random numbers that aren't seeded: every frame must be reproducible.
- `recap(svg, K)` draws the small numbered diagram on the recap card. Its numbers 1–4 match `VIDEO.recap.legend`.
- The engine handles these on its own: the iris sting on `VIDEO.stingLine`, the recap card on `recapLine`, the CTA card on `ctaLine`, the captions with keyword colors, and the chapter timeline.

## Commands
```bash
KIT=co7-kit
bash $KIT/tools/new_video.sh <slug>
python3 -I $KIT/tools/tighten.py voice.wav videos/<slug>/assets/voiceover_tight.wav videos/<slug>/assets/segments.json 0.12
python3 -I $KIT/tools/asr_segments.py <whisper_dir> videos/<slug>/assets/voiceover_tight.wav videos/<slug>/assets/segments.json videos/<slug>/assets/seg_asr.json
python3 -I $KIT/tools/align.py videos/<slug>/voiceover.txt videos/<slug>/assets/segments.json videos/<slug>/assets/lines_dp.json
python3 -I $KIT/tools/make_lines.py videos/<slug>/voiceover.txt videos/<slug>/assets/segments.json groups.json videos/<slug>/assets/lines.json videos/<slug>/build/lines.js
node $KIT/tools/render.js videos/<slug>/build stills /tmp/stills 1.5 4 10 ...
node $KIT/tools/render.js videos/<slug>/build cover videos/<slug>/cover_9x16.png
node $KIT/tools/render.js videos/<slug>/build video videos/<slug>/video_9x16.mp4 videos/<slug>/assets/voiceover_tight.wav 30
python3 -I $KIT/tools/srt.py videos/<slug>/assets/lines.json videos/<slug>/captions.srt 1.6 videos/<slug>/assets/display_fixes.json   # same fixes as VIDEO.display
```
Whisper model (multilingual, used for Arabic): `https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-base.tar.bz2` + `pip install sherpa-onnx`.
