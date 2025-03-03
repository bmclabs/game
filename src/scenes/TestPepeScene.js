class TestPepeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TestPepeScene' });
    this.pepe = null;
    this.dummy = null;
  }

  preload() {
    // Use a different key for this scene to avoid conflicts
    this.load.image('pepe_test_sheet', 'assets/fighters/sprites/pepe/PEPE.png');
    this.load.atlas('pepe_atlas', 
      'assets/fighters/sprites/pepe/PEPE.png', 
      'assets/fighters/sprites/pepe/PEPE.json'
    );
    
    // Load button assets
    this.load.image('button', 'assets/ui/button.png');
  }

  create() {
    // Add background
    this.add.rectangle(400, 300, 800, 600, 0x333333);
    
    // Create Pepe fighter
    const pepeStats = CHARACTERS.find(char => char.name === 'Pepe');
    this.pepe = new Pepe(this, 300, 400, pepeStats, true);
    
    // Create dummy target
    const dummyStats = CHARACTERS.find(char => char.name === 'Doge');
    this.dummy = new Fighter(this, 500, 400, dummyStats, false);
    
    // Set target for Pepe
    this.pepe.target = this.dummy;
    
    // Add control buttons
    this.createButtons();
    
    // Add title
    this.add.text(400, 50, 'PEPE TEST SCENE', {
      fontSize: '32px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Add instructions
    this.add.text(400, 100, 'Click buttons to test Pepe animations', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Tambahkan di method create(), setelah attack button
    const kickButton = this.add.text(650, 500, 'KICK', {
      fontSize: '24px',
      fill: '#ff9900',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive();

    kickButton.on('pointerdown', () => {
      if (this.pepe) {
        this.pepe.kick(this.dummy);
      }
    });

    // Tambahkan ke UI container jika ada
    if (this.uiContainer) {
      this.uiContainer.add(kickButton);
    }

    // Add defense button
    const defenseButton = this.add.text(650, 550, 'DEFENSE', {
      fontSize: '24px',
      fill: '#00ffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive();

    defenseButton.on('pointerdown', () => {
      if (this.pepe) {
        this.pepe.defend(true);
      }
    });

    defenseButton.on('pointerup', () => {
      if (this.pepe) {
        this.pepe.defend(false);
      }
    });

    // Add to UI container if exists
    if (this.uiContainer) {
      this.uiContainer.add(defenseButton);
    }
  }
  
  createButtons() {
    // Create button for basic attack
    const attackButton = this.add.image(150, 200, 'button').setInteractive();
    this.add.text(150, 200, 'Attack', { fontSize: '16px' }).setOrigin(0.5);
    
    attackButton.on('pointerdown', () => {
      if (this.pepe && this.dummy) {
        const result = this.pepe.attack(this.dummy);
        if (result) {
          // Gain mana from successful attack, matching BattleScene behavior
          this.pepe.gainMana(15);
          this.pepe.updateBars();
        }
      }
    });
    
    // Create button for Skill 1
    const skill1Button = this.add.image(150, 250, 'button').setInteractive();
    this.add.text(150, 250, 'Skill 1', { fontSize: '16px' }).setOrigin(0.5);
    
    skill1Button.on('pointerdown', () => {
      this.pepe.useSpecialSkill(1);
    });
    
    // Create button for Skill 2 (Ulti)
    const skill2Button = this.add.image(150, 300, 'button').setInteractive();
    this.add.text(150, 300, 'Ulti', { fontSize: '16px' }).setOrigin(0.5);
    
    skill2Button.on('pointerdown', () => {
      this.pepe.useSpecialSkill(2);
    });
    
    // Create button for Hit animation
    const hitButton = this.add.image(150, 350, 'button').setInteractive();
    this.add.text(150, 350, 'Take Hit', { fontSize: '16px' }).setOrigin(0.5);
    
    hitButton.on('pointerdown', () => {
      this.pepe.takeDamage(10);
    });
    
    // Create button to return to main menu
    const backButton = this.add.image(150, 500, 'button').setInteractive();
    this.add.text(150, 500, 'Back', { fontSize: '16px' }).setOrigin(0.5);
    
    backButton.on('pointerdown', () => {
      this.scene.start('PreparationScene');
    });

    // Win button
    const winButton = this.add.image(150, 400, 'button').setInteractive();
    this.add.text(150, 400, 'Win', { fontSize: '16px' }).setOrigin(0.5);

    winButton.on('pointerdown', () => {
      this.pepe.sprite.play('pepe_win');
      this.pepe.sprite.once('animationcomplete', () => {
        this.pepe.sprite.play('pepe_idle');
      });
    });

    // KO/Lose button
    const loseButton = this.add.image(150, 450, 'button').setInteractive();
    this.add.text(150, 450, 'KO', { fontSize: '16px' }).setOrigin(0.5);

    loseButton.on('pointerdown', () => {
      this.pepe.sprite.play('pepe_death');
    });

    // Dramatic Portrait button
    const dramaticButton = this.add.image(300, 400, 'button').setInteractive();
    this.add.text(300, 400, 'Dramatic', { fontSize: '16px' }).setOrigin(0.5);

    dramaticButton.on('pointerdown', () => {
      // Create dramatic effect sprite
      const effect = this.add.sprite(400, 300, 'pepe_atlas');
      effect.setScale(2);
      effect.play('pepe_dramatic');
      
      // Add screen flash
      this.cameras.main.flash(500, 255, 255, 255, true);
      
      // Cleanup after animation
      effect.once('animationcomplete', () => {
        effect.destroy();
      });
    });
  }
} 