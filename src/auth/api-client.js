// Game API Client for Battle Memecoin Club
// This module handles all API communication with the backend

// Import session from auth.js (if needed)
// const { session } = require('./auth.js');

class GameApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    // Helper method to get authorization headers
    _getAuthHeaders() {
        const gameSessionToken = session.get('gameSessionToken');
        const gameAuthKey = session.get('gameAuthKey');
        
        if (!gameSessionToken || !gameAuthKey) {
            throw new Error('Not authenticated');
        }
        
        // Current timestamp for request freshness
        const timestamp = Date.now().toString();
        const requestId = this._generateRequestId();
        
        // Create headers for this request
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${gameSessionToken}`,
            'X-Timestamp': timestamp,
            'X-Request-ID': requestId
        };
    }
    
    // Generate a unique request ID
    _generateRequestId() {
        return 'req_' + Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    // Sign the request payload
    async _signRequest(payload, timestamp, requestId) {
        const gameAuthKey = session.get('gameAuthKey');
        if (!gameAuthKey) {
            throw new Error('No game auth key available');
        }
        
        // Create a string representation of the payload
        const payloadStr = JSON.stringify(payload);
        
        // Generate HMAC signature - updated to match backend expectation
        const message = `${timestamp}:${requestId}:${payloadStr}`;
        return await generateHMAC(message, gameAuthKey);
    }
    
    // Update game mode (preparation or battle)
    async updateGameMode(mode) {
        try {
            const payload = { mode };
            const timestamp = Date.now().toString();
            const requestId = this._generateRequestId();
            const signature = await this._signRequest(payload, timestamp, requestId);
            
            const response = await fetch(`${this.baseUrl}/game/mode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.get('gameSessionToken')}`,
                    'X-Timestamp': timestamp,
                    'X-Request-ID': requestId,
                    'X-Signature': signature
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to update game mode: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating game mode:', error);
            throw error;
        }
    }
    
    // Send fighters for next match (during preparation mode)
    async sendNextMatchFighters(fighter1, fighter2) {
        try {
            const matchId = this._generateMatchId();
            const payload = {
                fighter1: fighter1.name,
                fighter2: fighter2.name,
                matchId
            };
            
            const timestamp = Date.now().toString();
            const requestId = this._generateRequestId();
            const signature = await this._signRequest(payload, timestamp, requestId);
            
            const response = await fetch(`${this.baseUrl}/game/next-match`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.get('gameSessionToken')}`,
                    'X-Timestamp': timestamp,
                    'X-Request-ID': requestId,
                    'X-Signature': signature
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to send next match fighters: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error sending next match fighters:', error);
            throw error;
        }
    }
    
    // Send match result (after battle mode)
    async sendMatchResult(winner, loser, isKO = false) {
        try {
            const payload = {
                winner: winner.name,
                loser: loser.name,
                isKO,
                matchId: this._getCurrentMatchId(),
                timestamp: Date.now()
            };
            
            const timestamp = Date.now().toString();
            const requestId = this._generateRequestId();
            const signature = await this._signRequest(payload, timestamp, requestId);
            
            const response = await fetch(`${this.baseUrl}/game/match-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.get('gameSessionToken')}`,
                    'X-Timestamp': timestamp,
                    'X-Request-ID': requestId,
                    'X-Signature': signature
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to send match result: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error sending match result:', error);
            throw error;
        }
    }
    
    // Generate a unique match ID
    _generateMatchId() {
        const matchId = 'match_' + Date.now() + '_' + 
                       Math.random().toString(36).substring(2, 10);
        
        // Store the current match ID
        session.set('currentMatchId', matchId);
        
        return matchId;
    }
    
    // Get the current match ID
    _getCurrentMatchId() {
        return session.get('currentMatchId') || this._generateMatchId();
    }
}

// Create and export the API client instance
const gameApiClient = new GameApiClient(AUTH_API_URL);

// Export for use in other modules
// module.exports = { gameApiClient }; 