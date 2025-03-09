#!/bin/bash

# Battle Memecoin Club - Streaming Setup Helper
# This script prepares your environment for streaming

echo "=== Battle Memecoin Club - Streaming Setup Helper ==="
echo "This script will prepare your environment for streaming."
echo

# Check for required tools
echo "Checking for required tools..."

MISSING_TOOLS=0

check_tool() {
  if ! command -v $1 &> /dev/null; then
    echo "❌ $1 is not installed"
    MISSING_TOOLS=1
    return 1
  else
    echo "✅ $1 is installed"
    return 0
  fi
}

check_tool node
check_tool npm
check_tool ffmpeg
check_tool Xvfb
check_tool python3

# Check for browser
if check_tool google-chrome; then
  BROWSER="google-chrome"
elif check_tool chromium-browser; then
  BROWSER="chromium-browser"
else
  echo "❌ Neither Google Chrome nor Chromium is installed"
  MISSING_TOOLS=1
fi

if [ $MISSING_TOOLS -eq 1 ]; then
  echo
  echo "Some required tools are missing. Please install them before continuing."
  echo "You can use the following commands to install missing tools:"
  echo
  echo "sudo apt update"
  echo "sudo apt install -y nodejs npm ffmpeg xvfb python3"
  echo "sudo apt install -y google-chrome-stable"
  echo "  or"
  echo "sudo apt install -y chromium-browser"
  echo
  exit 1
fi

# Fix X11 permissions
echo
echo "Fixing X11 permissions..."
if [ ! -d /tmp/.X11-unix ]; then
  sudo mkdir -p /tmp/.X11-unix
fi

sudo chmod 1777 /tmp/.X11-unix
echo "✅ Fixed X11 permissions"

# Kill any existing processes
echo
echo "Cleaning up any existing processes..."
pkill -f Xvfb
pkill -f ffmpeg
pkill -f "google-chrome.*headless"
pkill -f "chromium-browser.*headless"
echo "✅ Cleaned up processes"

# Check Twitch configuration
echo
echo "Checking Twitch configuration..."
if [ ! -f twitch-config.js ]; then
  echo "❌ twitch-config.js not found"
  echo "Creating a template configuration file..."
  
  cat > twitch-config.js << 'EOF'
/**
 * Twitch Streaming Configuration
 * 
 * This file contains configuration for streaming to Twitch.
 * Edit the STREAM_KEY value with your own Twitch stream key.
 */

module.exports = {
  // Your Twitch stream key from https://dashboard.twitch.tv/settings/stream
  STREAM_KEY: 'your-stream-key-here',
  
  // Twitch RTMP server URL (usually don't need to change this)
  RTMP_SERVER: 'rtmp://live.twitch.tv/app',
  
  // Video settings
  VIDEO: {
    WIDTH: 800,
    HEIGHT: 600,
    FRAMERATE: 30,
    BITRATE: '3000k',
    MAXRATE: '3000k',
    BUFSIZE: '6000k'
  },
  
  // Stream settings
  STREAM: {
    RECONNECT_ATTEMPTS: 3,
    RECONNECT_DELAY: 5000, // ms
    MATCH_DURATION: 180000, // 3 minutes
    TIME_BETWEEN_MATCHES: 10000 // 10 seconds
  }
};
EOF
  
  echo "✅ Created template twitch-config.js"
  echo "⚠️ Please edit twitch-config.js and add your Twitch stream key"
else
  echo "✅ twitch-config.js found"
fi

# Test Xvfb
echo
echo "Testing Xvfb..."
Xvfb :99 -screen 0 800x600x24 &
XVFB_PID=$!
sleep 1

if kill -0 $XVFB_PID 2>/dev/null; then
  echo "✅ Xvfb is working correctly"
  kill $XVFB_PID
else
  echo "❌ Xvfb failed to start"
  echo "Please check your Xvfb installation"
  exit 1
fi

# All checks passed
echo
echo "✅ All checks passed! Your environment is ready for streaming."
echo
echo "To start streaming, run:"
echo "  node autoMatch.js"
echo
echo "For more information, see STREAMING-GUIDE.md"
echo 