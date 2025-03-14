// Authentication and Game Authorization Module
const AUTH_API_URL = 'http://localhost:3080/api'; // Backend API URL

// Utility function to securely hash data using SHA-256
async function hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate HMAC for request signing
async function generateHMAC(message, key) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);
    
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    // Sign the message
    const signature = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageData
    );
    
    // Convert to hex string
    const signatureArray = Array.from(new Uint8Array(signature));
    return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Store session data securely
class SecureSession {
    constructor() {
        this.sessionData = {};
    }
    
    // Set session data (stored in memory only, not in localStorage)
    set(key, value) {
        this.sessionData[key] = value;
    }
    
    // Get session data
    get(key) {
        return this.sessionData[key];
    }
    
    // Clear all session data
    clear() {
        this.sessionData = {};
    }
}

// Create a global session instance
const session = new SecureSession();

// Authentication API client
class AuthClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    // Login with username and password
    async login(username, password) {
        try {
            // Hash the password before sending (additional security layer)
            const hashedPassword = await hashData(password);
            
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password: hashedPassword
                })
            });
            
            if (!response.ok) {
                throw new Error('Login failed');
            }
            
            const data = await response.json();
            
            // Store auth token securely in memory (not in localStorage)
            session.set('authToken', data.token);
            session.set('userId', data.userId);
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    // Verify game authentication key
    async verifyGameAuthKey(gameAuthKey) {
        try {
            const authToken = session.get('authToken');
            
            if (!authToken) {
                throw new Error('Not authenticated');
            }
            
            // Current timestamp for request freshness
            const timestamp = Date.now().toString();
            
            // Create a signature using HMAC - updated to match backend expectation
            const message = `${timestamp}:${gameAuthKey}`;
            const signature = await generateHMAC(message, gameAuthKey);
            
            const response = await fetch(`${this.baseUrl}/auth/verify-game-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    gameAuthKey,
                    timestamp,
                    signature
                })
            });
            
            if (!response.ok) {
                throw new Error('Game authentication failed');
            }
            
            const data = await response.json();
            
            // Store game session token securely
            session.set('gameSessionToken', data.gameSessionToken);
            session.set('gameAuthKey', gameAuthKey);
            
            return data;
        } catch (error) {
            console.error('Game auth error:', error);
            throw error;
        }
    }
}

// Create auth client instance
const authClient = new AuthClient(AUTH_API_URL);

// DOM elements
const loginForm = document.getElementById('login-form');
const authKeyForm = document.getElementById('auth-key-form');
const loginBtn = document.getElementById('login-btn');
const authKeyBtn = document.getElementById('auth-key-btn');
const loginError = document.getElementById('login-error');
const authKeyError = document.getElementById('auth-key-error');

// Handle login form submission
loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!username || !password) {
        loginError.textContent = 'Please enter both username and password';
        loginError.style.display = 'block';
        return;
    }
    
    try {
        // Disable button during login
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        
        // Call login API
        await authClient.login(username, password);
        
        // Hide login form and show auth key form
        loginForm.style.display = 'none';
        authKeyForm.style.display = 'block';
        
        // Reset login form
        loginError.style.display = 'none';
    } catch (error) {
        loginError.textContent = 'Invalid username or password';
        loginError.style.display = 'block';
    } finally {
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// Handle auth key form submission
authKeyBtn.addEventListener('click', async () => {
    const gameAuthKey = document.getElementById('game-auth-key').value;
    
    // Basic validation
    if (!gameAuthKey) {
        authKeyError.textContent = 'Please enter a game authentication key';
        authKeyError.style.display = 'block';
        return;
    }
    
    try {
        // Disable button during verification
        authKeyBtn.disabled = true;
        authKeyBtn.textContent = 'Verifying...';
        
        // Call verify API
        await authClient.verifyGameAuthKey(gameAuthKey);
        
        // Redirect to game with auth token
        window.location.href = `index.html?token=${encodeURIComponent(session.get('gameSessionToken'))}`;
    } catch (error) {
        authKeyError.textContent = 'Invalid game authentication key';
        authKeyError.style.display = 'block';
    } finally {
        // Re-enable button
        authKeyBtn.disabled = false;
        authKeyBtn.textContent = 'Verify & Launch Game';
    }
});

// Check if user is already authenticated (e.g., from a previous session)
// This is just a placeholder - in a real implementation, you would check with the server
// We don't use localStorage for security reasons
window.addEventListener('load', () => {
    // Always start with the login form in this implementation
    loginForm.style.display = 'block';
    authKeyForm.style.display = 'none';
}); 