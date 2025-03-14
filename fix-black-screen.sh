#!/bin/bash

# Battle Memecoin Club - Fix Black Screen Script
# Script ini memperbaiki masalah layar hitam pada streaming

echo "=== Battle Memecoin Club - Fix Black Screen Script ==="
echo "Script ini akan memperbaiki masalah layar hitam pada streaming."
echo

# Backup file asli jika belum ada backup
if [ ! -f src/game.js.backup ]; then
    cp src/game.js src/game.js.backup
    echo "✅ Backup game.js dibuat"
fi

if [ ! -f index.html.backup ]; then
    cp index.html index.html.backup
    echo "✅ Backup index.html dibuat"
fi

# Modifikasi index.html untuk memaksa rendering
echo "Memodifikasi index.html untuk memaksa rendering..."
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Battle Memecoin Club</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #1a1a1a;
            overflow: hidden;
        }
        #renderDiv {
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            width: 800px;
            height: 600px;
            position: relative;
            background-color: #333333; /* Tambahkan background color */
        }
        canvas {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            background-color: #333333; /* Tambahkan background color */
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
</head>
<body>
    <div id="renderDiv"></div>
    <!-- Configuration -->
    <script src="src/config/characters.js"></script>

    <!-- Base Fighter -->
    <script src="src/characters/Fighter.js"></script>
    
    <!-- Generic Fighter System -->
    <script src="src/characters/FighterFactory.js"></script>
    <script src="src/characters/GenericFighter.js"></script>
    <script src="src/characters/GenericSkill.js"></script>
    
    <!-- Doge Fighter -->
    <script src="src/characters/doge/skills/DogeSkill1.js"></script>
    <script src="src/characters/doge/skills/DogeSkill2.js"></script>
    <script src="src/characters/doge/Doge.js"></script>
    
    <!-- Shiba Fighter -->
    <script src="src/characters/shiba/skills/ShibaSkill1.js"></script>
    <script src="src/characters/shiba/skills/ShibaSkill2.js"></script>
    <script src="src/characters/shiba/Shiba.js"></script>

    <!-- Pengu Fighter -->
    <script src="src/characters/pengu/skills/PenguSkill1.js"></script>
    <script src="src/characters/pengu/skills/PenguSkill2.js"></script>
    <script src="src/characters/pengu/Pengu.js"></script>

    <!-- Brett Fighter -->
    <script src="src/characters/brett/skills/BrettSkill1.js"></script>
    <script src="src/characters/brett/skills/BrettSkill2.js"></script>
    <script src="src/characters/brett/Brett.js"></script>

    <!-- Scenes -->
    <script src="src/scenes/PreparationScene.js"></script>
    <script src="src/scenes/BattleScene.js"></script>
    <script src="src/scenes/TestFighterScene.js"></script>
    <script src="src/scenes/TestPepeScene.js"></script>
    <script src="src/scenes/TestTrumpScene.js"></script>
    <script src="src/scenes/TestDogeScene.js"></script>
    <script src="src/scenes/TestShibaScene.js"></script>
    <script src="src/scenes/TestPenguScene.js"></script>
    <script src="src/scenes/TestBrettScene.js"></script>

    <!-- Main Game -->
    <script src="src/game.js"></script>
    
    <!-- Force rendering for headless mode -->
    <script>
        // Force canvas to be visible
        function forceCanvasVisibility() {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                canvas.style.display = 'block';
                canvas.style.visibility = 'visible';
                canvas.style.opacity = '1';
                canvas.style.backgroundColor = '#333333';
                console.log('Canvas visibility enforced');
            }
            
            // Force a redraw
            if (window.game && window.game.renderer) {
                window.game.renderer.resize(800, 600);
                console.log('Renderer resized');
            }
        }
        
        // Run immediately and then periodically
        window.addEventListener('load', function() {
            // Run immediately
            setTimeout(forceCanvasVisibility, 1000);
            
            // Run periodically
            setInterval(forceCanvasVisibility, 5000);
        });
    </script>
</body>
</html>
EOF

echo "✅ index.html dimodifikasi"

# Modifikasi game.js untuk memaksa rendering
echo "Memodifikasi game.js untuk memaksa rendering..."
cat > src/game.js << 'EOF'
const config = {
    type: Phaser.CANVAS, // Paksa menggunakan CANVAS renderer
    parent: 'renderDiv',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    backgroundColor: '#333333', // Tambahkan background color
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        PreparationScene,
        BattleScene
    ],
    render: {
        transparent: false,
        antialias: false,
        pixelArt: false
    }
};

// Auto-match configuration
const AUTO_MATCH = {
    enabled: true,
    matchCount: 0,
    maxMatches: 100,
    matchDuration: 180000,
    preparationDuration: 30000,
    timeBetweenMatches: 5000
};

// Make game globally accessible
let game;

// Initialize the game when the window loads
window.addEventListener('load', () => {
    console.log('Starting auto-match mode with preparation cycle');
    
    // Create the game instance
    game = new Phaser.Game(config);
    
    // Make game globally accessible
    window.game = game;
    
    // Start with the preparation scene
    setTimeout(() => {
        startPreparationPhase();
        
        // Set up match cycling
        if (AUTO_MATCH.enabled) {
            // This interval will be used to check if we need to move to the next phase
            setInterval(() => {
                // The scenes will handle their own transitions
                console.log('Match cycle check...');
                
                // Force renderer update
                if (game && game.renderer) {
                    game.renderer.resize(800, 600);
                }
            }, 5000);
        }
    }, 2000); // Wait 2 seconds before starting
});

// Function to start the preparation phase
function startPreparationPhase() {
    console.log('Starting preparation phase...');
    
    // Select random fighters for the next battle
    const availableFighters = [...CHARACTERS];
    
    // Make sure we have at least two fighters
    if (availableFighters.length < 2) {
        console.error('Not enough fighters available');
        return;
    }
    
    // Select random fighters
    const fighter1Index = Math.floor(Math.random() * availableFighters.length);
    const fighter1 = availableFighters[fighter1Index];
    
    // Remove the first fighter from the array
    availableFighters.splice(fighter1Index, 1);
    
    // Select second fighter
    const fighter2Index = Math.floor(Math.random() * availableFighters.length);
    const fighter2 = availableFighters[fighter2Index];
    
    console.log('Selected fighters for next battle:', fighter1.name, 'vs', fighter2.name);

    // Start with the preparation scene
    game.scene.start('PreparationScene', {
        roundNumber: AUTO_MATCH.matchCount + 1,
        fighter1Stats: fighter1,
        fighter2Stats: fighter2,
        arenaNumber: Math.floor(Math.random() * 6) + 1,
        autoMode: true,
        preparationDuration: AUTO_MATCH.preparationDuration
    });
    
    // After preparation duration, automatically start battle
    setTimeout(() => {
        startBattlePhase(fighter1, fighter2);
    }, AUTO_MATCH.preparationDuration);
}

// Function to start the battle phase
function startBattlePhase(fighter1, fighter2) {
    console.log('Starting battle phase:', fighter1.name, 'vs', fighter2.name);
    
    // Start the battle scene
    game.scene.start('BattleScene', {
        roundNumber: AUTO_MATCH.matchCount + 1,
        fighter1Stats: fighter1,
        fighter2Stats: fighter2,
        arenaNumber: Math.floor(Math.random() * 6) + 1,
        autoMode: true
    });
    
    // After battle duration, go back to preparation for next match
    setTimeout(() => {
        AUTO_MATCH.matchCount++;
        if (AUTO_MATCH.matchCount < AUTO_MATCH.maxMatches) {
            console.log(`Battle ${AUTO_MATCH.matchCount} completed. Starting next match...`);
            setTimeout(() => {
                startPreparationPhase();
            }, AUTO_MATCH.timeBetweenMatches);
        } else {
            console.log('All matches completed');
        }
    }, AUTO_MATCH.matchDuration);
}

// Force rendering for headless mode
setInterval(() => {
    if (game && game.renderer) {
        // Force a redraw
        game.renderer.resize(800, 600);
        console.log('Forced renderer update');
    }
}, 3000);
EOF

echo "✅ game.js dimodifikasi"

# Modifikasi script stream.sh
echo "Memodifikasi script stream.sh..."
sed -i 's/SCREEN_WIDTH=${WIDTH:-800}/SCREEN_WIDTH=${WIDTH:-1280}/' stream.sh
sed -i 's/SCREEN_HEIGHT=${HEIGHT:-600}/SCREEN_HEIGHT=${HEIGHT:-720}/' stream.sh
sed -i 's/sleep 30/sleep 45/' stream.sh

echo "✅ stream.sh dimodifikasi"

# Buat script untuk menjalankan streaming dengan parameter yang lebih baik
echo "Membuat script enhanced-stream.sh..."
cat > enhanced-stream.sh << 'EOF'
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
EOF

chmod +x enhanced-stream.sh
echo "✅ enhanced-stream.sh dibuat dan diberi izin eksekusi"

echo
echo "✅ Semua perbaikan telah diterapkan!"
echo
echo "Untuk menjalankan streaming dengan pengaturan yang ditingkatkan, jalankan:"
echo "  ./enhanced-stream.sh"
echo
echo "Jika Anda ingin mengembalikan file asli, jalankan:"
echo "  cp index.html.backup index.html"
echo "  cp src/game.js.backup src/game.js"
echo 