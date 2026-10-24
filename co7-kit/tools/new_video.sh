#!/usr/bin/env bash
# Usage: tools/new_video.sh <slug>   -> creates videos/<slug>/build from the brand shell
set -euo pipefail
KIT="$(cd "$(dirname "$0")/.." && pwd)"; SLUG="$1"
OUT="$KIT/../videos/$SLUG"
mkdir -p "$OUT/build" "$OUT/assets"
cp -r "$KIT/shell/." "$OUT/build/"
cp "$KIT/examples/microwave/video.js" "$OUT/build/video.js"     # template to edit
echo "window.SCENE = { build(K) {}, render(t, K) {}, recap(svg, K) {} };" > "$OUT/build/scene.js"
echo "created $OUT"
