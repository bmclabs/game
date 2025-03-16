// API Configuration for Battle Memecoin Club
// This file contains configuration for API endpoints and Socket.IO

const API_CONFIG = {
  // Base URL for API endpoints
  // Catatan: Ganti dengan URL backend yang sebenarnya saat deployment
  baseUrl: 'http://localhost:3080',
  
  // API endpoints
  endpoints: {
    login: '/api/auth/login',
    verifyGameKey: '/api/auth/verify-game-key',
    gameMode: '/api/game/mode',
    nextMatch: '/api/game/next-match',
    matchResult: '/api/game/match-result'
  },
  
  // Socket.IO configuration
  socket: {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  },
  
  // Socket.IO events
  events: {
    modeChange: 'game:mode_change',
    fighterStats: 'game:fighter_stats',
    matchResult: 'game:match_result'
  },
  
  // Game modes
  modes: {
    preparation: 'preparation',
    battle: 'battle',
    completed: 'completed'
  },
  
  // Request configuration
  request: {
    timeout: 10000, // 10 seconds
    retries: 3
  }
};

// For local development, override with localhost
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  API_CONFIG.baseUrl = 'http://localhost:3080';
}

// Export the configuration
// module.exports = API_CONFIG; 