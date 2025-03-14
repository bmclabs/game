#!/bin/bash

# Battle Memecoin Club - Desktop Streaming Script
# Script ini menangkap seluruh desktop untuk streaming

echo "=== Battle Memecoin Club - Desktop Streaming Script ==="
echo "Script ini akan menangkap seluruh desktop untuk streaming."
echo

# Konfigurasi
STREAM_URL="rtmp://live.restream.io/live/re_9333420_event43a04f6991e84d6eb1661fb590e6dab0"
FRAMERATE=30
BITRATE="2500k"
PORT=8000

# Matikan proses yang mungkin masih berjalan
echo "Membersihkan proses yang masih berjalan..."
pkill -f ffmpeg
pkill -f "python.*http.server"

# Mulai server HTTP
echo "Memulai server HTTP di port $PORT..."
cd "$(dirname "$0")"
python3 -m http.server $PORT &
HTTP_PID=$!
sleep 2

echo "Buka browser dan arahkan ke http://localhost:$PORT"
echo "Tunggu hingga game dimuat sepenuhnya."
echo "Posisikan jendela browser agar terlihat jelas di layar."
echo

read -p "Tekan Enter untuk memulai streaming..." dummy

echo "Memulai streaming ke Restream.io dalam 5 detik..."
echo "Stream URL: ${STREAM_URL%%/*}/*****"
echo "Tekan Ctrl+C untuk menghentikan streaming."
sleep 5

# Dapatkan resolusi layar
if command -v xdpyinfo &> /dev/null; then
  RESOLUTION=$(xdpyinfo | grep dimensions | awk '{print $2}')
  echo "Resolusi layar terdeteksi: $RESOLUTION"
else
  RESOLUTION="1920x1080"
  echo "Tidak dapat mendeteksi resolusi layar. Menggunakan default: $RESOLUTION"
fi

# Streaming seluruh desktop
ffmpeg -f x11grab -framerate $FRAMERATE -video_size $RESOLUTION \
  -i $DISPLAY -c:v libx264 -preset ultrafast -tune zerolatency \
  -b:v $BITRATE -pix_fmt yuv420p -g $(($FRAMERATE * 2)) \
  -f flv $STREAM_URL

# Bersihkan
echo "Streaming selesai. Membersihkan..."
kill $HTTP_PID

echo "✅ Selesai." 