# Battle Memecoin Club - Live Streaming Setup

This document provides instructions for setting up and running the live streaming system for Battle Memecoin Club using FFmpeg and Xvfb for headless rendering.

## Overview

The streaming system consists of several components:

1. **Xvfb** - Virtual framebuffer for headless rendering
2. **FFmpeg** - For capturing and streaming the game
3. **Node.js scripts** - For automating matches and managing the streaming process
4. **NGINX RTMP Server** - Optional component for restreaming to multiple platforms
5. **Docker** - For containerizing the entire setup

## Prerequisites

- Node.js 14+ and npm
- FFmpeg
- Xvfb
- Google Chrome
- Docker and Docker Compose (optional, for containerized setup)

## Quick Start

### Option 1: Running Locally

1. Install dependencies:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y xvfb ffmpeg alsa-utils pulseaudio google-chrome-stable

# CentOS/RHEL
sudo yum install -y xvfb ffmpeg alsa-utils pulseaudio
# Install Chrome from https://www.google.com/chrome/
```

2. Set up your stream keys:

Edit `multistream.js` and replace the placeholder stream keys with your actual keys:

```javascript
platforms: [
  {
    name: 'YouTube',
    enabled: true,
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
    streamKey: 'YOUR_YOUTUBE_STREAM_KEY' // Replace this
  },
  // ...
]
```

3. Start the streaming:

```bash
node multistream.js
```

### Option 2: Using Docker

1. Set up your stream keys as environment variables:

```bash
export YOUTUBE_STREAM_KEY=your_youtube_stream_key
export TWITCH_STREAM_KEY=your_twitch_stream_key
export FACEBOOK_STREAM_KEY=your_facebook_stream_key
```

2. Build and start the containers:

```bash
docker-compose up -d
```

3. View the stream:

- RTMP: `rtmp://localhost:1935/live/battlecrypto`
- HLS: `http://localhost:8081/hls/live.m3u8`
- Web Player: `http://localhost:8081/player`

## Configuration Options

### Stream Quality Settings

You can adjust the streaming quality in `multistream.js`:

```javascript
const CONFIG = {
  // ...
  frameRate: 30,           // Frames per second
  videoBitrate: '2500k',   // Video bitrate
  audioBitrate: '128k',    // Audio bitrate
  // ...
}
```

### Auto Match Settings

You can configure the automatic match system in `autoMatch.js`:

```javascript
const CONFIG = {
  matchDuration: 180000,    // 3 minutes per match
  timeBetweenMatches: 10000, // 10 seconds between matches
  numberOfMatches: 10,      // Number of matches to run
  // ...
};
```

## Streaming to Multiple Platforms

The system supports streaming to multiple platforms simultaneously:

1. **Direct FFmpeg Method**: Using the `tee` output in FFmpeg (configured in `multistream.js`)
2. **NGINX RTMP Method**: Using NGINX as a restreaming server (configured in `nginx.conf`)

### Adding a New Streaming Platform

To add a new streaming platform:

1. In `multistream.js`, add a new entry to the `platforms` array:

```javascript
{
  name: 'NewPlatform',
  enabled: true,
  rtmpUrl: 'rtmp://streaming.newplatform.com/live',
  streamKey: 'YOUR_NEW_PLATFORM_STREAM_KEY'
}
```

2. If using NGINX RTMP, add a new push directive in `nginx.conf`:

```
push rtmp://streaming.newplatform.com/live/${NEW_PLATFORM_STREAM_KEY} allow=127.0.0.1;
```

## Troubleshooting

### Stream Not Starting

1. Check if Xvfb is running:
```bash
ps aux | grep Xvfb
```

2. Verify FFmpeg is capturing correctly:
```bash
DISPLAY=:99 ffmpeg -f x11grab -framerate 30 -video_size 800x600 -i :99 -t 5 test.mp4
```

3. Check the logs:
```bash
tail -f logs/stream_*.log
```

### Poor Stream Quality

1. Increase the bitrate in `multistream.js`:
```javascript
videoBitrate: '3500k',
```

2. Reduce the frame rate if your CPU is struggling:
```javascript
frameRate: 24,
```

### Docker Issues

1. Check container logs:
```bash
docker-compose logs -f
```

2. Ensure the container has access to the GPU (if available):
```bash
# Add to docker-compose.yml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## Advanced Usage

### Custom Game Modifications

You can modify the game behavior for streaming by editing `autoMatch.js`. For example:

- Change the fighter selection logic
- Adjust match duration
- Add custom overlays or effects

### Recording Streams

To save the stream to a file, modify the FFmpeg command in `multistream.js`:

```javascript
// Add to inputOptions array:
'-f', 'flv', 'recordings/stream_' + new Date().toISOString().replace(/:/g, '-') + '.flv',
```

## License

This streaming setup is provided as part of the Battle Memecoin Club project. 