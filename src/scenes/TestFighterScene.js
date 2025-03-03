class TestFighterScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TestFighterScene' });
    this.fighter = null;
    this.dummy = null;
    this.fighterName = null;
    this.buttons = [];
    this.animationStatus = null;
    this.aiEnabled = false;
  }

  init(data) {
    // Get fighter name from data or use default
    this.fighterName = data.fighterName || 'Pepe';
    console.log(`Initializing TestFighterScene with fighter: ${this.fighterName}`);
  }

  preload() {
    // Load button assets
    try {
      this.load.image('button', 'assets/ui/button.png');
    } catch (error) {
      console.warn('Button image not found, using fallback');
    }
    
    // Preload fighter assets
    const fighterName = this.fighterName.toLowerCase();
    const spritePath = `assets/fighters/sprites/${fighterName}/${fighterName.toUpperCase()}`;
    
    console.log(`Preloading fighter assets from: ${spritePath}`);
    
    this.load.atlas(
      `${fighterName}_atlas`,
      `${spritePath}.png`,
      `${spritePath}.json`
    );
    
    // Create fallback button if needed
    this.load.on('filecomplete', (key) => {
      if (key === 'button') {
        console.log('Button image loaded successfully');
      }
    });
    
    this.load.on('loaderror', (file) => {
      if (file.key === 'button') {
        console.warn('Button image failed to load, creating fallback');
        // We'll create a fallback in the create method
      }
    });
    
    // Try to load sound effects, but don't fail if they don't exist
    try {
      this.load.audio('button_click', 'assets/sounds/effects/button_click.mp3');
    } catch (error) {
      console.warn('Button click sound not found');
    }
    
    // Load dummy fighter assets
    const dummyName = 'trump'; // Use Trump as dummy if testing Pepe, or vice versa
    if (fighterName !== dummyName) {
      const dummyPath = `assets/fighters/sprites/${dummyName}/${dummyName.toUpperCase()}`;
      this.load.atlas(
        `${dummyName}_atlas`,
        `${dummyPath}.png`,
        `${dummyPath}.json`
      );
    }
  }

  create() {
    // Add background
    this.add.rectangle(400, 300, 800, 600, 0x333333);
    
    // Check if button texture loaded
    if (!this.textures.exists('button')) {
      console.log('Creating fallback button texture');
      // Create a graphics object for the button
      const graphics = this.add.graphics();
      graphics.fillStyle(0x444444);
      graphics.fillRoundedRect(0, 0, 200, 50, 10);
      graphics.lineStyle(2, 0xffffff);
      graphics.strokeRoundedRect(0, 0, 200, 50, 10);
      
      // Generate texture from graphics
      graphics.generateTexture('button', 200, 50);
      graphics.destroy();
    }
    
    // Find fighter stats
    const fighterStats = CHARACTERS.find(char => char.name === this.fighterName);
    if (!fighterStats) {
      console.error(`Fighter ${this.fighterName} not found in CHARACTERS`);
      return;
    }
    
    console.log(`Creating fighter: ${this.fighterName}`);
    
    // Create fighter
    this.fighter = FighterFactory.createFighter(this, 300, 400, fighterStats, true);
    
    // Create dummy target (use the other available fighter)
    const dummyName = this.fighterName === 'Pepe' ? 'Trump' : 'Pepe';
    const dummyStats = CHARACTERS.find(char => char.name === dummyName);
    
    if (dummyStats) {
      console.log(`Creating dummy fighter: ${dummyName}`);
      this.dummy = FighterFactory.createFighter(this, 500, 400, dummyStats, false);
    } else {
      // Fallback to a simple dummy
      console.log('Creating fallback dummy fighter');
      this.dummy = new Fighter(this, 500, 400, { name: 'Dummy', hp: 100 }, false);
    }
    
    // Set target for fighter
    this.fighter.target = this.dummy;
    
    // Add animation status text
    this.animationStatus = this.add.text(400, 150, '', {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: '#222',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    // Add fighter stats display
    this.statsDisplay = this.add.text(150, 150, this.getStatsText(), {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#222',
      padding: { x: 10, y: 5 }
    });
    
    // Add control buttons
    this.createButtons();
    
    // Add title
    this.add.text(400, 50, `${this.fighterName.toUpperCase()} TEST SCENE`, {
      fontSize: '32px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Add instructions
    this.add.text(400, 100, `Click buttons to test ${this.fighterName} animations`, {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);
    
    // Add back button
    const backButton = this.add.text(50, 30, 'BACK', {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 10, y: 5 }
    }).setInteractive();
    
    backButton.on('pointerdown', () => {
      this.scene.start('PreparationScene');
    });
    
    // Add AI toggle button
    const aiToggleButton = this.add.text(700, 30, 'TOGGLE AI', {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: '#333',
      padding: { x: 10, y: 5 }
    }).setInteractive();
    
    aiToggleButton.on('pointerdown', () => {
      this.aiEnabled = !this.aiEnabled;
      aiToggleButton.setBackgroundColor(this.aiEnabled ? '#00aa00' : '#333');
      this.animationStatus.setText(this.aiEnabled ? 'AI Enabled' : 'AI Disabled');
    });
    
    // Listen for animation events
    if (this.fighter.sprite) {
      this.fighter.sprite.on('animationstart', (animation) => {
        this.animationStatus.setText(`Playing: ${animation.key}`);
      });
      
      this.fighter.sprite.on('animationcomplete', (animation) => {
        this.animationStatus.setText(`Completed: ${animation.key}`);
      });
    }
    
    // Add reset button
    const resetButton = this.add.text(400, 550, 'RESET FIGHTERS', {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: '#aa0000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();
    
    resetButton.on('pointerdown', () => {
      this.resetFighters();
    });
  }

  createButtons() {
    const buttonStyle = {
      fontSize: '24px',
      fill: '#fff'
    };
    
    // Create action buttons
    const actions = [
      { text: 'IDLE', action: () => {
        this.fighter.sprite.play(`${this.fighter.fighterName}_idle`);
        return 'Playing idle animation';
      }},
      { text: 'ATTACK', action: () => {
        const result = this.fighter.attack(this.dummy);
        return result ? 'Attacking dummy' : 'Cannot attack now';
      }},
      { text: 'JUMP', action: () => {
        const result = this.fighter.jump();
        return result ? 'Jumping' : 'Cannot jump now';
      }},
      { text: 'SKILL 1', action: () => {
        this.fighter.stats.mana = this.fighter.stats.maxMana; // Ensure enough mana
        const result = this.fighter.useSpecialSkill(1);
        return result ? 'Using Skill 1' : 'Cannot use Skill 1';
      }},
      { text: 'SKILL 2', action: () => {
        this.fighter.stats.mana = this.fighter.stats.maxMana; // Ensure enough mana
        const result = this.fighter.useSpecialSkill(2);
        return result ? 'Using Skill 2' : 'Cannot use Skill 2';
      }},
      { text: 'WALK FORWARD', action: () => {
        this.fighter.move(1);
        setTimeout(() => this.fighter.stopMoving(), 1000);
        return 'Walking forward';
      }},
      { text: 'WALK BACKWARD', action: () => {
        this.fighter.move(-1);
        setTimeout(() => this.fighter.stopMoving(), 1000);
        return 'Walking backward';
      }},
      { text: 'DEFEND', action: () => {
        this.fighter.defend(true);
        setTimeout(() => this.fighter.defend(false), 1000);
        return 'Defending';
      }},
      { text: 'TAKE DAMAGE', action: () => {
        this.fighter.takeDamage(20);
        return 'Taking damage';
      }},
      { text: 'DIE', action: () => {
        this.fighter.stats.hp = 0;
        this.fighter.takeDamage(1);
        return 'Dying';
      }}
    ];
    
    // Add kick button if fighter has kick animation
    if (this.anims.exists(`${this.fighter.fighterName}_kick`) || true) { // Always add kick button
      actions.push({ text: 'KICK', action: () => {
        const result = this.fighter.kick(this.dummy);
        return result ? 'Kicking dummy' : 'Cannot kick now';
      }});
    }
    
    // Position buttons in a grid
    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonsPerRow = 3;
    const startX = 400 - ((buttonsPerRow - 1) * buttonWidth) / 2;
    const startY = 200;
    
    // Clear existing buttons
    this.buttons.forEach(button => button.destroy());
    this.buttons = [];
    
    actions.forEach((action, index) => {
      const row = Math.floor(index / buttonsPerRow);
      const col = index % buttonsPerRow;
      const x = startX + col * buttonWidth;
      const y = startY + row * buttonHeight;
      
      const button = this.add.text(x, y, action.text, buttonStyle)
        .setOrigin(0.5)
        .setInteractive()
        .setPadding(10)
        .setBackgroundColor('#444');
      
      button.on('pointerdown', () => {
        // Play click sound
        if (this.sound.get('button_click')) {
          this.sound.play('button_click', { volume: 0.5 });
        }
        
        // Execute action
        const result = action.action();
        
        // Update status text
        if (result) {
          this.animationStatus.setText(result);
        }
        
        // Visual feedback
        this.tweens.add({
          targets: button,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 100,
          yoyo: true
        });
      });
      
      button.on('pointerover', () => button.setBackgroundColor('#666'));
      button.on('pointerout', () => button.setBackgroundColor('#444'));
      
      this.buttons.push(button);
    });
  }
  
  getStatsText() {
    if (!this.fighter || !this.fighter.stats) {
      return 'No fighter stats available';
    }
    
    const stats = this.fighter.stats;
    return [
      `Name: ${stats.name}`,
      `HP: ${stats.hp}/${stats.maxHp}`,
      `Mana: ${stats.mana}/${stats.maxMana}`,
      `Attack: ${stats.baseAttack}`,
      `Critical: ${stats.critical}%`,
      `Skill 1 Cost: ${stats.specialSkill1Cost}`,
      `Skill 2 Cost: ${stats.specialSkill2Cost}`
    ].join('\n');
  }
  
  resetFighters() {
    if (this.fighter) {
      this.fighter.stats.hp = this.fighter.stats.maxHp;
      this.fighter.stats.mana = this.fighter.stats.maxMana;
      this.fighter.updateBars();
      this.fighter.sprite.play(`${this.fighter.fighterName}_idle`);
    }
    
    if (this.dummy) {
      this.dummy.stats.hp = this.dummy.stats.maxHp;
      this.dummy.stats.mana = this.dummy.stats.maxMana;
      this.dummy.updateBars();
      this.dummy.sprite.play(`${this.dummy.fighterName}_idle`);
    }
    
    this.animationStatus.setText('Fighters reset');
    this.statsDisplay.setText(this.getStatsText());
  }
  
  update(time) {
    // Update fighter position if it moves
    if (this.fighter && this.fighter.sprite) {
      // Update hitbox position to match sprite
      if (this.fighter.hitbox) {
        this.fighter.hitbox.x = this.fighter.sprite.x;
        this.fighter.hitbox.y = this.fighter.sprite.y;
      }
      
      // Update stats display
      if (this.statsDisplay) {
        this.statsDisplay.setText(this.getStatsText());
      }
      
      // Run AI if enabled
      if (this.aiEnabled && this.fighter && this.dummy) {
        this.fighter.updateAI(time, this.dummy);
      }
    }
    
    // Update dummy position if it moves
    if (this.dummy && this.dummy.sprite) {
      // Update hitbox position to match sprite
      if (this.dummy.hitbox) {
        this.dummy.hitbox.x = this.dummy.sprite.x;
        this.dummy.hitbox.y = this.dummy.sprite.y;
      }
    }
  }
}

// Register the scene globally
window.TestFighterScene = TestFighterScene; 