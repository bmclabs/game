# Battle Memecoin Club Game

Game untuk Battle Memecoin Club yang terintegrasi dengan backend untuk fitur betting dan statistik fighter berdasarkan data pasar cryptocurrency.

## Fitur

- Autentikasi game dengan backend
- Integrasi Socket.IO untuk komunikasi real-time
- Perubahan mode game (preparation, battle, completed)
- Statistik fighter dinamis berdasarkan data CoinMarketCap
- Sistem pertarungan dengan fighter berbasis cryptocurrency
- Integrasi dengan sistem betting

## Instalasi

1. Clone repository
2. Install dependencies:
```
npm install
```
3. Jalankan server lokal:
```
npm start
```
4. Buka browser dan akses `http://localhost:8080`

## Konfigurasi Backend

Secara default, game ini dikonfigurasi untuk terhubung ke backend lokal di `http://localhost:3080`. Untuk mengubah URL backend:

1. Buka file `src/config/api-config.js`
2. Ubah nilai `baseUrl` sesuai dengan URL backend yang digunakan
3. Jika menggunakan URL yang berbeda untuk pengembangan lokal, sesuaikan kondisi override di bagian bawah file

### Menjalankan Backend Lokal

Untuk pengembangan lokal, Anda perlu menjalankan server backend:

1. Clone repository backend dari [https://github.com/battlecoin-club/backend](https://github.com/battlecoin-club/backend)
2. Install dependencies:
```
npm install
```
3. Jalankan server:
```
npm run dev
```

Server backend akan berjalan di `http://localhost:3080`.

### Menggunakan Mock Server

Jika Anda tidak memiliki akses ke repository backend, Anda dapat menggunakan mock server yang disediakan:

1. Install dependencies:
```
npm install express cors socket.io
```
2. Jalankan mock server:
```
npm run mock-server
```

Mock server akan berjalan di `http://localhost:3080` dan menyediakan endpoint API yang diperlukan untuk pengembangan.

## Integrasi Backend

Game ini terintegrasi dengan backend Battle Memecoin Club melalui:

1. **Autentikasi**: Login dan verifikasi game auth key
2. **Socket.IO**: Komunikasi real-time untuk update statistik fighter dan hasil pertandingan
3. **API Endpoints**:
   - `/api/game/mode`: Update mode game (preparation, battle, completed)
   - `/api/game/next-match`: Mengirim fighter untuk pertandingan berikutnya
   - `/api/game/match-result`: Mengirim hasil pertandingan

## Game Flow

1. **Autentikasi**: Game dimulai dengan autentikasi melalui OBS
2. **Preparation Mode**: Pemilihan fighter dan arena
3. **Battle Mode**: Pertarungan antar fighter
4. **Result**: Pengiriman hasil pertandingan ke backend

## Struktur Kode

- `src/auth/`: Modul autentikasi
- `src/socket/`: Implementasi Socket.IO
- `src/utils/`: Fungsi utilitas untuk integrasi
- `src/scenes/`: Scene game (PreparationScene, BattleScene)
- `src/characters/`: Implementasi fighter dan skill

## Testing

Untuk menguji integrasi dengan backend:

```
npm run test-integration
```

Pastikan server backend berjalan di port 3080 sebelum menjalankan test.

## Troubleshooting

### Masalah Koneksi Backend

- **Error ECONNREFUSED**: Server backend tidak berjalan atau tidak dapat diakses
  - Pastikan server backend berjalan di port 3080
  - Periksa apakah ada firewall yang memblokir koneksi
  - Pastikan port yang digunakan tidak digunakan oleh aplikasi lain

- **Error ENOTFOUND**: Host tidak ditemukan
  - Periksa URL backend di `src/config/api-config.js`
  - Pastikan DNS dapat meresolve hostname jika menggunakan domain

### Masalah Autentikasi

- Pastikan username dan password benar
- Pastikan game auth key valid
- Periksa format signature HMAC

## Pengembangan

Untuk pengembangan lebih lanjut, pastikan untuk memperbarui endpoint API dan event Socket.IO sesuai dengan perubahan pada backend. 