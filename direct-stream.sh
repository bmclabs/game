#!/bin/bash

# Battle Memecoin Club - Direct Streaming Script
# Script ini menggunakan pendekatan yang lebih sederhana untuk streaming

echo "=== Battle Memecoin Club - Direct Streaming Script ==="
echo "Script ini menggunakan pendekatan yang lebih sederhana untuk streaming."
echo

# Konfigurasi
STREAM_URL="rtmp://live.restream.io/live/re_9333420_event43a04f6991e84d6eb1661fb590e6dab0"
SCREEN_WIDTH=1280
SCREEN_HEIGHT=720
FRAMERATE=30
BITRATE="3000k"
MAXRATE="3000k"
BUFSIZE="6000k"  # Dua kali bitrate
PORT=8000

# Matikan proses yang mungkin masih berjalan
echo "Membersihkan proses yang masih berjalan..."
pkill -f ffmpeg
pkill -f "python.*http.server"
pkill -f "google-chrome"
pkill -f "chromium-browser"

# Buat direktori screenshots jika belum ada
mkdir -p screenshots

# Mulai server HTTP
echo "Memulai server HTTP di port $PORT..."
cd "$(dirname "$0")"
python3 -m http.server $PORT &
HTTP_PID=$!
sleep 2

# Buka browser untuk menjalankan game
echo "Membuka browser untuk menjalankan game..."
if command -v google-chrome &> /dev/null; then
  google-chrome --new-window --window-size=$SCREEN_WIDTH,$SCREEN_HEIGHT http://localhost:$PORT &
elif command -v chromium-browser &> /dev/null; then
  chromium-browser --new-window --window-size=$SCREEN_WIDTH,$SCREEN_HEIGHT http://localhost:$PORT &
else
  echo "❌ Google Chrome atau Chromium tidak ditemukan."
  kill $HTTP_PID
  exit 1
fi

BROWSER_PID=$!
echo "✅ Browser dibuka. Silakan posisikan jendela browser agar terlihat penuh."
echo "⚠️ JANGAN tutup jendela browser selama streaming berlangsung!"

# Tunggu game dimuat
echo "Menunggu game dimuat (15 detik)..."
sleep 15

# Ambil screenshot untuk verifikasi
echo "Mengambil screenshot untuk verifikasi..."
SCREENSHOT_FILE="screenshots/game_$(date +%Y%m%d_%H%M%S).png"

if command -v gnome-screenshot &> /dev/null; then
  gnome-screenshot -w -f "$SCREENSHOT_FILE"
elif command -v scrot &> /dev/null; then
  scrot "$SCREENSHOT_FILE"
else
  echo "⚠️ Tidak dapat mengambil screenshot. Melanjutkan tanpa screenshot."
fi

echo "✅ Persiapan selesai. Memulai streaming..."
echo "⚠️ Pastikan jendela browser terlihat dan tidak tertutup jendela lain."
echo "⚠️ Jangan meminimalkan jendela browser selama streaming."
echo

# Mulai streaming dengan FFmpeg
echo "Memulai streaming ke Restream.io..."
echo "Stream URL: ${STREAM_URL%%/*}/*****"
echo "Tekan Ctrl+C untuk menghentikan streaming."

# Gunakan x11grab untuk Linux/WSL atau gdigrab untuk Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  ffmpeg -f gdigrab -framerate $FRAMERATE -i title="Battle Memecoin Club" \
    -c:v libx264 -preset veryfast -tune zerolatency \
    -b:v $BITRATE -maxrate $MAXRATE -bufsize $BUFSIZE \
    -pix_fmt yuv420p -g $(($FRAMERATE * 2)) \
    -f flv $STREAM_URL
else
  # Linux/WSL
  # Cari ID jendela browser
  sleep 2
  WINDOW_ID=$(xdotool search --name "Battle Memecoin Club" | head -1)
  
  if [ -z "$WINDOW_ID" ]; then
    echo "⚠️ Tidak dapat menemukan jendela browser. Menggunakan seluruh layar."
    ffmpeg -f x11grab -framerate $FRAMERATE -video_size ${SCREEN_WIDTH}x${SCREEN_HEIGHT} \
      -i $DISPLAY -c:v libx264 -preset veryfast -tune zerolatency \
      -b:v $BITRATE -maxrate $MAXRATE -bufsize $BUFSIZE \
      -pix_fmt yuv420p -g $(($FRAMERATE * 2)) \
      -f flv $STREAM_URL
  else
    echo "✅ Jendela browser ditemukan. ID: $WINDOW_ID"
    # Aktifkan jendela browser
    xdotool windowactivate $WINDOW_ID
    sleep 1
    
    # Dapatkan posisi dan ukuran jendela
    WINDOW_GEOMETRY=$(xdotool getwindowgeometry $WINDOW_ID)
    WINDOW_POSITION=$(echo "$WINDOW_GEOMETRY" | grep Position | awk '{print $2}')
    WINDOW_SIZE=$(echo "$WINDOW_GEOMETRY" | grep Geometry | awk '{print $2}')
    
    echo "Posisi jendela: $WINDOW_POSITION, Ukuran: $WINDOW_SIZE"
    
    # Ekstrak koordinat X, Y dan ukuran W, H
    X=$(echo $WINDOW_POSITION | cut -d',' -f1)
    Y=$(echo $WINDOW_POSITION | cut -d',' -f2)
    W=$(echo $WINDOW_SIZE | cut -d'x' -f1)
    H=$(echo $WINDOW_SIZE | cut -d'x' -f2)
    
    # Streaming jendela browser
    ffmpeg -f x11grab -framerate $FRAMERATE -video_size ${W}x${H} \
      -i $DISPLAY+$X,$Y -c:v libx264 -preset veryfast -tune zerolatency \
      -b:v $BITRATE -maxrate $MAXRATE -bufsize $BUFSIZE \
      -pix_fmt yuv420p -g $(($FRAMERATE * 2)) \
      -f flv $STREAM_URL
  fi
fi

# Bersihkan
echo "Streaming selesai. Membersihkan..."
kill $HTTP_PID
kill $BROWSER_PID 2>/dev/null

echo "✅ Selesai." 