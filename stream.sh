#!/bin/bash

# Configuration
DISPLAY_NUM=:99
SCREEN_WIDTH=${WIDTH:-800}
SCREEN_HEIGHT=${HEIGHT:-600}
SCREEN_DEPTH=24
FRAMERATE=${FRAMERATE:-30}
BITRATE=${BITRATE:-4500k}
MAXRATE=${MAXRATE:-4500k}
BUFSIZE=${BUFSIZE:-9000k}
STREAM_URL=${STREAM_URL:-"rtmp://live.twitch.tv/app/live_1277047725_EBFv9IZxad5LdYNDHgWqnVDSflI8J9"}
GAME_URL="http://localhost:8080"  # Adjust to your local server

# Kill any existing Xvfb or FFmpeg processes
pkill -f Xvfb
pkill -f ffmpeg
pkill -f "google-chrome.*headless"
pkill -f "chromium-browser.*headless"

# Check and fix X11 socket permissions if needed
if [ ! -d /tmp/.X11-unix ]; then
  mkdir -p /tmp/.X11-unix
fi

# Try to fix permissions without sudo if possible
if [ -w /tmp/.X11-unix ]; then
  chmod 1777 /tmp/.X11-unix
else
  echo "Warning: Cannot set permissions on /tmp/.X11-unix without sudo"
  echo "You may need to run 'sudo chmod 1777 /tmp/.X11-unix' manually"
fi

# Try a different display number if the default one fails
for DISPLAY_TRY in 99 100 101 102; do
  DISPLAY_NUM=:${DISPLAY_TRY}
  echo "Trying Xvfb on display ${DISPLAY_NUM}..."
  
  # Start Xvfb with better color depth
  Xvfb ${DISPLAY_NUM} -screen 0 ${SCREEN_WIDTH}x${SCREEN_HEIGHT}x${SCREEN_DEPTH} -ac &
  XVFB_PID=$!
  
  # Check if Xvfb started successfully
  sleep 1
  if kill -0 $XVFB_PID 2>/dev/null; then
    echo "Started Xvfb on display ${DISPLAY_NUM}"
    export DISPLAY=${DISPLAY_NUM}
    break
  else
    echo "Failed to start Xvfb on display ${DISPLAY_NUM}, trying another..."
  fi
done

if [ -z "$DISPLAY" ]; then
  echo "Failed to start Xvfb on any display. Exiting."
  exit 1
fi

# Start a simple HTTP server to serve the game
cd "$(dirname "$0")"
python3 -m http.server 8080 &
HTTP_PID=$!

echo "Started HTTP server on port 8080"

# Wait for HTTP server to start
sleep 2

# Check if Chrome or Chromium is available
if command -v google-chrome &> /dev/null; then
  BROWSER="google-chrome"
elif command -v chromium-browser &> /dev/null; then
  BROWSER="chromium-browser"
else
  echo "Neither Google Chrome nor Chromium is installed. Exiting."
  kill $XVFB_PID
  kill $HTTP_PID
  exit 1
fi

# Create a debug screenshot directory
SCREENSHOT_DIR="screenshots"
mkdir -p $SCREENSHOT_DIR

# Start browser in headless mode to render the game with better parameters
$BROWSER --no-sandbox --use-gl=swiftshader --ignore-gpu-blocklist --headless \
  --window-size=${SCREEN_WIDTH},${SCREEN_HEIGHT} \
  --disable-notifications --disable-infobars --disable-dev-shm-usage \
  --disable-features=TranslateUI --disable-extensions --disable-popup-blocking \
  --disable-background-networking --disable-sync --disable-default-apps \
  --no-first-run --hide-scrollbars \
  --enable-unsafe-swiftshader \
  --autoplay-policy=no-user-gesture-required \
  --allow-file-access-from-files \
  --remote-debugging-port=9222 \
  $GAME_URL &
BROWSER_PID=$!

echo "Started ${BROWSER} in headless mode"

# Give browser more time to load the game completely
echo "Waiting for game to load (30 seconds)..."
sleep 30

# Take a screenshot to verify the game is visible
echo "Taking a screenshot to verify game is visible..."
SCREENSHOT_FILE="$SCREENSHOT_DIR/game_$(date +%Y%m%d_%H%M%S).png"
import -display $DISPLAY -window root "$SCREENSHOT_FILE"
echo "Screenshot saved to $SCREENSHOT_FILE"

# Start FFmpeg to capture the screen and stream with better parameters
echo "Starting FFmpeg streaming to ${STREAM_URL%%/*}/*****"
ffmpeg -f x11grab -framerate $FRAMERATE -video_size ${SCREEN_WIDTH}x${SCREEN_HEIGHT} \
  -draw_mouse 0 -i $DISPLAY_NUM -c:v libx264 -preset ultrafast -tune zerolatency \
  -b:v $BITRATE -maxrate $MAXRATE -bufsize $BUFSIZE -g $(($FRAMERATE * 2)) \
  -pix_fmt yuv420p -profile:v main -level 4.0 \
  -keyint_min $FRAMERATE -f flv $STREAM_URL

# Cleanup
kill $BROWSER_PID
kill $HTTP_PID
kill $XVFB_PID
pkill -f Xvfb
pkill -f ffmpeg

echo "Streaming ended, cleaned up processes" 