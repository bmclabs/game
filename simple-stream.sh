#!/bin/bash

# Battle Memecoin Club - Simple Streaming Script
# Script ini menggunakan pendekatan yang sangat sederhana untuk streaming

echo "=== Battle Memecoin Club - Simple Streaming Script ==="
echo "Script ini menggunakan pendekatan yang sangat sederhana untuk streaming."
echo

# Konfigurasi
STREAM_URL="rtmp://live.restream.io/live/re_9333420_event43a04f6991e84d6eb1661fb590e6dab0"
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

echo "✅ Server HTTP berjalan di http://localhost:$PORT"
echo "Buka browser dan arahkan ke http://localhost:$PORT"
echo "Tunggu hingga game dimuat sepenuhnya."
echo "Posisikan jendela browser agar terlihat jelas di layar."
echo

read -p "Tekan Enter setelah game dimuat..." dummy

echo "Memulai streaming ke Restream.io dalam 5 detik..."
echo "Stream URL: ${STREAM_URL%%/*}/*****"
echo "Tekan Ctrl+C untuk menghentikan streaming."
sleep 5

# Streaming dengan parameter yang sangat konservatif
ffmpeg -f x11grab -r 20 -s 800x600 -i $DISPLAY \
  -vcodec libx264 -pix_fmt yuv420p -preset ultrafast \
  -b:v 1000k -maxrate 1000k -bufsize 2000k \
  -g 40 -f flv $STREAM_URL

# Bersihkan
echo "Streaming selesai. Membersihkan..."
kill $HTTP_PID

echo "✅ Selesai." 