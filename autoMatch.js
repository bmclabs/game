/**
 * Automatic Match Runner for Battle Memecoin Club
 * 
 * This script modifies the game.js to run matches automatically
 * for streaming purposes.
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

// Load Twitch configuration
let twitchConfig;
try {
  twitchConfig = require('./twitch-config.js');
  console.log('Loaded Twitch configuration');
} catch (error) {
  console.error('Error loading twitch-config.js:', error.message);
  console.error('Please make sure twitch-config.js exists and is valid');
  process.exit(1);
}

// Configuration
const CONFIG = {
  matchDuration: twitchConfig.STREAM.MATCH_DURATION || 180000, // 3 minutes per match
  timeBetweenMatches: twitchConfig.STREAM.TIME_BETWEEN_MATCHES || 10000, // 10 seconds between matches
  numberOfMatches: 10, // Number of matches to run
  gameJsPath: path.join(__dirname, 'src', 'game.js'),
  backupPath: path.join(__dirname, 'src', 'game.js.backup'),
  maxReconnectAttempts: twitchConfig.STREAM.RECONNECT_ATTEMPTS || 3, // Maximum number of reconnect attempts
  reconnectDelay: twitchConfig.STREAM.RECONNECT_DELAY || 5000 // Delay between reconnect attempts (ms)
};

// Backup original game.js
if (!fs.existsSync(CONFIG.backupPath)) {
  fs.copyFileSync(CONFIG.gameJsPath, CONFIG.backupPath);
  console.log('Created backup of game.js');
}

// Modified game.js content for auto-running matches
const autoGameJs = `const config = {
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
    maxMatches: 100, // Increased to allow for more matches
    matchDuration: 180000,
    preparationDuration: 30000, // 30 seconds for preparation
    timeBetweenMatches: 5000 // 5 seconds between matches
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
            console.log(\`Battle \${AUTO_MATCH.matchCount} completed. Starting next match...\`);
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
}, 5000);

// Function to restore original game.js
function restoreOriginal() {
  if (fs.existsSync(CONFIG.backupPath)) {
    fs.copyFileSync(CONFIG.backupPath, CONFIG.gameJsPath);
    console.log('Restored original game.js');
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('Interrupted, restoring original game.js');
  restoreOriginal();
  process.exit();
});

// Variables for streaming process management
let streamProcess = null;
let reconnectAttempts = 0;
let isShuttingDown = false;

// Function to start streaming
function startStreaming() {
  console.log('Starting streaming...');
  
  // Construct the full RTMP URL
  const streamUrl = `${twitchConfig.RTMP_SERVER}/${twitchConfig.STREAM_KEY}`;
  console.log(`Streaming to: ${twitchConfig.RTMP_SERVER}/*****`); // Don't log the full stream key for security
  
  // Set environment variables to improve streaming quality
  const env = {
    ...process.env,
    WIDTH: twitchConfig.VIDEO.WIDTH.toString(),
    HEIGHT: twitchConfig.VIDEO.HEIGHT.toString(),
    FRAMERATE: twitchConfig.VIDEO.FRAMERATE.toString(),
    BITRATE: twitchConfig.VIDEO.BITRATE,
    MAXRATE: twitchConfig.VIDEO.MAXRATE,
    BUFSIZE: twitchConfig.VIDEO.BUFSIZE,
    STREAM_URL: streamUrl,
    DEBUG: '1' // Enable debug mode
  };
  
  console.log(`Video settings: ${twitchConfig.VIDEO.WIDTH}x${twitchConfig.VIDEO.HEIGHT} @ ${twitchConfig.VIDEO.FRAMERATE}fps, Bitrate: ${twitchConfig.VIDEO.BITRATE}`);
  
  // Start the streaming script
  streamProcess = spawn('bash', ['stream.sh'], { env });

  // Listen for streaming script output
  streamProcess.stdout.on('data', (data) => {
    console.log(`Streaming: ${data}`);
  });

  streamProcess.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(`Streaming Error: ${output}`);
    
    // Check for connection reset error
    if (output.includes('Connection reset by peer') && !isShuttingDown) {
      console.error('Connection to streaming server was reset');
      handleStreamingFailure();
    }
  });

  streamProcess.on('close', (code) => {
    console.log(`Streaming process exited with code ${code}`);
    
    // If not shutting down and process exited with error, try to reconnect
    if (!isShuttingDown && code !== 0) {
      handleStreamingFailure();
    } else if (isShuttingDown) {
      restoreOriginal();
    }
  });
}

// Function to handle streaming failures
function handleStreamingFailure() {
  if (reconnectAttempts < CONFIG.maxReconnectAttempts) {
    reconnectAttempts++;
    console.log(`Attempting to reconnect (${reconnectAttempts}/${CONFIG.maxReconnectAttempts})...`);
    
    // Kill any existing processes
    exec('pkill -f Xvfb; pkill -f ffmpeg; pkill -f chrome; pkill -f chromium-browser');
    
    // Check if we need to fix X11 permissions
    exec('ls -la /tmp/.X11-unix', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error checking X11 directory: ${error.message}`);
      } else {
        console.log('X11 directory permissions:');
        console.log(stdout);
        
        // If permissions are not correct, suggest manual fix
        if (!stdout.includes('drwxrwxrwt')) {
          console.error('Warning: /tmp/.X11-unix does not have correct permissions (should be 1777)');
          console.error('Please run the following command in a separate terminal:');
          console.error('sudo chmod 1777 /tmp/.X11-unix');
          console.error('Then press Enter to continue...');
          
          // Wait for user input before continuing
          process.stdin.once('data', () => {
            setTimeout(() => {
              startStreaming();
            }, 1000);
          });
          return;
        }
      }
      
      // Wait before reconnecting
      setTimeout(() => {
        startStreaming();
      }, CONFIG.reconnectDelay);
    });
  } else {
    console.error('Maximum reconnect attempts reached. Exiting...');
    isShuttingDown = true;
    restoreOriginal();
    process.exit(1);
  }
}

// Start streaming
startStreaming();

console.log('Auto-match runner started. Press Ctrl+C to stop.');

// Write the modified game.js
fs.writeFileSync(CONFIG.gameJsPath, autoGameJs);
console.log('Modified game.js for auto-matches'); 