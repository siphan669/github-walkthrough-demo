#!/bin/bash
# Prepare the video toolchain for the What-If skills in cloud sessions:
# headless Chrome for HyperFrames rendering + Kokoro local TTS fallback.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

npx -y hyperframes browser ensure >/dev/null
pip install -q kokoro-onnx soundfile >/dev/null 2>&1
