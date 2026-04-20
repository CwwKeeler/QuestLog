#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_ICON="${PROJECT_DIR}/assets/brand/questlog_q_icon_transparent.png"
OUTPUT_ICONSET="${PROJECT_DIR}/assets/brand/questlog_q_icon.iconset"
OUTPUT_ICNS="${PROJECT_DIR}/assets/brand/questlog_q_icon.icns"

if ! command -v sips >/dev/null 2>&1; then
  echo "sips is required to generate the macOS icon." >&2
  exit 1
fi

if ! command -v iconutil >/dev/null 2>&1; then
  echo "iconutil is required to generate the macOS icon." >&2
  exit 1
fi

if [ ! -f "${SOURCE_ICON}" ]; then
  echo "Missing source icon: ${SOURCE_ICON}" >&2
  exit 1
fi

rm -rf "${OUTPUT_ICONSET}"
mkdir -p "${OUTPUT_ICONSET}"

make_icon() {
  local size="$1"
  local filename="$2"
  sips -z "${size}" "${size}" "${SOURCE_ICON}" --out "${OUTPUT_ICONSET}/${filename}" >/dev/null
}

make_icon 16 icon_16x16.png
make_icon 32 icon_16x16@2x.png
make_icon 32 icon_32x32.png
make_icon 64 icon_32x32@2x.png
make_icon 128 icon_128x128.png
make_icon 256 icon_128x128@2x.png
make_icon 256 icon_256x256.png
make_icon 512 icon_256x256@2x.png
make_icon 512 icon_512x512.png
make_icon 1024 icon_512x512@2x.png

iconutil -c icns "${OUTPUT_ICONSET}" -o "${OUTPUT_ICNS}"
rm -rf "${OUTPUT_ICONSET}"

echo "Generated ${OUTPUT_ICNS}"
