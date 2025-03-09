#!/bin/bash

# Battle Memecoin Club - Fix Black Screen Script
# This script applies fixes for common black screen issues

echo "=== Battle Memecoin Club - Fix Black Screen Script ==="
echo "This script will apply fixes for common black screen issues."
echo

# Create a modified index.html with forced rendering
echo "Creating modified index.html for better rendering..."
cp index.html index.html.backup

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
        }
        canvas {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
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
        window.addEventListener('load', function() {
            setTimeout(function() {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                    canvas.style.display = 'block';
                    canvas.style.visibility = 'visible';
                    canvas.style.opacity = '1';
                    console.log('Canvas visibility enforced');
                }
                
                // Force a redraw
                if (window.game && window.game.renderer) {
                    window.game.renderer.resize(800, 600);
                    console.log('Renderer resized');
                }
            }, 1000);
        });
    </script>
</body>
</html>
EOF

echo "✅ Created modified index.html"

# Create a modified game.js with better headless support
echo "Creating modified game.js for better headless support..."
cp src/game.js src/game.js.backup

cat > src/game.js << 'EOF'
const config = {
    type: Phaser.CANVAS, // Force CANVAS renderer instead of AUTO
    parent: 'renderDiv',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
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
    maxMatches: 10,
    matchDuration: 180000,
    timeBetweenMatches: 10000
};

// Make game globally accessible
let game;

// Initialize the game when the window loads
window.addEventListener('load', () => {
    console.log('Starting auto-match mode');
    
    // Create the game instance
    game = new Phaser.Game(config);
    
    // Make game globally accessible
    window.game = game;
    
    // Start with the battle scene directly
    setTimeout(() => {
        startRandomMatch(game);
        
        // Set up match cycling
        if (AUTO_MATCH.enabled) {
            setInterval(() => {
                if (AUTO_MATCH.matchCount < AUTO_MATCH.maxMatches) {
                    console.log(`Starting match ${AUTO_MATCH.matchCount + 1} of ${AUTO_MATCH.maxMatches}`);
                    startRandomMatch(game);
                    AUTO_MATCH.matchCount++;
                } else {
                    console.log('All matches completed');
                }
            }, AUTO_MATCH.matchDuration + AUTO_MATCH.timeBetweenMatches);
        }
    }, 2000); // Wait 2 seconds before starting the first match
});

function startRandomMatch(game) {
    // Select random fighters
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
    
    console.log('Selected fighters:', fighter1.name, 'vs', fighter2.name);

    // Start with the battle scene
    game.scene.start('BattleScene', {
        roundNumber: AUTO_MATCH.matchCount + 1,
        fighter1Stats: fighter1,
        fighter2Stats: fighter2,
        arenaNumber: Math.floor(Math.random() * 6) + 1,
        autoMode: true
    });
}

// Force rendering for headless mode
setInterval(() => {
    if (game && game.renderer) {
        // Force a redraw
        game.renderer.resize(800, 600);
        console.log('Forced renderer update');
    }
}, 5000);
EOF

echo "✅ Created modified game.js"

# Update stream.sh with better browser parameters
echo "Updating stream.sh with better browser parameters..."
sed -i 's/--disable-gpu/--use-gl=swiftshader --ignore-gpu-blocklist/g' stream.sh
sed -i 's/sleep 15/sleep 20/g' stream.sh
sed -i 's/BITRATE=${BITRATE:-3000k}/BITRATE=${BITRATE:-4500k}/g' stream.sh

echo "✅ Updated stream.sh"

# Make sure we have ImageMagick for screenshots
if ! command -v import &> /dev/null; then
    echo "Installing ImageMagick for screenshots..."
    sudo apt-get update
    sudo apt-get install -y imagemagick
    echo "✅ Installed ImageMagick"
fi

echo
echo "✅ All fixes applied!"
echo
echo "To test the fixes, run:"
echo "  ./debug-stream.sh"
echo
echo "To start streaming with the fixes, run:"
echo "  node autoMatch.js"
echo
echo "If you want to revert the changes, run:"
echo "  mv index.html.backup index.html"
echo "  mv src/game.js.backup src/game.js"
echo 