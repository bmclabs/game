# Battle Memecoin Club - Game Authentication System

This repository contains a Phaser-based game for Battle Memecoin Club with an authentication system to ensure secure access.

## Authentication System

The game now includes a comprehensive authentication system with the following features:

1. **User Authentication**: Users must log in with a username and password.
2. **Game Authentication Key**: After login, users must provide a game authentication key to verify they are authorized to run the game.
3. **One-Time Token**: The system uses one-time tokens for authentication to prevent token reuse.
4. **Signed Requests (HMAC)**: All API requests are signed using HMAC to verify the authenticity of requests.

## Setup Instructions

1. Clone the repository
2. Configure the backend API URL in `src/auth/auth.js` (default is `http://localhost:3080/api`)
3. Set up the required backend endpoints (see API Endpoints section below)
4. Open `auth.html` in a browser to start the authentication flow

## How It Works

1. Users access `auth.html` and log in with their credentials
2. After successful login, they are prompted to enter a game authentication key
3. The key is verified with the backend, and a one-time token is generated
4. The user is redirected to the game with the token
5. The game uses the token for all subsequent API calls
6. All API requests are signed using HMAC with the game authentication key

## API Endpoints

The following endpoints need to be implemented on the backend:

### 1. Login

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "developer",
  "password": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
}
```

Note: The password should be hashed with SHA-256 before sending to the server.

Response:
```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "u1"
}
```

### 2. Verify Game Authentication Key

```
POST /api/auth/verify-game-key
Content-Type: application/json
Authorization: Bearer {auth_token}

{
  "gameAuthKey": "game_auth_key_for_testing_123456789",
  "timestamp": "1620000000000",
  "signature": "calculated_hmac_signature"
}
```

To calculate the signature:
```javascript
const timestamp = Date.now().toString();
const gameAuthKey = "game_auth_key_for_testing_123456789";
const message = `${timestamp}:${gameAuthKey}`;
const signature = await generateHMAC(message, gameAuthKey);
```

Response:
```
{
  "gameSessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Update Game Mode

```
POST /api/game/mode
Content-Type: application/json
Authorization: Bearer {game_session_token}
X-Timestamp: {timestamp}
X-Request-ID: {request_id}
X-Signature: {signature}

{
  "mode": "preparation"
}
```

To calculate the signature:
```javascript
const timestamp = Date.now().toString();
const requestId = "req_" + Math.random().toString(36).substring(2, 15);
const body = JSON.stringify({ mode: "preparation" });
const message = `${timestamp}:${requestId}:${body}`;
const signature = await generateHMAC(message, gameAuthKey);
```

Response:
```
{
  "success": true
}
```

### 4. Send Next Match Fighters

```
POST /api/game/next-match
Content-Type: application/json
Authorization: Bearer {game_session_token}
X-Timestamp: {timestamp}
X-Request-ID: {request_id}
X-Signature: {signature}

{
  "fighter1": "DOGE",
  "fighter2": "SHIB",
  "matchId": "match_1620000000000_abc123"
}
```

Response:
```
{
  "success": true
}
```

### 5. Send Match Result

```
POST /api/game/match-result
Content-Type: application/json
Authorization: Bearer {game_session_token}
X-Timestamp: {timestamp}
X-Request-ID: {request_id}
X-Signature: {signature}

{
  "winner": "DOGE",
  "loser": "SHIB",
  "isKO": true,
  "matchId": "match_1620000000000_abc123",
  "timestamp": 1620000100000
}
```

Response:
```
{
  "success": true
}
```

## Testing with cURL

### Login

```bash
curl -X POST http://localhost:3080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "developer",
    "password": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
  }'
```

### Verify Game Authentication Key

```bash
curl -X POST http://localhost:3080/api/auth/verify-game-key \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {auth_token}" \
  -d '{
    "gameAuthKey": "game_auth_key_for_testing_123456789",
    "timestamp": "1620000000000",
    "signature": "calculated_hmac_signature"
  }'
```

### Update Game Mode

```bash
curl -X POST http://localhost:3080/api/game/mode \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {game_session_token}" \
  -H "X-Timestamp: 1620000000000" \
  -H "X-Request-ID: req_abc123" \
  -H "X-Signature: calculated_hmac_signature" \
  -d '{
    "mode": "preparation"
  }'
```

## Creating a New User

To create a new user for game access, follow these steps:

### 1. Add User to Database

Execute the following SQL queries:

```sql
-- Add new user
INSERT INTO users (id, wallet_address, username, is_admin, created_at, updated_at)
VALUES (UUID(), 'WALLET_ADDRESS_USER', 'USERNAME', FALSE, NOW(), NOW());

-- Get the user ID
SET @user_id = (SELECT id FROM users WHERE username = 'USERNAME');

-- Add credentials (password must be SHA-256 hashed)
INSERT INTO user_credentials (id, user_id, password_hash, created_at, updated_at)
VALUES (UUID(), @user_id, 'PASSWORD_HASH', NOW(), NOW());

-- Add game authentication key
INSERT INTO game_auth_keys (id, user_id, auth_key, is_active, created_at, updated_at)
VALUES (UUID(), @user_id, 'GAME_AUTH_KEY', TRUE, NOW(), NOW());
```

### 2. Generate Password Hash

Use the following JavaScript code to generate a SHA-256 hash:

```javascript
const crypto = require('crypto');
const password = 'your_password';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log(hash);
```

### 3. Generate Game Authentication Key

Use the following JavaScript code to generate a random key:

```javascript
const crypto = require('crypto');
const gameAuthKey = crypto.randomBytes(32).toString('hex');
console.log(gameAuthKey);
```

## Security Considerations

1. All sensitive data is stored in memory only, not in localStorage or cookies
2. Passwords are hashed before being sent to the server
3. All API requests are signed using HMAC
4. Timestamps are used to prevent replay attacks
5. Request IDs are used to prevent duplicate requests
6. Game authentication keys are never stored in the browser's history or URL

## OBS Integration

When using this game in OBS with a browser source:

1. First authenticate through the normal browser
2. Copy the URL with the token from the browser
3. Use this URL in your OBS browser source
4. The game will automatically authenticate using the token

This ensures that only authorized OBS instances can access the game, preventing conflicts with unauthorized access. 