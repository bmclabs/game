# Battle Memecoin Club - Installation Guide

This guide will help you set up the Battle Memecoin Club game with the authentication system.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A running backend server with the required API endpoints

## Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd battle-memecoin-club-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the backend API URL:
   - Open `src/auth/auth.js`
   - Update the `AUTH_API_URL` constant with your backend API URL (default is `http://localhost:3080/api`)

4. Start the game:
   ```bash
   npm start
   ```

5. Access the game:
   - Open your browser and navigate to `http://localhost:8080/auth.html`
   - Log in with your credentials
   - Enter your game authentication key
   - The game will start after successful authentication

## Testing the Authentication System

You can test the authentication system using the provided test script:

1. Make sure your backend server is running

2. Update the test configuration if needed:
   - Open `test-game-auth.js`
   - Update the `API_URL`, `USERNAME`, `PASSWORD`, and `GAME_AUTH_KEY` constants

3. Run the test script:
   ```bash
   npm run test-auth
   ```

## Creating a New User

To create a new user for game access, follow these steps:

1. Generate a password hash:
   ```javascript
   const crypto = require('crypto');
   const password = 'your_password';
   const hash = crypto.createHash('sha256').update(password).digest('hex');
   console.log(hash);
   ```

2. Generate a game authentication key:
   ```javascript
   const crypto = require('crypto');
   const gameAuthKey = crypto.randomBytes(32).toString('hex');
   console.log(gameAuthKey);
   ```

3. Add the user to the database using the SQL queries provided in the README.md file

## OBS Integration

When using this game in OBS with a browser source:

1. First authenticate through the normal browser
2. Copy the URL with the token from the browser after successful authentication
3. Use this URL in your OBS browser source
4. The game will automatically authenticate using the token

## Troubleshooting

If you encounter any issues:

1. Check the browser console for error messages
2. Verify that your backend server is running and accessible
3. Ensure that the API endpoints are correctly implemented
4. Check that your user credentials and game authentication key are valid

For more detailed information, refer to the README.md file. 