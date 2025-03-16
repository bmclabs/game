const config = {
    type: Phaser.AUTO,
    parent: 'renderDiv',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        PreparationScene,
        BattleScene,
        TestFighterScene,
        TestPepeScene,
        TestTrumpScene,
        TestDogeScene,
        TestShibaScene,
        TestPenguScene,
        TestBrettScene
    ]
};

// Initialize the game when the window loads
window.addEventListener('load', () => {
    try {
        console.log('Game initialization started');
        
        // Check for authentication token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const gameAuthKeyFromUrl = urlParams.get('gameAuthKey');
        
        // If token exists in URL, store it in session
        if (tokenFromUrl) {
            console.log('Token found in URL, storing in session');
            session.set('gameSessionToken', tokenFromUrl);
            
            // Extract game auth key if present
            if (gameAuthKeyFromUrl) {
                console.log('Game auth key found in URL, storing in session');
                session.set('gameAuthKey', gameAuthKeyFromUrl);
            }
        }
        
        // Check if we're authenticated (either from URL or previous session)
        const gameSessionToken = session.get('gameSessionToken');
        const gameAuthKey = session.get('gameAuthKey');
        
        // Log authentication status
        console.log('Authentication check:');
        console.log('- Game session token:', gameSessionToken ? 'Present' : 'Missing');
        console.log('- Game auth key:', gameAuthKey ? 'Present' : 'Missing');
        
        // Only redirect if we don't have a token at all
        if (!gameSessionToken) {
            console.error('No authentication token found, redirecting to auth.html');
            window.location.href = 'auth.html';
            return;
        }
        
        // Check if API_CONFIG is defined
        if (typeof API_CONFIG === 'undefined') {
            console.error('API_CONFIG is not defined');
            return;
        }
        
        // Check if gameApiClient is defined
        if (typeof gameApiClient === 'undefined') {
            console.error('gameApiClient is not defined');
            return;
        }
        
        // Connect to the Socket.IO server
        try {
            console.log('Connecting to Socket.IO server with token:', gameSessionToken.substring(0, 10) + '...');
            socketClient.connect(gameSessionToken)
                .on('connect', () => {
                    console.log('Socket.IO connected successfully');
                })
                .on(API_CONFIG.events.fighterStats, (data) => {
                    console.log('Received fighter stats update:', data);
                    // Update fighter stats if they match the current fighters
                    if (data.fighter1 && data.fighter2) {
                        const currentScene = game.scene.getScenes(true)[0];
                        if (currentScene) {
                            let statsUpdated = false;
                            
                            if (currentScene.fighter1Stats && 
                                currentScene.fighter1Stats.name === data.fighter1.name) {
                                Object.assign(currentScene.fighter1Stats, data.fighter1Stats);
                                statsUpdated = true;
                            }
                            if (currentScene.fighter2Stats && 
                                currentScene.fighter2Stats.name === data.fighter2.name) {
                                Object.assign(currentScene.fighter2Stats, data.fighter2Stats);
                                statsUpdated = true;
                            }
                            
                            // If stats are updated and the scene is PreparationScene, call updateFighterStats
                            if (statsUpdated && currentScene.scene.key === 'PreparationScene' && 
                                typeof currentScene.updateFighterStats === 'function') {
                                console.log('Calling updateFighterStats in PreparationScene');
                                currentScene.updateFighterStats();
                            }
                        }
                    }
                })
                .on(API_CONFIG.events.modeChange, (data) => {
                    console.log('Received game mode change:', data);
                    // Handle mode change if needed
                    if (data.mode === API_CONFIG.modes.battle && game.scene.isActive('PreparationScene')) {
                        const prepScene = game.scene.getScene('PreparationScene');
                        prepScene.startBattle();
                    } else if (data.mode === API_CONFIG.modes.preparation && game.scene.isActive('BattleScene')) {
                        const battleScene = game.scene.getScene('BattleScene');
                        battleScene.endRound(null, false);
                    }
                })
                .on(API_CONFIG.events.matchResult, (data) => {
                    console.log('Received match result:', data);
                    // Handle match result if needed
                    if (game.scene.isActive('BattleScene')) {
                        const battleScene = game.scene.getScene('BattleScene');
                        // Find the winner fighter
                        let winner = null;
                        if (battleScene.fighter1Stats && battleScene.fighter1Stats.name === data.winner) {
                            winner = battleScene.fighter1;
                        } else if (battleScene.fighter2Stats && battleScene.fighter2Stats.name === data.winner) {
                            winner = battleScene.fighter2;
                        }
                        
                        if (winner) {
                            battleScene.endRound(winner, data.isKO);
                        }
                    }
                });
        } catch (error) {
            console.error('Error connecting to Socket.IO server:', error);
        }
        
        // // Check if CHARACTERS is defined
        // if (typeof CHARACTERS === 'undefined' || !Array.isArray(CHARACTERS) || CHARACTERS.length < 2) {
        //     console.error('CHARACTERS is not defined or has less than 2 fighters');
        //     return;
        // }
        
        // // Log available fighters
        // console.log('Available fighters:', CHARACTERS.map(c => c.name));
        
        // // Select initial random fighters
        // const availableFighters = [...CHARACTERS];
        
        // // Make sure we have at least two fighters
        // if (availableFighters.length < 2) {
        //     console.error('Not enough fighters available');
        //     return;
        // }
        
        // // Select random fighters
        // const fighter1Index = Math.floor(Math.random() * availableFighters.length);
        // const fighter1 = availableFighters[fighter1Index];
        
        // // Remove the first fighter from the array
        // availableFighters.splice(fighter1Index, 1);
        
        // // Select second fighter
        // const fighter2Index = Math.floor(Math.random() * availableFighters.length);
        // const fighter2 = availableFighters[fighter2Index];
        
        // console.log('Selected fighters:', fighter1.name, 'vs', fighter2.name);

        // Create the game instance
        console.log('Creating game instance');
        const game = new Phaser.Game(config);

        // game.scene.start('PreparationScene', {
        //     roundNumber: 1,
        //     fighter1Stats: fighter1,
        //     fighter2Stats: fighter2,
        //     arenaNumber: Math.floor(Math.random() * 6) + 1
        // });

        game.scene.start('PreparationScene')

        // try {
        //     // Generate a unique match ID for this game session
        //     const matchId = gameApiClient._generateMatchId();
        //     console.log('Generated match ID:', matchId);

        //     // Langsung kirim fighter untuk next match dengan status preparation
        //     console.log('Sending initial fighters to backend with preparation status');
        //     gameApiClient.sendNextMatchFighters(fighter1, fighter2, matchId, 'preparation')
        //         .then((response) => {
        //             console.log('Initial fighters sent to backend:', response);
                    
        //             // Start with the preparation scene
        //             console.log('Starting preparation scene');
        //             game.scene.start('PreparationScene', {
        //                 roundNumber: 1,
        //                 fighter1Stats: fighter1,
        //                 fighter2Stats: fighter2,
        //                 arenaNumber: Math.floor(Math.random() * 6) + 1
        //             });
        //         })
        //         .catch(error => {
        //             console.error('Error initializing game with backend:', error);
                    
        //             // Start the game anyway, even if backend communication fails
        //             console.log('Starting game without backend communication');
        //             game.scene.start('PreparationScene', {
        //                 roundNumber: 1,
        //                 fighter1Stats: fighter1,
        //                 fighter2Stats: fighter2,
        //                 arenaNumber: Math.floor(Math.random() * 6) + 1
        //             });
        //         });
        // } catch (error) {
        //     console.error('Error with backend communication:', error);
            
        //     // Start the game anyway, even if backend communication fails
        //     console.log('Starting game without backend communication');
        //     game.scene.start('PreparationScene', {
        //         roundNumber: 1,
        //         fighter1Stats: fighter1,
        //         fighter2Stats: fighter2,
        //         arenaNumber: Math.floor(Math.random() * 6) + 1
        //     });
        // }
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}); 