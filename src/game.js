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
    scene: [PreparationScene, BattleScene]
};

// Initialize the game when the window loads
window.addEventListener('load', () => {
    // Select initial random fighters
    const availableFighters = [...CHARACTERS];
    const fighter1 = availableFighters.splice(Math.floor(Math.random() * availableFighters.length), 1)[0];
    const fighter2 = availableFighters[Math.floor(Math.random() * availableFighters.length)];

    // Create the game instance
    const game = new Phaser.Game(config);

    // Start with the preparation scene
    game.scene.start('PreparationScene', {
        roundNumber: 1,
        fighter1Stats: fighter1,
        fighter2Stats: fighter2
    });
}); 