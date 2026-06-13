#!/bin/bash

# $1 captures the first argument passed to the script
FILENAME=$1

# 1. Check if a filename was actually provided
if [ -z "$FILENAME" ]; then
  echo "Error: You must provide a video filename."
  echo "Usage: docker run ... video_transcoder <filename.mp4>"
  exit 1
fi

# 2. Navigate into the mounted videos folder
cd videos

# 3. Check if the file exists before trying to convert it
if [ ! -f "$FILENAME" ]; then
  echo "Error: File '$FILENAME' not found in the videos directory."
  exit 1
fi

echo "Starting transcoding for: $FILENAME"

# 4. Create the outputs folder (the -p flag ignores errors if it already exists)
mkdir -p outputs

# 5. Run FFmpeg using the variable
ffmpeg -i "$FILENAME" -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename outputs/segment%03d.ts -start_number 0 outputs/index.m3u8

echo "Transcoding complete! Check your local outputs folder."