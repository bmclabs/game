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
    // Check if we're authenticated
    if (!session.get('gameSessionToken')) {
        console.error('Not authenticated');
        return;
    }
    
    // Log available fighters
    console.log('Available fighters:', CHARACTERS.map(c => c.name));
    
    // Select initial random fighters
    const availableFighters = [...CHARACTERS];
    
    // Make sure we have at least two fighters
    if (availableFighters.length < 2) {
        console.error('Not enough fighters available');
        return;
    }
    
    // Select random fighters
    const fighter1Index = Math.floor(Math.random() * availableFighters.length);
    const fighter1 = availableFighters[fighter1Index];
    
    // Remove the first fighter from the array
    availableFighters.splice(fighter1Index, 1);
    
    // Select second fighter
    const fighter2Index = Math.floor(Math.random() * availableFighters.length);
    const fighter2 = availableFighters[fighter2Index];
    
    console.log('Selected fighters:', fighter1.name, 'vs', fighter2.name);

    // Create the game instance
    const game = new Phaser.Game(config);

    // Set initial game mode to preparation
    gameApiClient.updateGameMode('preparation')
        .then(() => {
            console.log('Game mode set to preparation');
            
            // Send initial fighters to backend
            return gameApiClient.sendNextMatchFighters(fighter1, fighter2);
        })
        .then(() => {
            console.log('Initial fighters sent to backend');
        })
        .catch(error => {
            console.error('Error initializing game:', error);
        });

    // Start with the preparation scene
    game.scene.start('PreparationScene', {
        roundNumber: 1,
        fighter1Stats: fighter1,
        fighter2Stats: fighter2,
        arenaNumber: Math.floor(Math.random() * 6) + 1
    });
}); 