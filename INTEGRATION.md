# Integrasi Backend Battle Memecoin Club

Dokumen ini menjelaskan detail teknis integrasi antara game Battle Memecoin Club dengan backend.

## Konfigurasi Backend

Secara default, game ini dikonfigurasi untuk terhubung ke backend lokal di `http://localhost:3080`. Konfigurasi ini dapat diubah di file `src/config/api-config.js`.

```javascript
const API_CONFIG = {
  // Base URL for API endpoints
  baseUrl: 'http://localhost:3080',
  
  // API endpoints
  endpoints: {
    login: '/api/auth/login',
    verifyGameKey: '/api/auth/verify-game-key',
    gameMode: '/api/game/mode',
    nextMatch: '/api/game/next-match',
    matchResult: '/api/game/match-result'
  },
  // ...
};
```

## Autentikasi

Proses autentikasi terdiri dari dua langkah:

1. **Login dengan username dan password**
   ```javascript
   const hashedPassword = await hashData(password);
   const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username, password: hashedPassword })
   });
   const { token } = await loginResponse.json();
   ```

2. **Verifikasi game auth key**
   ```javascript
   const timestamp = Date.now().toString();
   const message = `${timestamp}:${gameAuthKey}`;
   const signature = await generateHMAC(message, gameAuthKey);
   
   const verifyResponse = await fetch(`${baseUrl}/api/auth/verify-game-key`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       gameAuthKey,
       timestamp,
       signature
     })
   });
   
   const { gameSessionToken } = await verifyResponse.json();
   ```

## Socket.IO Connection

Koneksi Socket.IO digunakan untuk menerima update real-time dari backend:

```javascript
const socket = io(baseUrl, {
  auth: { token: gameSessionToken },
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('connect', () => {
  console.log('Connected to backend');
});

socket.on('game:mode_change', (data) => {
  console.log('Game mode changed:', data);
  // Update game state based on mode
});

socket.on('game:fighter_stats', (data) => {
  console.log('Fighter stats received:', data);
  // Update fighter stats in the game
});

socket.on('game:match_result', (data) => {
  console.log('Match result received:', data);
  // Process match result
});
```

## Game Flow API

### 1. Update Game Mode

```javascript
async function updateGameMode(gameSessionToken, matchId, mode) {
  const timestamp = Date.now().toString();
  const payload = { matchId, mode, timestamp: Date.now() };
  const requestId = generateRequestId();
  const message = `${timestamp}:${requestId}:${JSON.stringify(payload)}`;
  const signature = await generateHMAC(message, gameAuthKey);
  
  await fetch(`${baseUrl}/api/game/mode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${gameSessionToken}`,
      'X-Timestamp': timestamp,
      'X-Request-ID': requestId,
      'X-Signature': signature
    },
    body: JSON.stringify(payload)
  });
}
```

### 2. Send Next Match Fighters

```javascript
async function sendNextMatchFighters(gameSessionToken, fighter1, fighter2) {
  const matchId = generateMatchId();
  const payload = {
    fighter1: fighter1.name,
    fighter2: fighter2.name,
    matchId,
    timestamp: Date.now()
  };
  
  const timestamp = Date.now().toString();
  const requestId = generateRequestId();
  const message = `${timestamp}:${requestId}:${JSON.stringify(payload)}`;
  const signature = await generateHMAC(message, gameAuthKey);
  
  const response = await fetch(`${baseUrl}/api/game/next-match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${gameSessionToken}`,
      'X-Timestamp': timestamp,
      'X-Request-ID': requestId,
      'X-Signature': signature
    },
    body: JSON.stringify(payload)
  });
  
  const { fighter1Stats, fighter2Stats } = await response.json();
  return { fighter1Stats, fighter2Stats, matchId };
}
```

### 3. Send Match Result

```javascript
async function sendMatchResult(gameSessionToken, matchId, winner, isKO) {
  const payload = {
    matchId,
    winner: winner.name,
    isKO,
    timestamp: Date.now()
  };
  
  const timestamp = Date.now().toString();
  const requestId = generateRequestId();
  const message = `${timestamp}:${requestId}:${JSON.stringify(payload)}`;
  const signature = await generateHMAC(message, gameAuthKey);
  
  await fetch(`${baseUrl}/api/game/match-result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${gameSessionToken}`,
      'X-Timestamp': timestamp,
      'X-Request-ID': requestId,
      'X-Signature': signature
    },
    body: JSON.stringify(payload)
  });
}
```

## Struktur Data

### Fighter Stats

Backend mengirimkan statistik fighter berdasarkan data pasar cryptocurrency:

```javascript
{
  "fighter1Stats": {
    "name": "DOGE",
    "hp": 280,
    "maxHp": 280,
    "mana": 0,
    "maxMana": 140,
    "baseAttack": 14,
    "critical": 18,
    "defend": 9,
    "kickProbability": 25,
    "specialSkill1Cost": 30,
    "specialSkill2Cost": 50,
    "aggressiveness": 70,
    "defensiveness": 30,
    "jumpiness": 75
  },
  "fighter2Stats": {
    "name": "SHIB",
    "hp": 270,
    "maxHp": 270,
    "mana": 0,
    "maxMana": 150,
    "baseAttack": 15,
    "critical": 15,
    "defend": 10,
    "kickProbability": 20,
    "specialSkill1Cost": 25,
    "specialSkill2Cost": 70,
    "aggressiveness": 60,
    "defensiveness": 40,
    "jumpiness": 50
  }
}
```

### Game Mode

```javascript
{
  "mode": "preparation" | "battle" | "completed",
  "matchId": "match_1620000000000_abc123",
  "timestamp": 1620000000000
}
```

### Match Result

```javascript
{
  "matchId": "match_1620000000000_abc123",
  "winner": "DOGE",
  "isKO": true,
  "timestamp": 1620000000000
}
```

## Rumus Perhitungan Statistik Fighter

Backend menggunakan data dari CoinMarketCap untuk menghitung statistik fighter:

- **Price Change**: `P_change = (P_avg - P_old) / P_old` (dibatasi antara -50% dan +50%)
- **Market Cap Change**: `MC_change = log2(MC_new / MC_old)`
- **Volume Change**: `V_change = log2(V_new / V_old)`

Perubahan ini kemudian diterapkan ke statistik dasar fighter:

```javascript
hp: Math.max(100, fighter.hp * (1 + P_change))
maxMana: Math.max(50, fighter.maxMana * (1 + P_change))
baseAttack: Math.max(5, fighter.baseAttack * (1 + P_change))
critical: Math.max(5, fighter.critical * (1 + P_change))
defend: Math.max(2, fighter.defend * (1 - P_change))
kickProbability: Math.max(5, fighter.kickProbability * (1 + P_change))
specialSkill1Cost: Math.max(20, fighter.specialSkill1Cost * (1 + V_change))
specialSkill2Cost: Math.max(30, fighter.specialSkill2Cost * (1 + V_change))
aggressiveness: Math.max(20, fighter.aggressiveness * (1 + MC_change))
defensiveness: Math.max(20, fighter.defensiveness * (1 - MC_change))
jumpiness: Math.max(20, fighter.jumpiness * (1 + MC_change))
```

## Troubleshooting

### Masalah Autentikasi

- Pastikan username dan password benar
- Pastikan game auth key valid
- Periksa format signature HMAC

### Masalah Socket.IO

- Pastikan gameSessionToken valid
- Periksa koneksi internet
- Pastikan backend server berjalan

### Masalah API

- Periksa format payload
- Pastikan semua header diperlukan disertakan
- Periksa signature HMAC 