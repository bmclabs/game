FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    xvfb \
    ffmpeg \
    alsa-utils \
    pulseaudio \
    nodejs \
    npm \
    curl \
    wget \
    python3 \
    python3-pip \
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
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash streamer
USER streamer
WORKDIR /home/streamer

# Copy the game files
COPY --chown=streamer:streamer . /home/streamer/game

# Set working directory
WORKDIR /home/streamer/game

# Install Node.js dependencies
RUN npm install

# Create directories for logs
RUN mkdir -p /home/streamer/game/logs

# Set up virtual audio device
USER root
RUN echo "pcm.dummy { type hw card 0 }" > /etc/asound.conf \
    && echo "ctl.dummy { type hw card 0 }" >> /etc/asound.conf
USER streamer

# Set up environment variables
ENV DISPLAY=:99
ENV AUDIODEV=null

# Expose port for HTTP server
EXPOSE 8080

# Set entry point
ENTRYPOINT ["node", "multistream.js"] 