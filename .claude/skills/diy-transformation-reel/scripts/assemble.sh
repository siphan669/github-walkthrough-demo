#!/usr/bin/env bash
# Assemble AI-generated clips into a looping 9:16 transformation reel.
# Usage: assemble.sh <clips_dir> <out.mp4> [music_file] [cuts.txt]
#   clips_dir : 01.mp4, 02.mp4, ... in story order
#   cuts.txt  : optional, one line per clip: "<start_s> <duration_s>"
#               default = middle 1.0 s of each clip; last clip holds 2.5 s
set -euo pipefail

CLIPS=${1:?clips dir}; OUT=${2:?output file}; MUSIC=${3:-}; CUTS=${4:-}
DEFAULT_DUR=1.0; FINAL_DUR=2.5; LOOP_DUR=1.2
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

mapfile -t FILES < <(find "$CLIPS" -maxdepth 1 -type f \( -name '*.mp4' -o -name '*.mov' \) | sort)
[ ${#FILES[@]} -gt 0 ] || { echo "no clips in $CLIPS" >&2; exit 1; }
[ -z "$CUTS" ] || mapfile -t CUTLINES < "$CUTS"

VF="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p"
seg() { # in start dur out
  ffmpeg -v error -y -ss "$2" -i "$1" -t "$3" -vf "$VF" -an -c:v libx264 -preset fast -crf 18 "$4"
}
dur_of() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

: > "$TMP/list.txt"; n=${#FILES[@]}
for i in "${!FILES[@]}"; do
  f=${FILES[$i]}
  if [ -n "$CUTS" ] && [ -n "${CUTLINES[$i]:-}" ]; then
    read -r s d <<< "${CUTLINES[$i]}"
  else
    d=$DEFAULT_DUR; [ "$i" -eq $((n-1)) ] && d=$FINAL_DUR
    s=$(awk -v L="$(dur_of "$f")" -v d="$d" 'BEGIN{x=(L-d)/2; if(x<0)x=0; print x}')
  fi
  seg "$f" "$s" "$d" "$TMP/s$i.mp4"; echo "file '$TMP/s$i.mp4'" >> "$TMP/list.txt"
done
# Loop tail: the opening of clip 1 so the end flows back into the start.
seg "${FILES[0]}" 0 "$LOOP_DUR" "$TMP/loop.mp4"; echo "file '$TMP/loop.mp4'" >> "$TMP/list.txt"

ffmpeg -v error -y -f concat -safe 0 -i "$TMP/list.txt" -c copy "$TMP/video.mp4"

if [ -n "$MUSIC" ]; then
  ffmpeg -v error -y -i "$TMP/video.mp4" -stream_loop -1 -i "$MUSIC" \
    -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=$(awk -v D="$(dur_of "$TMP/video.mp4")" 'BEGIN{print D-0.6}'):d=0.6[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
else
  ffmpeg -v error -y -i "$TMP/video.mp4" -c copy -movflags +faststart "$OUT"
fi
echo "Wrote $OUT ($(dur_of "$OUT") s, ${n} clips + loop tail)"
