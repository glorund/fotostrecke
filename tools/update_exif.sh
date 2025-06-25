#!/usr/bin/env bash
# Usage: ./update_exif.sh "Title Here" "Caption Here" image.jpg

TITLE="$1"
CAPTION="$2"
IMAGE="$3"

if [[ -z "$TITLE" || -z "$CAPTION" || -z "$IMAGE" ]]; then
  echo "Usage: $0 \"Title\" \"Caption\" image.jpg"
  exit 1
fi

exiftool -overwrite_original \
  -IPTC:ObjectName="$TITLE" \
  -IPTC:Caption-Abstract="$CAPTION" \
  "$IMAGE"