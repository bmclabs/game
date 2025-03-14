#!/bin/bash

# Configuration
DISPLAY_NUM=:99
SCREEN_WIDTH=1280
SCREEN_HEIGHT=720
SCREEN_DEPTH=24
FRAMERATE=30
BITRATE=6000k
MAXRATE=6000k
BUFSIZE=12000k
STREAM_URL=${STREAM_URL:-"rtmp://live.restream.io/live/re_9333420_event43a04f6991e84d6eb1661fb590e6dab0"}
GAME_URL="http://localhost:8080"

# Kill any existing processes
pkill -f Xvfb
pkill -f ffmpeg
pkill -f "google-chrome.*headless"
pkill -f "chromium-browser.*headless"
pkill -f "python3.*http.server"

# Fix X11 permissions
if [ ! -d /tmp/.X11-unix ]; then
  sudo mkdir -p /tmp/.X11-unix
fi
sudo chmod 1777 /tmp/.X11-unix

# Start Xvfb with better parameters
Xvfb ${DISPLAY_NUM} -screen 0 ${SCREEN_WIDTH}x${SCREEN_HEIGHT}x${SCREEN_DEPTH} -ac &
XVFB_PID=$!
sleep 2
export DISPLAY=${DISPLAY_NUM}
echo "Started Xvfb on display ${DISPLAY_NUM}"

# Start HTTP server
cd "$(dirname "$0")"
python3 -m http.server 8080 &
HTTP_PID=$!
echo "Started HTTP server on port 8080"
sleep 2

# Check for browser
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

# Create screenshots directory
SCREENSHOT_DIR="screenshots"
mkdir -p $SCREENSHOT_DIR

# Start browser with optimized parameters
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

# Wait longer for game to load completely
echo "Waiting for game to load (45 seconds)..."
sleep 45

# Take multiple screenshots to verify the game is visible
echo "Taking screenshots to verify game is visible..."
for i in {1..3}; do
  SCREENSHOT_FILE="$SCREENSHOT_DIR/game_$(date +%Y%m%d_%H%M%S)_$i.png"
  import -display $DISPLAY -window root "$SCREENSHOT_FILE"
  echo "Screenshot $i saved to $SCREENSHOT_FILE"
  sleep 5
done

# Start FFmpeg with optimized parameters
echo "Starting FFmpeg streaming to ${STREAM_URL%%/*}/*****"
ffmpeg -f x11grab -framerate $FRAMERATE -video_size ${SCREEN_WIDTH}x${SCREEN_HEIGHT} \
  -draw_mouse 0 -i $DISPLAY -c:v libx264 -preset ultrafast -tune zerolatency \
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
