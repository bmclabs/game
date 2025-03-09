/**
 * Multi-platform Streaming Manager for Battle Memecoin Club
 * 
 * This script manages streaming to multiple platforms simultaneously
 * using FFmpeg.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  xvfbDisplay: ':99',
  screenWidth: 800,
  screenHeight: 600,
  frameRate: 30,
  videoBitrate: '2500k',
  audioBitrate: '128k',
  keyframeInterval: 60, // 2 seconds at 30fps
  preset: 'veryfast',
  platforms: [
    {
      name: 'YouTube',
      enabled: true,
      rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
      streamKey: 'YOUR_YOUTUBE_STREAM_KEY' // Replace with your actual stream key
    },
    {
      name: 'Twitch',
      enabled: true,
      rtmpUrl: 'rtmp://live.twitch.tv/app',
      streamKey: 'live_1277047725_EBFv9IZxad5LdYNDHgWqnVDSflI8J9' // Replace with your actual stream key
    },
    {
      name: 'Facebook',
      enabled: false,
      rtmpUrl: 'rtmp://live-api-s.facebook.com:80/rtmp',
      streamKey: 'YOUR_FACEBOOK_STREAM_KEY' // Replace with your actual stream key
    }
  ],
  logDirectory: path.join(__dirname, 'logs')
};

// Ensure log directory exists
if (!fs.existsSync(CONFIG.logDirectory)) {
  fs.mkdirSync(CONFIG.logDirectory, { recursive: true });
}

// Create log files
const logFile = fs.createWriteStream(path.join(CONFIG.logDirectory, `stream_${new Date().toISOString().replace(/:/g, '-')}.log`));
const errorLogFile = fs.createWriteStream(path.join(CONFIG.logDirectory, `stream_error_${new Date().toISOString().replace(/:/g, '-')}.log`));

// Helper function to log messages
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logFile.write(logMessage + '\n');
}

// Helper function to log errors
function logError(message) {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ERROR: ${message}`;
  console.error(errorMessage);
  errorLogFile.write(errorMessage + '\n');
}

// Build FFmpeg command
function buildFFmpegCommand() {
  // Base input options
  const inputOptions = [
    '-f', 'x11grab',
    '-framerate', CONFIG.frameRate.toString(),
    '-video_size', `${CONFIG.screenWidth}x${CONFIG.screenHeight}`,
    '-i', CONFIG.xvfbDisplay,
    '-f', 'alsa',
    '-i', 'default',
    '-c:v', 'libx264',
    '-preset', CONFIG.preset,
    '-tune', 'zerolatency',
    '-b:v', CONFIG.videoBitrate,
    '-maxrate', CONFIG.videoBitrate,
    '-bufsize', `${parseInt(CONFIG.videoBitrate) * 2}k`,
    '-g', CONFIG.keyframeInterval.toString(),
    '-keyint_min', CONFIG.keyframeInterval.toString(),
    '-c:a', 'aac',
    '-b:a', CONFIG.audioBitrate,
    '-ar', '44100',
    '-f', 'tee'
  ];

  // Build the tee output format
  const enabledPlatforms = CONFIG.platforms.filter(p => p.enabled);
  
  if (enabledPlatforms.length === 0) {
    throw new Error('No streaming platforms enabled');
  }
  
  const teeOutputs = enabledPlatforms.map(platform => {
    return `[f=flv:onfail=ignore]${platform.rtmpUrl}/${platform.streamKey}`;
  }).join('|');
  
  return [...inputOptions, teeOutputs];
}

// Start Xvfb
log('Starting Xvfb...');
const xvfb = spawn('Xvfb', [
  CONFIG.xvfbDisplay,
  '-screen', '0', 
  `${CONFIG.screenWidth}x${CONFIG.screenHeight}x24`
]);

xvfb.on('error', (err) => {
  logError(`Failed to start Xvfb: ${err.message}`);
  process.exit(1);
});

// Wait for Xvfb to start
setTimeout(() => {
  // Start the auto match script
  log('Starting auto match script...');
  const autoMatch = spawn('node', ['autoMatch.js'], {
    env: { ...process.env, DISPLAY: CONFIG.xvfbDisplay }
  });
  
  autoMatch.stdout.on('data', (data) => {
    log(`AutoMatch: ${data.toString().trim()}`);
  });
  
  autoMatch.stderr.on('data', (data) => {
    logError(`AutoMatch Error: ${data.toString().trim()}`);
  });
  
  autoMatch.on('close', (code) => {
    log(`AutoMatch process exited with code ${code}`);
    // Stop FFmpeg when auto match ends
    if (ffmpeg) {
      ffmpeg.kill('SIGINT');
    }
  });
  
  // Wait for the game to start
  setTimeout(() => {
    try {
      // Start FFmpeg
      log('Starting FFmpeg for multi-platform streaming...');
      log(`Streaming to: ${CONFIG.platforms.filter(p => p.enabled).map(p => p.name).join(', ')}`);
      
      const ffmpegCommand = buildFFmpegCommand();
      log(`FFmpeg command: ffmpeg ${ffmpegCommand.join(' ')}`);
      
      const ffmpeg = spawn('ffmpeg', ffmpegCommand);
      
      ffmpeg.stdout.on('data', (data) => {
        log(`FFmpeg: ${data.toString().trim()}`);
      });
      
      ffmpeg.stderr.on('data', (data) => {
        // FFmpeg logs to stderr by default, so we don't treat all as errors
        const message = data.toString().trim();
        if (message.includes('Error') || message.includes('error') || message.includes('failed')) {
          logError(`FFmpeg: ${message}`);
        } else {
          log(`FFmpeg: ${message}`);
        }
      });
      
      ffmpeg.on('close', (code) => {
        log(`FFmpeg process exited with code ${code}`);
        // Clean up
        xvfb.kill();
        if (autoMatch && !autoMatch.killed) {
          autoMatch.kill();
        }
        process.exit(0);
      });
      
      // Handle process termination
      process.on('SIGINT', () => {
        log('Received SIGINT, shutting down...');
        if (ffmpeg && !ffmpeg.killed) {
          ffmpeg.kill('SIGINT');
        }
        if (autoMatch && !autoMatch.killed) {
          autoMatch.kill();
        }
        if (xvfb && !xvfb.killed) {
          xvfb.kill();
        }
      });
      
    } catch (error) {
      logError(`Failed to start FFmpeg: ${error.message}`);
      if (autoMatch && !autoMatch.killed) {
        autoMatch.kill();
      }
      if (xvfb && !xvfb.killed) {
        xvfb.kill();
      }
      process.exit(1);
    }
  }, 5000); // Wait 5 seconds for the game to start
  
}, 2000); // Wait 2 seconds for Xvfb to start

log('Multi-platform streaming manager started. Press Ctrl+C to stop.'); 