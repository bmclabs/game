// Socket.IO Client for Battle Memecoin Club
// This module handles real-time communication with the backend

class SocketClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = {};
  }
  
  // Connect to the Socket.IO server
  connect(gameSessionToken) {
    try {
      console.log('Connecting to Socket.IO server at', this.baseUrl);
      
      // Make sure io is available
      if (typeof io === 'undefined') {
        console.error('Socket.IO client library not loaded');
        throw new Error('Socket.IO client library not loaded');
      }
      
      // Initialize Socket.IO connection with authentication
      this.socket = io(this.baseUrl, {
        auth: {
          token: gameSessionToken
        },
        transports: API_CONFIG.socket.transports,
        reconnection: API_CONFIG.socket.reconnection,
        reconnectionAttempts: API_CONFIG.socket.reconnectionAttempts,
        reconnectionDelay: API_CONFIG.socket.reconnectionDelay
      });
      
      // Set up event listeners
      this.socket.on('connect', () => {
        console.log('Connected to backend Socket.IO server');
        this.isConnected = true;
        this._triggerEvent('connect');
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log(`Disconnected from backend: ${reason}`);
        this.isConnected = false;
        this._triggerEvent('disconnect', reason);
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this._triggerEvent('connect_error', error);
      });
      
      // Game-specific events
      this.socket.on(API_CONFIG.events.modeChange, (data) => {
        console.log('Game mode changed:', data);
        this._triggerEvent(API_CONFIG.events.modeChange, data);
      });
      
      this.socket.on(API_CONFIG.events.fighterStats, (data) => {
        console.log('Fighter stats received:', data);
        this._triggerEvent(API_CONFIG.events.fighterStats, data);
      });
      
      this.socket.on(API_CONFIG.events.matchResult, (data) => {
        console.log('Match result received:', data);
        this._triggerEvent(API_CONFIG.events.matchResult, data);
      });
      
      return this;
    } catch (error) {
      console.error('Error connecting to Socket.IO server:', error);
      throw error;
    }
  }
  
  // Disconnect from the Socket.IO server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Disconnected from Socket.IO server');
    }
  }
  
  // Register an event handler
  on(event, callback) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
    return this;
  }
  
  // Remove an event handler
  off(event, callback) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(cb => cb !== callback);
    }
    return this;
  }
  
  // Trigger an event
  _triggerEvent(event, ...args) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
  
  // Check if connected
  isSocketConnected() {
    return this.isConnected;
  }
}

// Create and export the socket client instance
const socketClient = new SocketClient(API_CONFIG.baseUrl);

// Export for use in other modules
// module.exports = { socketClient }; 