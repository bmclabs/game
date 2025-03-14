#!/bin/bash

# Battle Memecoin Club - VNC Streaming Script
# This script uses VNC to run the streaming setup in WSL

echo "=== Battle Memecoin Club - VNC Streaming ==="
echo "This script uses VNC to run the streaming setup in WSL."
echo

# Install required packages
echo "Installing required packages..."
sudo apt-get update
sudo apt-get install -y xfce4 xfce4-goodies tightvncserver ffmpeg python3 imagemagick

# Set up VNC password
echo "Setting up VNC password..."
mkdir -p ~/.vnc
echo "battlemc" | vncpasswd -f > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# Create VNC startup script
echo "Creating VNC startup script..."
cat > ~/.vnc/xstartup << 'EOF'
#!/bin/bash
xrdb $HOME/.Xresources
startxfce4 &
EOF
chmod +x ~/.vnc/xstartup

# Kill any existing VNC server
vncserver -kill :1 2>/dev/null || true

# Start VNC server
echo "Starting VNC server..."
vncserver :1 -geometry 1280x720 -depth 24
export DISPLAY=:1

# Wait for VNC server to start
sleep 5

# Start HTTP server
echo "Starting HTTP server..."
cd "$(dirname "$0")"
python3 -m http.server 8080 &
HTTP_PID=$!
sleep 2

# Check for browser
if command -v google-chrome &> /dev/null; then
  BROWSER="google-chrome"
elif command -v chromium-browser &> /dev/null; then
  BROWSER="chromium-browser"
else
  echo "Installing Google Chrome..."
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
  echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
  sudo apt-get update
  sudo apt-get install -y google-chrome-stable
  BROWSER="google-chrome"
fi

# Start browser
echo "Starting $BROWSER..."
$BROWSER --new-window --window-size=800,600 \
  --app="http://localhost:8080" \
  --disable-notifications --disable-infobars \
  --disable-features=TranslateUI --disable-extensions \
  --autoplay-policy=no-user-gesture-required \
  --allow-file-access-from-files &
BROWSER_PID=$!

# Wait for game to load
echo "Waiting for game to load (20 seconds)..."
sleep 20

# Create screenshots directory
SCREENSHOT_DIR="screenshots"
mkdir -p $SCREENSHOT_DIR

# Take a screenshot
echo "Taking a screenshot to verify game is visible..."
SCREENSHOT_FILE="$SCREENSHOT_DIR/game_$(date +%Y%m%d_%H%M%S).png"
import -display :1 -window root "$SCREENSHOT_FILE"
echo "✅ Screenshot saved to $SCREENSHOT_FILE"

# Configure streaming
FRAMERATE=${FRAMERATE:-30}
BITRATE=${BITRATE:-4500k}
MAXRATE=${MAXRATE:-4500k}
BUFSIZE=${BUFSIZE:-9000k}
STREAM_URL=${STREAM_URL:-"rtmp://live-lhr.twitch.tv/app/live_1277047725_EBFv9IZxad5LdYNDHgWqnVDSflI8J9"}

# Start FFmpeg to capture the screen and stream
echo "Starting FFmpeg streaming to ${STREAM_URL%%/*}/*****"
ffmpeg -f x11grab -framerate $FRAMERATE -video_size 1280x720 \
  -draw_mouse 0 -i :1 -c:v libx264 -preset ultrafast -tune zerolatency \
  -b:v $BITRATE -maxrate $MAXRATE -bufsize $BUFSIZE -g $(($FRAMERATE * 2)) \
  -pix_fmt yuv420p -profile:v main -level 4.0 \
  -keyint_min $FRAMERATE -f flv $STREAM_URL

# Cleanup
kill $BROWSER_PID
kill $HTTP_PID
vncserver -kill :1

echo "Streaming ended, cleaned up processes" 