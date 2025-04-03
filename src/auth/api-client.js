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
    
    // Add this function to help with debugging
    _logApiCall(endpoint, method, payload, headers) {
        console.log(`API Call: ${method} ${endpoint}`);
        console.log('Payload:', payload);
        console.log('Headers:', {
            ...headers,
            'Authorization': headers['Authorization'] ? 'Bearer ***' : undefined,
            'X-Signature': headers['X-Signature'] ? '***' : undefined
        });
    }
    
    // Update game mode (preparation or battle)
    async updateGameMode(mode) {
        try {
            // Get current match ID if not provided
            const matchId = this._getCurrentMatchId();
            
            const payload = { 
                matchId,
                mode,
            };
            
            const timestamp = Date.now().toString();
            const requestId = this._generateRequestId();
            const signature = await this._signRequest(payload, timestamp, requestId);
            
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.get('gameSessionToken')}`,
                'X-Timestamp': timestamp,
                'X-Request-ID': requestId,
                'X-Signature': signature
            };
            
            const endpoint = `${this.baseUrl}${API_CONFIG.endpoints.gameMode}`;
            this._logApiCall(endpoint, 'POST', payload, headers);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
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
    async sendNextMatchFighters(fighter1, fighter2, providedMatchId = null) {
        try {
            // Use provided matchId or generate a new one
            const matchId = providedMatchId || this._generateMatchId();
            
            // Create payload with matchId only if fighters are null
            const payload = { matchId };
            
            // Add fighters to payload if provided
            if (fighter1 && fighter2) {
                payload.fighter1 = fighter1.name;
                payload.fighter2 = fighter2.name;
            }
            
            const timestamp = Date.now().toString();
            const requestId = this._generateRequestId();
            const signature = await this._signRequest(payload, timestamp, requestId);
            
            console.log('Sending next match fighters with payload:', payload);
            
            const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.nextMatch}`, {
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
            
            const responseData = await response.json();
            
            // Store the fighter stats received from the backend
            if (fighter1 && fighter2 && responseData.fighter1Stats && responseData.fighter2Stats) {
                // Update fighter stats with the ones from the backend
                Object.assign(fighter1, responseData.fighter1Stats);
                Object.assign(fighter2, responseData.fighter2Stats);
                
                console.log('Updated fighter stats from backend:', {
                    fighter1: fighter1.name,
                    fighter1Stats: responseData.fighter1Stats,
                    fighter2: fighter2.name,
                    fighter2Stats: responseData.fighter2Stats
                });
            }
            
            // Save the used matchId
            session.set('currentMatchId', matchId);
            
            return responseData;
        } catch (error) {
            console.error('Error sending next match fighters:', error);
            throw error;
        }
    }
    
    // Send match result (after battle mode)
    async sendMatchResult(winner, isKO = false) {
        try {
            const matchId = this._getCurrentMatchId();
            
            const payload = {
                matchId,
                winner: winner.name,
                isKO,
            };
            
            const timestamp = Date.now().toString();
            const requestId = this._generateRequestId();
            const signature = await this._signRequest(payload, timestamp, requestId);
            
            const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.matchResult}`, {
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