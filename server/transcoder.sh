#!/bin/bash

FILENAME=$1

if [ -z "$FILENAME" ]; then
  echo "Error: You must provide a video filename."
  exit 1
fi

cd videos

if [ ! -f "$FILENAME" ]; then
  echo "Error: File '$FILENAME' not found in the videos directory."
  exit 1
fi

echo "Starting Adaptive Bitrate Transcoding for: $FILENAME"

# Create the master outputs folder AND the resolution sub-folders
mkdir -p outputs/1080p outputs/720p outputs/360p

# Run FFmpeg to split, scale, and generate the master playlist
ffmpeg -i "$FILENAME" \
  -filter_complex \
  "[0:v]split=3[v1][v2][v3]; \
   [v1]scale=-2:1080[v1out]; \
   [v2]scale=-2:720[v2out]; \
   [v3]scale=-2:360[v3out]" \
  -map "[v1out]" -c:v:0 libx264 -b:v:0 4000k -maxrate:v:0 4300k -bufsize:v:0 6000k \
  -map "[v2out]" -c:v:1 libx264 -b:v:1 2000k -maxrate:v:1 2100k -bufsize:v:1 3000k \
  -map "[v3out]" -c:v:2 libx264 -b:v:2 800k  -maxrate:v:2 850k  -bufsize:v:2 1200k \
  -map a:0 -c:a:0 aac -b:a:0 128k \
  -map a:0 -c:a:1 aac -b:a:1 128k \
  -map a:0 -c:a:2 aac -b:a:2 96k \
  -f hls \
  -hls_time 10 \
  -hls_playlist_type vod \
  -hls_segment_filename "outputs/%v/segment%03d.ts" \
  -master_pl_name "master.m3u8" \
  -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:360p" \
  "outputs/%v/index.m3u8"

echo "Transcoding complete! Master playlist and resolution segments created."