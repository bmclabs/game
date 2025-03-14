# Battle Memecoin Club - Streaming Guide

Panduan ini menjelaskan cara menggunakan sistem streaming otomatis untuk Battle Memecoin Club.

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- Node.js (v14 atau lebih baru)
- FFmpeg
- Xvfb
- Google Chrome atau Chromium
- Python 3

## Persiapan Cepat

Untuk menyiapkan lingkungan streaming dengan cepat, gunakan script pembantu:

```bash
# Berikan izin eksekusi
chmod +x setup-streaming.sh

# Jalankan script
./setup-streaming.sh
```

Script ini akan:
- Memeriksa semua prasyarat yang diperlukan
- Memperbaiki izin direktori X11
- Membersihkan proses yang mungkin masih berjalan
- Membuat file konfigurasi Twitch jika belum ada
- Menguji Xvfb untuk memastikan berfungsi dengan benar

## Konfigurasi Manual

Jika Anda lebih suka menyiapkan secara manual:

1. **Siapkan Stream Key Twitch**

   Dapatkan stream key Anda dari [Twitch Dashboard](https://dashboard.twitch.tv/settings/stream).

2. **Edit File Konfigurasi**

   Buka file `twitch-config.js` dan masukkan stream key Anda:

   ```javascript
   module.exports = {
     // Your Twitch stream key from https://dashboard.twitch.tv/settings/stream
     STREAM_KEY: 'your-stream-key-here',
     
     // Twitch RTMP server URL (usually don't need to change this)
     RTMP_SERVER: 'rtmp://live.twitch.tv/app',
     
     // Video settings
     VIDEO: {
       WIDTH: 800,
       HEIGHT: 600,
       FRAMERATE: 30,
       BITRATE: '3000k',
       MAXRATE: '3000k',
       BUFSIZE: '6000k'
     },
     
     // Stream settings
     STREAM: {
       RECONNECT_ATTEMPTS: 3,
       RECONNECT_DELAY: 5000, // ms
       MATCH_DURATION: 180000, // 3 minutes
       TIME_BETWEEN_MATCHES: 10000 // 10 seconds
     }
   };
   ```

3. **Perbaiki Izin X11**

   Sebelum menjalankan streaming, perbaiki izin direktori X11:

   ```bash
   sudo chmod 1777 /tmp/.X11-unix
   ```

4. **Sesuaikan Pengaturan (Opsional)**

   Anda dapat menyesuaikan pengaturan video dan streaming sesuai kebutuhan:

   - **VIDEO.BITRATE**: Tingkatkan untuk kualitas video yang lebih baik (misalnya '4000k')
   - **VIDEO.FRAMERATE**: Tingkatkan untuk animasi yang lebih halus (misalnya 60)
   - **STREAM.MATCH_DURATION**: Durasi setiap pertandingan dalam milidetik
   - **STREAM.TIME_BETWEEN_MATCHES**: Waktu antara pertandingan dalam milidetik

## Menjalankan Streaming

### Metode 1: Streaming Otomatis dengan Auto-Match

1. Pastikan Anda berada di direktori proyek:

   ```bash
   cd ~/bmc/repo/game
   ```

2. Jalankan script auto-match:

   ```bash
   node autoMatch.js
   ```

   Script ini akan:
   - Membuat backup dari `game.js`
   - Memodifikasi `game.js` untuk mode otomatis
   - Memulai Xvfb, server HTTP, dan Chrome
   - Menjalankan FFmpeg untuk streaming ke Twitch
   - Menjalankan pertandingan secara otomatis
   - Mencoba menghubungkan kembali jika koneksi terputus

3. Untuk menghentikan streaming, tekan `Ctrl+C`. Script akan secara otomatis:
   - Menghentikan semua proses
   - Mengembalikan `game.js` ke versi asli

### Metode 2: Streaming Manual

Jika Anda ingin menjalankan streaming secara manual:

1. Pastikan Anda berada di direktori proyek:

   ```bash
   cd ~/bmc/repo/game
   ```

2. Jalankan script streaming:

   ```bash
   bash stream.sh
   ```

## Pemecahan Masalah

### Masalah Umum

1. **Error "Connection reset by peer"**

   Ini biasanya terjadi karena masalah koneksi ke server Twitch. Script `autoMatch.js` yang ditingkatkan akan mencoba menghubungkan kembali secara otomatis.

2. **Error Xvfb dan Izin**

   Jika Anda melihat error seperti:
   ```
   _XSERVTransmkdir: Mode of /tmp/.X11-unix should be set to 1777
   _XSERVTransSocketCreateListener: failed to bind listener
   ```

   Jalankan perintah berikut untuk memperbaiki izin:
   ```bash
   sudo chmod 1777 /tmp/.X11-unix
   ```

   Atau gunakan script pembantu:
   ```bash
   ./setup-streaming.sh
   ```

3. **Prompt Sudo Mengganggu Script**

   Jika script meminta password sudo dan mengganggu alur normal:
   
   1. Jalankan perintah sudo secara terpisah terlebih dahulu:
      ```bash
      sudo chmod 1777 /tmp/.X11-unix
      ```
   
   2. Kemudian jalankan script streaming:
      ```bash
      node autoMatch.js
      ```

4. **Bitrate Rendah**

   Jika kualitas video buruk, tingkatkan bitrate di `twitch-config.js`:

   ```javascript
   VIDEO: {
     // ...
     BITRATE: '4000k',
     MAXRATE: '4000k',
     BUFSIZE: '8000k'
   }
   ```

5. **Chrome Crash**

   Jika Chrome crash, script yang diperbarui akan secara otomatis mencoba menggunakan Chromium sebagai alternatif.

6. **Xvfb Gagal Memulai**

   Jika Xvfb gagal memulai pada display default (:99), script yang diperbarui akan mencoba display lain (:100, :101, :102).

## Tips Tambahan

1. **Streaming Jangka Panjang**

   Untuk streaming jangka panjang, gunakan `screen` atau `tmux`:

   ```bash
   screen -S game-stream
   node autoMatch.js
   # Tekan Ctrl+A, D untuk melepaskan screen
   # Untuk kembali: screen -r game-stream
   ```

2. **Menambahkan Audio**

   Untuk menambahkan audio ke stream, edit `stream.sh` dan tambahkan parameter audio ke perintah FFmpeg:

   ```bash
   ffmpeg -f x11grab ... -f alsa -i default -c:a aac -b:a 128k ... -f flv $STREAM_URL
   ```

3. **Meningkatkan Kualitas Visual**

   Untuk meningkatkan kualitas visual, coba pengaturan ini di `twitch-config.js`:

   ```javascript
   VIDEO: {
     WIDTH: 1280,
     HEIGHT: 720,
     FRAMERATE: 60,
     BITRATE: '6000k',
     MAXRATE: '6000k',
     BUFSIZE: '12000k'
   }
   ```

## Dukungan

Jika Anda mengalami masalah, periksa log error dan pastikan semua prasyarat telah diinstal dengan benar. Gunakan script `setup-streaming.sh` untuk memeriksa dan memperbaiki masalah umum. 