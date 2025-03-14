#!/bin/bash

# Battle Memecoin Club - OBS Studio Streaming Script
# Script ini menggunakan OBS Studio untuk streaming

echo "=== Battle Memecoin Club - OBS Studio Streaming Script ==="
echo "Script ini akan membantu Anda mengatur OBS Studio untuk streaming."
echo

# Konfigurasi
PORT=8000
STREAM_URL="rtmp://live.restream.io/live"
STREAM_KEY="re_9333420_event43a04f6991e84d6eb1661fb590e6dab0"

# Matikan proses yang mungkin masih berjalan
echo "Membersihkan proses yang masih berjalan..."
pkill -f "python.*http.server"

# Mulai server HTTP
echo "Memulai server HTTP di port $PORT..."
cd "$(dirname "$0")"
python3 -m http.server $PORT &
HTTP_PID=$!
sleep 2

echo "✅ Server HTTP berjalan di http://localhost:$PORT"
echo

# Buka browser untuk game
echo "Membuka browser untuk game..."
if command -v google-chrome &> /dev/null; then
  google-chrome --new-window --window-size=800,600 http://localhost:$PORT &
elif command -v chromium-browser &> /dev/null; then
  chromium-browser --new-window --window-size=800,600 http://localhost:$PORT &
else
  echo "❌ Google Chrome atau Chromium tidak ditemukan."
  echo "Silakan buka browser secara manual dan arahkan ke http://localhost:$PORT"
fi

echo
echo "=== Petunjuk Pengaturan OBS Studio ==="
echo "1. Buka OBS Studio"
echo "2. Tambahkan sumber 'Window Capture' dan pilih jendela browser game"
echo "3. Atur pengaturan streaming:"
echo "   - Buka Settings > Stream"
echo "   - Pilih 'Custom...' sebagai Service"
echo "   - Server: $STREAM_URL"
echo "   - Stream Key: $STREAM_KEY"
echo "4. Klik 'Start Streaming' untuk memulai streaming"
echo
echo "Tekan Enter untuk membuka OBS Studio..."
read dummy

# Buka OBS Studio
if command -v obs &> /dev/null; then
  obs &
  echo "✅ OBS Studio telah dibuka"
else
  echo "❌ OBS Studio tidak ditemukan. Pastikan Anda telah menginstalnya."
  echo "Anda dapat menginstalnya dengan perintah: sudo apt-get install obs-studio"
fi

echo
echo "Untuk menghentikan server HTTP, tekan Ctrl+C"
echo "Streaming akan terus berjalan melalui OBS Studio."
echo

# Tunggu hingga user menekan Ctrl+C
trap "echo 'Menghentikan server HTTP...'; kill $HTTP_PID; echo '✅ Selesai.'; exit 0" INT
while true; do
  sleep 1
done 