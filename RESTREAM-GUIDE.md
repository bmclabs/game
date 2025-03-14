# Battle Memecoin Club - Panduan Streaming dengan Restream.io

Panduan ini menjelaskan cara menggunakan sistem streaming otomatis untuk Battle Memecoin Club dengan layanan Restream.io.

## Apa itu Restream.io?

Restream.io adalah layanan yang memungkinkan Anda melakukan streaming ke beberapa platform sekaligus (YouTube, Twitch, Facebook, dll.) melalui satu koneksi RTMP. Ini sangat berguna untuk menjangkau audiens yang lebih luas di berbagai platform.

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- Node.js (v14 atau lebih baru)
- FFmpeg
- Xvfb (untuk Linux)
- Google Chrome atau Chromium
- Docker (opsional, untuk pendekatan container)

## Opsi Streaming

Ada beberapa cara untuk menjalankan streaming dengan Restream.io:

### Opsi 1: Menggunakan Docker (Direkomendasikan untuk WSL)

Pendekatan Docker adalah yang paling mudah dan konsisten, terutama jika Anda menggunakan WSL:

1. Pastikan Docker terinstal:
   ```bash
   docker --version
   ```

2. Jalankan script Docker:
   ```bash
   ./docker-run.sh
   ```

Script ini akan:
- Membuat container Docker dengan semua dependensi yang diperlukan
- Mengonfigurasi game untuk mode otomatis
- Memulai streaming ke Restream.io

### Opsi 2: Menggunakan Script Streaming Langsung

Untuk menjalankan streaming tanpa Docker:

1. Di Linux/WSL:
   ```bash
   ./stream.sh
   ```

2. Di Windows:
   ```bash
   windows-stream.bat
   ```

### Opsi 3: Menggunakan Multistream.js

Untuk kontrol lebih lanjut dan kemampuan streaming ke beberapa platform:

```bash
node multistream.js
```

## Konfigurasi Restream.io

Semua script telah dikonfigurasi dengan URL RTMP dan stream key Restream.io Anda:

```
rtmp://live.restream.io/live/re_9333420_event43a04f6991e84d6eb1661fb590e6dab0
```

Jika Anda perlu mengubah stream key:

1. Edit file `docker-run.sh`, `stream.sh`, `windows-stream.bat`, dan `multistream.js`
2. Ganti stream key dengan yang baru dari dashboard Restream.io Anda

## Pengaturan Kualitas Streaming

Pengaturan default untuk streaming:

- Resolusi: 1280x720 (720p)
- Frame rate: 30 fps
- Bitrate video: 4500k
- Preset: ultrafast (untuk latensi rendah)

Anda dapat menyesuaikan pengaturan ini dengan mengedit variabel di script streaming.

## Pemecahan Masalah

### Masalah Umum

1. **Layar Hitam**
   - Pastikan Chrome/Chromium dimulai dengan benar
   - Periksa screenshot di folder `screenshots` untuk memverifikasi rendering game
   - Coba gunakan script `fix-black-screen.sh` untuk memperbaiki masalah rendering

2. **Error Koneksi RTMP**
   - Verifikasi stream key Anda di dashboard Restream.io
   - Pastikan tidak ada firewall yang memblokir koneksi keluar ke port 1935 (RTMP)
   - Periksa log untuk pesan error spesifik

3. **Kualitas Streaming Buruk**
   - Tingkatkan bitrate (misalnya dari 4500k ke 6000k)
   - Kurangi resolusi jika koneksi internet Anda lambat
   - Gunakan preset yang lebih lambat (misalnya 'fast' alih-alih 'ultrafast') jika CPU Anda kuat

4. **Masalah WSL**
   - Jika mengalami masalah izin di WSL, gunakan pendekatan Docker
   - Alternatifnya, gunakan script Windows native (`windows-stream.bat`)

## Melihat Stream Anda

Setelah streaming dimulai:

1. Buka dashboard Restream.io Anda
2. Verifikasi bahwa stream aktif dan berjalan
3. Periksa platform tujuan (YouTube, Twitch, dll.) yang telah Anda konfigurasikan di Restream.io

## Streaming Jangka Panjang

Untuk streaming jangka panjang:

1. Gunakan `screen` atau `tmux` untuk menjalankan script di latar belakang:
   ```bash
   screen -S stream
   ./docker-run.sh
   # Tekan Ctrl+A, D untuk melepaskan screen
   ```

2. Untuk kembali ke sesi:
   ```bash
   screen -r stream
   ```

## Dukungan

Jika Anda mengalami masalah, periksa file log di folder `logs` dan pastikan semua prasyarat telah diinstal dengan benar. 