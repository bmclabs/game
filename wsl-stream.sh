#!/bin/bash

# Battle Memecoin Club - WSL Streaming Script
# This script is optimized for streaming from WSL

echo "=== Battle Memecoin Club - WSL Streaming ==="
echo "This script is optimized for streaming from WSL environment."
echo

# Configuration
FRAMERATE=${FRAMERATE:-30}
BITRATE=${BITRATE:-4500k}
MAXRATE=${MAXRATE:-4500k}
BUFSIZE=${BUFSIZE:-9000k}
STREAM_URL=${STREAM_URL:-"rtmp://live-lhr.twitch.tv/app/live_1277047725_EBFv9IZxad5LdYNDHgWqnVDSflI8J9"}
GAME_URL="http://localhost:8080"

# Kill any existing processes
echo "Cleaning up any existing processes..."
pkill -f ffmpeg
pkill -f "google-chrome.*"
pkill -f "chromium-browser.*"
pkill -f "python3.*http.server"
echo "✅ Cleaned up processes"

# Create screenshots directory
SCREENSHOT_DIR="screenshots"
mkdir -p $SCREENSHOT_DIR

# Start HTTP server
echo "Starting HTTP server..."
cd "$(dirname "$0")"
python3 -m http.server 8080 &
HTTP_PID=$!
sleep 2
echo "✅ Started HTTP server on port 8080"

# Check for browser
if command -v google-chrome &> /dev/null; then
  BROWSER="google-chrome"
elif command -v chromium-browser &> /dev/null; then
  BROWSER="chromium-browser"
else
  echo "❌ Neither Google Chrome nor Chromium is installed"
  kill $HTTP_PID
  exit 1
fi

# Start browser in windowed mode (not headless) for WSL
echo "Starting $BROWSER in windowed mode (WSL)..."
$BROWSER --new-window --window-size=800,600 \
  --app="$GAME_URL" \
  --disable-notifications --disable-infobars \
  --disable-features=TranslateUI --disable-extensions \
  --autoplay-policy=no-user-gesture-required \
  --allow-file-access-from-files &
BROWSER_PID=$!
echo "✅ Started $BROWSER"

# Wait for game to load
echo "Waiting for game to load (20 seconds)..."
sleep 20

# Take a screenshot to verify the game is visible
echo "Taking a screenshot to verify game is visible..."
SCREENSHOT_FILE="$SCREENSHOT_DIR/game_$(date +%Y%m%d_%H%M%S).png"
if command -v gnome-screenshot &> /dev/null; then
  gnome-screenshot -w -f "$SCREENSHOT_FILE"
elif command -v scrot &> /dev/null; then
  scrot "$SCREENSHOT_FILE"
else
  echo "⚠️ No screenshot tool available. Installing scrot..."
  sudo apt-get update && sudo apt-get install -y scrot
  scrot "$SCREENSHOT_FILE"
fi
echo "✅ Screenshot saved to $SCREENSHOT_FILE"

# Get window ID
echo "Getting browser window ID..."
WINDOW_ID=$(xdotool search --name "Battle Memecoin Club" | head -1)
if [ -z "$WINDOW_ID" ]; then
  echo "⚠️ Could not find browser window. Using active window."
  WINDOW_ID=$(xdotool getactivewindow)
fi
echo "✅ Window ID: $WINDOW_ID"

# Start FFmpeg to capture the window and stream
echo "Starting FFmpeg streaming to ${STREAM_URL%%/*}/*****"
ffmpeg -f x11grab -framerate $FRAMERATE -video_size 800x600 \
  -draw_mouse 0 -i $DISPLAY+0,0 -c:v libx264 -preset ultrafast -tune zerolatency \
  -b:v $BITRATE -maxrate $MAXRATE -bufsize $BUFSIZE -g $(($FRAMERATE * 2)) \
  -pix_fmt yuv420p -profile:v main -level 4.0 \
  -keyint_min $FRAMERATE -f flv $STREAM_URL

# Cleanup
kill $BROWSER_PID
kill $HTTP_PID

echo "Streaming ended, cleaned up processes" 