#!/bin/bash

# Battle Memecoin Club - Stream Debugging Script
# This script helps diagnose issues with streaming

echo "=== Battle Memecoin Club - Stream Debugging ==="
echo "This script will help diagnose streaming issues."
echo

# Configuration
DISPLAY_NUM=:99
SCREEN_WIDTH=1280
SCREEN_HEIGHT=720
SCREEN_DEPTH=24
GAME_URL="http://localhost:8080"

# Create debug directory
DEBUG_DIR="debug-$(date +%Y%m%d_%H%M%S)"
mkdir -p $DEBUG_DIR
echo "Debug files will be saved to: $DEBUG_DIR"

# Kill any existing processes
echo "Cleaning up any existing processes..."
pkill -f Xvfb
pkill -f ffmpeg
pkill -f "google-chrome.*headless"
pkill -f "chromium-browser.*headless"
echo "✅ Cleaned up processes"

# Fix X11 permissions
echo "Fixing X11 permissions..."
if [ ! -d /tmp/.X11-unix ]; then
  sudo mkdir -p /tmp/.X11-unix
fi
sudo chmod 1777 /tmp/.X11-unix
echo "✅ Fixed X11 permissions"

# Start Xvfb
echo "Starting Xvfb..."
Xvfb $DISPLAY_NUM -screen 0 ${SCREEN_WIDTH}x${SCREEN_HEIGHT}x${SCREEN_DEPTH} -ac &
XVFB_PID=$!
sleep 1

if ! kill -0 $XVFB_PID 2>/dev/null; then
  echo "❌ Failed to start Xvfb"
  exit 1
fi

export DISPLAY=$DISPLAY_NUM
echo "✅ Started Xvfb on display $DISPLAY"

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
  kill $XVFB_PID
  kill $HTTP_PID
  exit 1
fi

# Start browser with debug options
echo "Starting $BROWSER..."
$BROWSER --no-sandbox --disable-gpu --headless \
  --window-size=${SCREEN_WIDTH},${SCREEN_HEIGHT} \
  --disable-notifications --disable-infobars \
  --disable-features=TranslateUI --disable-extensions \
  --no-first-run --hide-scrollbars \
  --enable-unsafe-swiftshader \
  --autoplay-policy=no-user-gesture-required \
  --allow-file-access-from-files \
  --remote-debugging-port=9222 \
  $GAME_URL &
BROWSER_PID=$!
echo "✅ Started $BROWSER"

# Wait for game to load
echo "Waiting for game to load (15 seconds)..."
sleep 15

# Take screenshots at different intervals
echo "Taking screenshots to diagnose display issues..."
for i in {1..5}; do
  SCREENSHOT_FILE="$DEBUG_DIR/screenshot_${i}.png"
  import -display $DISPLAY -window root "$SCREENSHOT_FILE"
  echo "✅ Saved screenshot $i to $SCREENSHOT_FILE"
  sleep 2
done

# Capture browser debug info
echo "Capturing browser debug info..."
curl -s http://localhost:9222/json/version > "$DEBUG_DIR/browser_info.json"
echo "✅ Saved browser debug info"

# Test FFmpeg capture
echo "Testing FFmpeg capture..."
ffmpeg -f x11grab -framerate 30 -video_size ${SCREEN_WIDTH}x${SCREEN_HEIGHT} \
  -draw_mouse 0 -i $DISPLAY -t 5 -c:v libx264 -preset ultrafast \
  -pix_fmt yuv420p "$DEBUG_DIR/test_capture.mp4"
echo "✅ Saved test capture to $DEBUG_DIR/test_capture.mp4"

# Cleanup
echo "Cleaning up..."
kill $BROWSER_PID
kill $HTTP_PID
kill $XVFB_PID
echo "✅ Cleaned up processes"

echo
echo "Debug complete! Please check the files in $DEBUG_DIR directory."
echo "If you see a black screen in the screenshots, try the following:"
echo
echo "1. Make sure your game loads correctly in a normal browser"
echo "2. Check if your game requires user interaction to start"
echo "3. Try increasing the wait time before capturing"
echo "4. Check if your game uses WebGL which might not work in headless mode"
echo
echo "To view the test capture:"
echo "  ffplay $DEBUG_DIR/test_capture.mp4"
echo 