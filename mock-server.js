// Mock Server untuk Battle Memecoin Club Game
// Server ini menyediakan endpoint API yang diperlukan untuk pengembangan lokal

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');

// Inisialisasi Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi
const PORT = process.env.PORT || 3080;
const GAME_AUTH_KEY = 'game_auth_key_for_testing_123456789';

// Database sementara
const users = {
  'developer': {
    id: 'user_1',
    password: crypto.createHash('sha256').update('password123').digest('hex')
  }
};

const sessions = {};
const gameSessionTokens = {};

// Fungsi helper
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function verifyHmacSignature(message, signature, key) {
  const expectedSignature = crypto.createHmac('sha256', key)
    .update(message)
    .digest('hex');
  return expectedSignature === signature;
}

// Middleware untuk autentikasi
function authenticateGameSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  if (!gameSessionTokens[token]) {
    return res.status(401).json({ error: 'Invalid game session token' });
  }

  req.gameSession = gameSessionTokens[token];
  next();
}

// Endpoint API

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  const user = users[username];
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // Hash password yang diterima sebelum membandingkan
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  if (user.password !== hashedPassword) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  const token = generateToken();
  sessions[token] = { userId: user.id, username };
  
  res.json({ token, userId: user.id });
});

// Verifikasi game auth key
app.post('/api/auth/verify-game-key', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!sessions[token]) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const { gameAuthKey, timestamp, signature } = req.body;
  
  if (!gameAuthKey || !timestamp || !signature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (gameAuthKey !== GAME_AUTH_KEY) {
    return res.status(401).json({ error: 'Invalid game auth key' });
  }
  
  const message = `${timestamp}:${gameAuthKey}`;
  if (!verifyHmacSignature(message, signature, gameAuthKey)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const gameSessionToken = generateToken();
  gameSessionTokens[gameSessionToken] = {
    userId: sessions[token].userId,
    username: sessions[token].username,
    gameAuthKey
  };
  
  res.json({ gameSessionToken });
});

// Update game mode
app.post('/api/game/mode', authenticateGameSession, (req, res) => {
  const { matchId, mode, timestamp } = req.body;
  const { 'x-timestamp': headerTimestamp, 'x-request-id': requestId, 'x-signature': signature } = req.headers;
  
  if (!matchId || !mode || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!headerTimestamp || !requestId || !signature) {
    return res.status(400).json({ error: 'Missing required headers' });
  }
  
  const message = `${headerTimestamp}:${requestId}:${JSON.stringify(req.body)}`;
  if (!verifyHmacSignature(message, signature, req.gameSession.gameAuthKey)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Emit event ke semua client
  io.emit('game:mode_change', {
    mode,
    matchId,
    timestamp: Date.now()
  });
  
  res.json({ success: true });
});

// Send next match fighters
app.post('/api/game/next-match', authenticateGameSession, (req, res) => {
  const { fighter1, fighter2, matchId, timestamp } = req.body;
  const { 'x-timestamp': headerTimestamp, 'x-request-id': requestId, 'x-signature': signature } = req.headers;
  
  if (!fighter1 || !fighter2 || !matchId || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!headerTimestamp || !requestId || !signature) {
    return res.status(400).json({ error: 'Missing required headers' });
  }
  
  const message = `${headerTimestamp}:${requestId}:${JSON.stringify(req.body)}`;
  if (!verifyHmacSignature(message, signature, req.gameSession.gameAuthKey)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Generate random fighter stats
  const fighter1Stats = generateFighterStats(fighter1);
  const fighter2Stats = generateFighterStats(fighter2);
  
  // Emit event ke semua client
  io.emit('game:fighter_stats', {
    fighter1: {
      name: fighter1,
      ...fighter1Stats
    },
    fighter2: {
      name: fighter2,
      ...fighter2Stats
    },
    matchId,
    timestamp: Date.now()
  });
  
  res.json({
    fighter1Stats: {
      name: fighter1,
      ...fighter1Stats
    },
    fighter2Stats: {
      name: fighter2,
      ...fighter2Stats
    }
  });
});

// Send match result
app.post('/api/game/match-result', authenticateGameSession, (req, res) => {
  const { matchId, winner, isKO, timestamp } = req.body;
  const { 'x-timestamp': headerTimestamp, 'x-request-id': requestId, 'x-signature': signature } = req.headers;
  
  if (!matchId || !winner || timestamp === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!headerTimestamp || !requestId || !signature) {
    return res.status(400).json({ error: 'Missing required headers' });
  }
  
  const message = `${headerTimestamp}:${requestId}:${JSON.stringify(req.body)}`;
  if (!verifyHmacSignature(message, signature, req.gameSession.gameAuthKey)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Emit event ke semua client
  io.emit('game:match_result', {
    matchId,
    winner,
    isKO,
    timestamp: Date.now()
  });
  
  res.json({ success: true });
});

// Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token || !gameSessionTokens[token]) {
    return next(new Error('Authentication error'));
  }
  
  socket.gameSession = gameSessionTokens[token];
  next();
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Fungsi helper untuk generate fighter stats
function generateFighterStats(name) {
  return {
    hp: Math.floor(Math.random() * 100) + 200,
    maxHp: Math.floor(Math.random() * 100) + 200,
    mana: 0,
    maxMana: Math.floor(Math.random() * 50) + 100,
    baseAttack: Math.floor(Math.random() * 10) + 10,
    critical: Math.floor(Math.random() * 10) + 10,
    defend: Math.floor(Math.random() * 5) + 5,
    kickProbability: Math.floor(Math.random() * 20) + 10,
    specialSkill1Cost: Math.floor(Math.random() * 20) + 20,
    specialSkill2Cost: Math.floor(Math.random() * 30) + 40,
    aggressiveness: Math.floor(Math.random() * 50) + 30,
    defensiveness: Math.floor(Math.random() * 50) + 30,
    jumpiness: Math.floor(Math.random() * 50) + 30
  };
}

// Start server
server.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/verify-game-key');
  console.log('  POST /api/game/mode');
  console.log('  POST /api/game/next-match');
  console.log('  POST /api/game/match-result');
  console.log('Socket.IO events:');
  console.log('  game:mode_change');
  console.log('  game:fighter_stats');
  console.log('  game:match_result');
}); 