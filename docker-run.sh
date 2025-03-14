#!/bin/bash

# Battle Memecoin Club - Docker Run Script
# This script runs the streaming setup using Docker

echo "=== Battle Memecoin Club - Docker Run Script ==="
echo "This script runs the streaming setup using Docker."
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit https://docs.docker.com/engine/install/ubuntu/ for installation instructions."
    exit 1
fi

# Create a temporary Dockerfile
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
ENV STREAM_URL="rtmp://live.restream.io/live/re_9333420_event43a04f6991e84d6eb1661fb590e6dab0"
ENV BITRATE=4500k
ENV MAXRATE=4500k
ENV BUFSIZE=9000k
ENV FRAMERATE=30

# Create a script to run the streaming
RUN echo '#!/bin/bash \n\
# Modify game.js for full cycle \n\
cat > src/game.js << "GAMEJS" \n\
const config = { \n\
    type: Phaser.CANVAS, \n\
    parent: "renderDiv", \n\
    scale: { \n\
        mode: Phaser.Scale.FIT, \n\
        autoCenter: Phaser.Scale.CENTER_BOTH, \n\
        width: 800, \n\
        height: 600 \n\
    }, \n\
    physics: { \n\
        default: "arcade", \n\
        arcade: { \n\
            gravity: { y: 0 }, \n\
            debug: false \n\
        } \n\
    }, \n\
    scene: [ \n\
        PreparationScene, \n\
        BattleScene \n\
    ], \n\
    render: { \n\
        transparent: false, \n\
        antialias: false, \n\
        pixelArt: false \n\
    } \n\
}; \n\
\n\
// Auto-match configuration \n\
const AUTO_MATCH = { \n\
    enabled: true, \n\
    matchCount: 0, \n\
    maxMatches: 100, \n\
    matchDuration: 180000, \n\
    preparationDuration: 30000, \n\
    timeBetweenMatches: 5000 \n\
}; \n\
\n\
// Make game globally accessible \n\
let game; \n\
\n\
// Initialize the game when the window loads \n\
window.addEventListener("load", () => { \n\
    console.log("Starting auto-match mode with preparation cycle"); \n\
    \n\
    // Create the game instance \n\
    game = new Phaser.Game(config); \n\
    \n\
    // Make game globally accessible \n\
    window.game = game; \n\
    \n\
    // Start with the preparation scene \n\
    setTimeout(() => { \n\
        startPreparationPhase(); \n\
        \n\
        // Set up match cycling \n\
        if (AUTO_MATCH.enabled) { \n\
            // This interval will be used to check if we need to move to the next phase \n\
            setInterval(() => { \n\
                // The scenes will handle their own transitions \n\
                console.log("Match cycle check..."); \n\
            }, 5000); \n\
        } \n\
    }, 2000); // Wait 2 seconds before starting \n\
}); \n\
\n\
// Function to start the preparation phase \n\
function startPreparationPhase() { \n\
    console.log("Starting preparation phase..."); \n\
    \n\
    // Select random fighters for the next battle \n\
    const availableFighters = [...CHARACTERS]; \n\
    \n\
    // Make sure we have at least two fighters \n\
    if (availableFighters.length < 2) { \n\
        console.error("Not enough fighters available"); \n\
        return; \n\
    } \n\
    \n\
    // Select random fighters \n\
    const fighter1Index = Math.floor(Math.random() * availableFighters.length); \n\
    const fighter1 = availableFighters[fighter1Index]; \n\
    \n\
    // Remove the first fighter from the array \n\
    availableFighters.splice(fighter1Index, 1); \n\
    \n\
    // Select second fighter \n\
    const fighter2Index = Math.floor(Math.random() * availableFighters.length); \n\
    const fighter2 = availableFighters[fighter2Index]; \n\
    \n\
    console.log("Selected fighters for next battle:", fighter1.name, "vs", fighter2.name); \n\
\n\
    // Start with the preparation scene \n\
    game.scene.start("PreparationScene", { \n\
        roundNumber: AUTO_MATCH.matchCount + 1, \n\
        fighter1Stats: fighter1, \n\
        fighter2Stats: fighter2, \n\
        arenaNumber: Math.floor(Math.random() * 6) + 1, \n\
        autoMode: true, \n\
        preparationDuration: AUTO_MATCH.preparationDuration \n\
    }); \n\
    \n\
    // After preparation duration, automatically start battle \n\
    setTimeout(() => { \n\
        startBattlePhase(fighter1, fighter2); \n\
    }, AUTO_MATCH.preparationDuration); \n\
} \n\
\n\
// Function to start the battle phase \n\
function startBattlePhase(fighter1, fighter2) { \n\
    console.log("Starting battle phase:", fighter1.name, "vs", fighter2.name); \n\
    \n\
    // Start the battle scene \n\
    game.scene.start("BattleScene", { \n\
        roundNumber: AUTO_MATCH.matchCount + 1, \n\
        fighter1Stats: fighter1, \n\
        fighter2Stats: fighter2, \n\
        arenaNumber: Math.floor(Math.random() * 6) + 1, \n\
        autoMode: true \n\
    }); \n\
    \n\
    // After battle duration, go back to preparation for next match \n\
    setTimeout(() => { \n\
        AUTO_MATCH.matchCount++; \n\
        if (AUTO_MATCH.matchCount < AUTO_MATCH.maxMatches) { \n\
            console.log(`Battle ${AUTO_MATCH.matchCount} completed. Starting next match...`); \n\
            setTimeout(() => { \n\
                startPreparationPhase(); \n\
            }, AUTO_MATCH.timeBetweenMatches); \n\
        } else { \n\
            console.log("All matches completed"); \n\
        } \n\
    }, AUTO_MATCH.matchDuration); \n\
} \n\
\n\
// Force rendering for headless mode \n\
setInterval(() => { \n\
    if (game && game.renderer) { \n\
        // Force a redraw \n\
        game.renderer.resize(800, 600); \n\
        console.log("Forced renderer update"); \n\
    } \n\
}, 5000); \n\
GAMEJS\n\
\n\
echo "Modified game.js for full cycle" \n\
\n\
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
sleep 30 \n\
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