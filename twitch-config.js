/**
 * Twitch Streaming Configuration
 * 
 * This file contains configuration for streaming to Twitch.
 * Edit the STREAM_KEY value with your own Twitch stream key.
 */

module.exports = {
  // Your Twitch stream key from https://dashboard.twitch.tv/settings/stream
  STREAM_KEY: 'live_1277047725_EBFv9IZxad5LdYNDHgWqnVDSflI8J9',
  
  // Twitch RTMP server URL (usually don't need to change this)
  RTMP_SERVER: 'rtmp://live-lhr.twitch.tv/app',
  
  // Video settings
  VIDEO: {
    WIDTH: 1280,
    HEIGHT: 720,
    FRAMERATE: 30,
    BITRATE: '4000k',
    MAXRATE: '4000k',
    BUFSIZE: '8000k'
  },
  
  // Stream settings
  STREAM: {
    RECONNECT_ATTEMPTS: 3,
    RECONNECT_DELAY: 5000, // ms
    MATCH_DURATION: 180000, // 3 minutes
    TIME_BETWEEN_MATCHES: 10000 // 10 seconds
  }
}; 