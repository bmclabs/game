/**
 * Test script for Battle Memecoin Club game authentication
 * 
 * This script tests the authentication flow for the game:
 * 1. Login with username and password
 * 2. Verify game authentication key
 * 3. Send game mode update
 * 4. Send next match fighters
 * 5. Send match result
 */

const crypto = require('crypto');
const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3080/api';
const USERNAME = 'developer';
const PASSWORD = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // SHA-256 hash of 'password'
const GAME_AUTH_KEY = 'game_auth_key_for_testing_123456789';

// Store tokens
let authToken = '';
let gameSessionToken = '';
let userId = '';

// Utility function to hash data using SHA-256
function hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate HMAC for request signing
function generateHMAC(message, key) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(message);
    return hmac.digest('hex');
}

// Generate a unique request ID
function generateRequestId() {
    return 'req_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Generate a unique match ID
function generateMatchId() {
    return 'match_' + Date.now() + '_' + 
           Math.random().toString(36).substring(2, 10);
}

// Login with username and password
async function login() {
    console.log('Testing login...');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: USERNAME,
                password: PASSWORD
            })
        });
        
        if (!response.ok) {
            throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        authToken = data.token;
        userId = data.userId;
        
        console.log('✅ Login successful');
        console.log(`   Auth Token: ${authToken.substring(0, 20)}...`);
        console.log(`   User ID: ${userId}`);
        
        return true;
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        return false;
    }
}

// Verify game authentication key
async function verifyGameKey() {
    console.log('\nTesting game key verification...');
    
    try {
        const timestamp = Date.now().toString();
        const message = `${timestamp}:${GAME_AUTH_KEY}`;
        const signature = generateHMAC(message, GAME_AUTH_KEY);
        
        const response = await fetch(`${API_URL}/auth/verify-game-key`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                gameAuthKey: GAME_AUTH_KEY,
                timestamp,
                signature
            })
        });
        
        if (!response.ok) {
            throw new Error(`Game key verification failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        gameSessionToken = data.gameSessionToken;
        
        console.log('✅ Game key verification successful');
        console.log(`   Game Session Token: ${gameSessionToken.substring(0, 20)}...`);
        
        return true;
    } catch (error) {
        console.error('❌ Game key verification failed:', error.message);
        return false;
    }
}

// Update game mode
async function updateGameMode(mode) {
    console.log(`\nTesting game mode update to "${mode}"...`);
    
    try {
        const payload = { mode };
        const timestamp = Date.now().toString();
        const requestId = generateRequestId();
        const body = JSON.stringify(payload);
        const message = `${timestamp}:${requestId}:${body}`;
        const signature = generateHMAC(message, GAME_AUTH_KEY);
        
        const response = await fetch(`${API_URL}/game/mode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${gameSessionToken}`,
                'X-Timestamp': timestamp,
                'X-Request-ID': requestId,
                'X-Signature': signature
            },
            body
        });
        
        if (!response.ok) {
            throw new Error(`Game mode update failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Game mode update successful');
        console.log(`   Response: ${JSON.stringify(data)}`);
        
        return true;
    } catch (error) {
        console.error('❌ Game mode update failed:', error.message);
        return false;
    }
}

// Send next match fighters
async function sendNextMatchFighters(fighter1, fighter2) {
    console.log(`\nTesting sending next match fighters: ${fighter1} vs ${fighter2}...`);
    
    try {
        const matchId = generateMatchId();
        const payload = { fighter1, fighter2, matchId };
        const timestamp = Date.now().toString();
        const requestId = generateRequestId();
        const body = JSON.stringify(payload);
        const message = `${timestamp}:${requestId}:${body}`;
        const signature = generateHMAC(message, GAME_AUTH_KEY);
        
        const response = await fetch(`${API_URL}/game/next-match`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${gameSessionToken}`,
                'X-Timestamp': timestamp,
                'X-Request-ID': requestId,
                'X-Signature': signature
            },
            body
        });
        
        if (!response.ok) {
            throw new Error(`Sending next match fighters failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Sending next match fighters successful');
        console.log(`   Match ID: ${matchId}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
        
        return { matchId, success: true };
    } catch (error) {
        console.error('❌ Sending next match fighters failed:', error.message);
        return { success: false };
    }
}

// Send match result
async function sendMatchResult(winner, loser, matchId, isKO = false) {
    console.log(`\nTesting sending match result: ${winner} defeats ${loser}${isKO ? ' by KO' : ''}...`);
    
    try {
        const payload = {
            winner,
            loser,
            isKO,
            matchId,
            timestamp: Date.now()
        };
        
        const timestamp = Date.now().toString();
        const requestId = generateRequestId();
        const body = JSON.stringify(payload);
        const message = `${timestamp}:${requestId}:${body}`;
        const signature = generateHMAC(message, GAME_AUTH_KEY);
        
        const response = await fetch(`${API_URL}/game/match-result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${gameSessionToken}`,
                'X-Timestamp': timestamp,
                'X-Request-ID': requestId,
                'X-Signature': signature
            },
            body
        });
        
        if (!response.ok) {
            throw new Error(`Sending match result failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Sending match result successful');
        console.log(`   Response: ${JSON.stringify(data)}`);
        
        return true;
    } catch (error) {
        console.error('❌ Sending match result failed:', error.message);
        return false;
    }
}

// Run the full test flow
async function runTests() {
    console.log('=== BATTLE MEMECOIN CLUB AUTHENTICATION TEST ===\n');
    
    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.error('\n❌ Test flow aborted: Login failed');
        return;
    }
    
    // Step 2: Verify game key
    const verifySuccess = await verifyGameKey();
    if (!verifySuccess) {
        console.error('\n❌ Test flow aborted: Game key verification failed');
        return;
    }
    
    // Step 3: Update game mode to preparation
    const updatePreparationSuccess = await updateGameMode('preparation');
    if (!updatePreparationSuccess) {
        console.error('\n❌ Test flow aborted: Game mode update failed');
        return;
    }
    
    // Step 4: Send next match fighters
    const { matchId, success: sendFightersSuccess } = await sendNextMatchFighters('DOGE', 'SHIB');
    if (!sendFightersSuccess) {
        console.error('\n❌ Test flow aborted: Sending next match fighters failed');
        return;
    }
    
    // Step 5: Update game mode to battle
    const updateBattleSuccess = await updateGameMode('battle');
    if (!updateBattleSuccess) {
        console.error('\n❌ Test flow aborted: Game mode update failed');
        return;
    }
    
    // Step 6: Send match result
    const sendResultSuccess = await sendMatchResult('DOGE', 'SHIB', matchId, true);
    if (!sendResultSuccess) {
        console.error('\n❌ Test flow aborted: Sending match result failed');
        return;
    }
    
    console.log('\n✅ All tests completed successfully!');
}

// Run the tests
runTests().catch(error => {
    console.error('Unhandled error during test:', error);
}); 