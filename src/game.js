const config = {
    type: Phaser.CANVAS,
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
        BattleScene
    ],
    render: {
        transparent: false,
        antialias: false,
        pixelArt: false
    }
};

// Auto-match configuration
const AUTO_MATCH = {
    enabled: true,
    matchCount: 0,
    maxMatches: 100,
    matchDuration: 180000,
    preparationDuration: 30000,
    timeBetweenMatches: 5000
};

// Make game globally accessible
let game;

// Initialize the game when the window loads
window.addEventListener('load', () => {
    console.log('Starting auto-match mode with preparation cycle');
    
    // Create the game instance
    game = new Phaser.Game(config);
    
    // Make game globally accessible
    window.game = game;
    
    // Start with the preparation scene
    setTimeout(() => {
        startPreparationPhase();
        
        // Set up match cycling
        if (AUTO_MATCH.enabled) {
            // This interval will be used to check if we need to move to the next phase
            setInterval(() => {
                // The scenes will handle their own transitions
                console.log('Match cycle check...');
            }, 5000);
        }
    }, 2000); // Wait 2 seconds before starting
});

// Function to start the preparation phase
function startPreparationPhase() {
    console.log('Starting preparation phase...');
    
    // Select random fighters for the next battle
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
    
    console.log('Selected fighters for next battle:', fighter1.name, 'vs', fighter2.name);

    // Start with the preparation scene
    game.scene.start('PreparationScene', {
        roundNumber: AUTO_MATCH.matchCount + 1,
        fighter1Stats: fighter1,
        fighter2Stats: fighter2,
        arenaNumber: Math.floor(Math.random() * 6) + 1,
        autoMode: true,
        preparationDuration: AUTO_MATCH.preparationDuration
    });
    
    // After preparation duration, automatically start battle
    setTimeout(() => {
        startBattlePhase(fighter1, fighter2);
    }, AUTO_MATCH.preparationDuration);
}

// Function to start the battle phase
function startBattlePhase(fighter1, fighter2) {
    console.log('Starting battle phase:', fighter1.name, 'vs', fighter2.name);
    
    // Start the battle scene
    game.scene.start('BattleScene', {
        roundNumber: AUTO_MATCH.matchCount + 1,
        fighter1Stats: fighter1,
        fighter2Stats: fighter2,
        arenaNumber: Math.floor(Math.random() * 6) + 1,
        autoMode: true
    });
    
    // After battle duration, go back to preparation for next match
    setTimeout(() => {
        AUTO_MATCH.matchCount++;
        if (AUTO_MATCH.matchCount < AUTO_MATCH.maxMatches) {
            console.log(`Battle ${AUTO_MATCH.matchCount} completed. Starting next match...`);
            setTimeout(() => {
                startPreparationPhase();
            }, AUTO_MATCH.timeBetweenMatches);
        } else {
            console.log('All matches completed');
        }
    }, AUTO_MATCH.matchDuration);
}

// Force rendering for headless mode
setInterval(() => {
    if (game && game.renderer) {
        // Force a redraw
        game.renderer.resize(800, 600);
        console.log('Forced renderer update');
    }
}, 5000);