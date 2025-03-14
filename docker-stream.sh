#!/bin/bash

# Battle Memecoin Club - Docker Streaming Script
# This script uses Docker to run the streaming setup

echo "=== Battle Memecoin Club - Docker Streaming ==="
echo "This script uses Docker to run the streaming setup."
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit https://docs.docker.com/engine/install/ubuntu/ for installation instructions."
    exit 1
fi

# Create a Dockerfile
echo "Creating Dockerfile..."
cat > Dockerfile.stream << 'EOF'
FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    xvfb \
    ffmpeg \
    python3 \
    python3-pip \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    imagemagick \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy the game files
COPY . /app

# Set up environment variables
ENV DISPLAY=:99
ENV STREAM_URL="rtmp://live-lhr.twitch.tv/app/live_1277047725_EBFv9IZxad5LdYNDHgWqnVDSflI8J9"
ENV BITRATE=4500k
ENV MAXRATE=4500k
ENV BUFSIZE=9000k
ENV FRAMERATE=30

# Create a script to run the streaming
RUN echo '#!/bin/bash \n\
# Start Xvfb \n\
Xvfb :99 -screen 0 1280x720x24 -ac & \n\
sleep 1 \n\
\n\
# Start HTTP server \n\
python3 -m http.server 8080 & \n\
sleep 2 \n\
\n\
# Start Chrome \n\
google-chrome --no-sandbox --use-gl=swiftshader --ignore-gpu-blocklist --headless \
  --window-size=1280,720 \
  --disable-notifications --disable-infobars --disable-dev-shm-usage \
  --disable-features=TranslateUI --disable-extensions --disable-popup-blocking \
  --disable-background-networking --disable-sync --disable-default-apps \
  --no-first-run --hide-scrollbars \
  --enable-unsafe-swiftshader \
  --autoplay-policy=no-user-gesture-required \
  --allow-file-access-from-files \
  http://localhost:8080 & \n\
\n\
# Wait for game to load \n\
sleep 20 \n\
\n\
# Take a screenshot \n\
mkdir -p /app/screenshots \n\
import -display :99 -window root "/app/screenshots/game_$(date +%Y%m%d_%H%M%S).png" \n\
\n\
# Start FFmpeg streaming \n\
ffmpeg -f x11grab -framerate $FRAMERATE -video_size 1280x720 \
  -draw_mouse 0 -i :99 -c:v libx264 -preset ultrafast -tune zerolatency \
  -b:v $BITRATE -maxrate $MAXRATE -bufsize $BUFSIZE -g $(($FRAMERATE * 2)) \
  -pix_fmt yuv420p -profile:v main -level 4.0 \
  -keyint_min $FRAMERATE -f flv $STREAM_URL \n\
' > /app/run-stream.sh

RUN chmod +x /app/run-stream.sh

# Command to run when container starts
CMD ["/app/run-stream.sh"]
EOF

echo "✅ Created Dockerfile"

# Build the Docker image
echo "Building Docker image (this may take a few minutes)..."
docker build -t battle-memecoin-stream -f Dockerfile.stream .
echo "✅ Built Docker image"

# Run the Docker container
echo "Starting streaming container..."
docker run --rm battle-memecoin-stream

echo "Streaming ended" 