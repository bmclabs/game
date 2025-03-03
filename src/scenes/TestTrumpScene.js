class TestTrumpScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TestTrumpScene' });
    this.trump = null;
    this.dummy = null;
  }

  preload() {
    this.load.image('trump_test_sheet', 'assets/fighters/sprites/trump/TRUMP.png');
    this.load.atlas('trump_atlas', 
      'assets/fighters/sprites/trump/TRUMP.png', 
      'assets/fighters/sprites/trump/TRUMP.json'
    );
  }

  create() {
    // Add background
    this.add.rectangle(400, 300, 800, 600, 0x333333);
    
    // Create Trump fighter
    const trumpStats = CHARACTERS.find(char => char.name === 'Trump');
    this.trump = new Trump(this, 300, 400, trumpStats, true);
    
    // Create dummy target
    const dummyStats = CHARACTERS.find(char => char.name === 'Doge');
    this.dummy = new Fighter(this, 500, 400, dummyStats, false);
    
    // Set target for Trump
    this.trump.target = this.dummy;
    
    // Add control buttons
    this.createButtons();
    
    // Add title
    this.add.text(400, 50, 'TRUMP TEST SCENE', {
      fontSize: '32px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Add instructions
    this.add.text(400, 100, 'Click buttons to test Trump animations', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Add kick button
    const kickButton = this.add.text(650, 500, 'KICK', {
      fontSize: '24px',
      fill: '#ff9900',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive();

    kickButton.on('pointerdown', () => {
      if (this.trump) {
        this.trump.kick(this.dummy);
      }
    });

    // Add defense button
    const defenseButton = this.add.text(650, 550, 'DEFENSE', {
      fontSize: '24px',
      fill: '#00ffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive();

    defenseButton.on('pointerdown', () => {
      if (this.trump) {
        this.trump.defend(true);
      }
    });

    defenseButton.on('pointerup', () => {
      if (this.trump) {
        this.trump.defend(false);
      }
    });

    // Initialize Trump skills
    if (this.trump) {
      this.trump.initializeTrumpSkills();
    }

    // KO button
    const koButton = this.add.image(150, 450, 'button').setInteractive();
    this.add.text(150, 450, 'KO', { fontSize: '16px' }).setOrigin(0.5);

    koButton.on('pointerdown', () => {
      if (this.trump) {
        this.trump.sprite.play('trump_death');
      }
    });
  }
  
  createButtons() {
    // Basic attack button
    const attackButton = this.add.image(150, 200, 'button').setInteractive();
    this.add.text(150, 200, 'Attack', { fontSize: '16px' }).setOrigin(0.5);
    
    attackButton.on('pointerdown', () => {
      if (this.trump && this.dummy) {
        const result = this.trump.attack(this.dummy);
        if (result) {
          this.trump.gainMana(15);
          this.trump.updateBars();
        }
      }
    });
    
    // Skill 1 button
    const skill1Button = this.add.image(150, 250, 'button').setInteractive();
    this.add.text(150, 250, 'Skill 1', { fontSize: '16px' }).setOrigin(0.5);
    
    skill1Button.on('pointerdown', () => {
      if (this.trump) {
        this.trump.useSpecialSkill(1);
      }
    });
    
    // Skill 2 (Ulti) button
    const skill2Button = this.add.image(150, 300, 'button').setInteractive();
    this.add.text(150, 300, 'Ulti', { fontSize: '16px' }).setOrigin(0.5);
    
    skill2Button.on('pointerdown', () => {
      if (this.trump) {
        this.trump.useSpecialSkill(2);
      }
    });
    
    // Hit button
    const hitButton = this.add.image(150, 350, 'button').setInteractive();
    this.add.text(150, 350, 'Take Hit', { fontSize: '16px' }).setOrigin(0.5);
    
    hitButton.on('pointerdown', () => {
      if (this.trump) {
        this.trump.takeDamage(10);
      }
    });
    
    // Win button
    const winButton = this.add.image(150, 400, 'button').setInteractive();
    this.add.text(150, 400, 'Win', { fontSize: '16px' }).setOrigin(0.5);

    winButton.on('pointerdown', () => {
      if (this.trump) {
        this.trump.sprite.play('trump_win');
        this.trump.sprite.once('animationcomplete', () => {
          this.trump.sprite.play('trump_idle');
        });
      }
    });

    // Dramatic button
    // const dramaticButton = this.add.image(150, 450, 'button').setInteractive();
    // this.add.text(150, 450, 'Dramatic', { fontSize: '16px' }).setOrigin(0.5);

    // dramaticButton.on('pointerdown', () => {
    //   if (this.trump) {
    //     this.trump.sprite.play('trump_dramatic');
    //     this.trump.sprite.once('animationcomplete', () => {
    //       this.trump.sprite.play('trump_idle');
    //     });
    //   }
    // });
    
    // Walk Forward button
    const walkButton = this.add.image(300, 450, 'button').setInteractive();
    this.add.text(300, 450, 'Walk', { fontSize: '16px' }).setOrigin(0.5);
    
    walkButton.on('pointerdown', () => {
      if (this.trump) {
        this.trump.sprite.play('trump_walk_forward');
      }
    });

    walkButton.on('pointerup', () => {
      if (this.trump) {
        this.trump.sprite.play('trump_idle');
      }
    });

    // Walk Backward button
    const walkBackButton = this.add.image(300, 500, 'button').setInteractive();
    this.add.text(300, 500, 'Walk Back', { fontSize: '16px' }).setOrigin(0.5);
    
    walkBackButton.on('pointerdown', () => {
      if (this.trump) {
        this.trump.sprite.play('trump_walk_backward');
      }
    });

    walkBackButton.on('pointerup', () => {
      if (this.trump) {
        this.trump.sprite.play('trump_idle');
      }
    });

    // Back button
    const backButton = this.add.image(150, 500, 'button').setInteractive();
    this.add.text(150, 500, 'Back', { fontSize: '16px' }).setOrigin(0.5);
    
    backButton.on('pointerdown', () => {
      this.scene.start('PreparationScene');
    });
  }
} 