class TestDogeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TestDogeScene' });
    this.doge = null;
    this.dummy = null;
    this.buttons = [];
    this.animationStatus = null;
    this.aiEnabled = false;
  }

  preload() {
    try {
      // Load Doge assets
      this.load.atlas(
        'doge_atlas',
        'assets/fighters/sprites/doge/DOGE.png',
        'assets/fighters/sprites/doge/DOGE.json'
      );
      
      // Load dummy fighter assets (using Trump as dummy)
      this.load.atlas(
        'trump_atlas',
        'assets/fighters/sprites/trump/TRUMP.png',
        'assets/fighters/sprites/trump/TRUMP.json'
      );
      
      // Load sound effects
      this.load.audio('hit', 'assets/sounds/effects/hit.wav');
      this.load.audio('jump', 'assets/sounds/effects/jump.wav');
      
      // Load background
      this.load.image('arena1', 'assets/arena/arena1.png');
    } catch (error) {
      console.error('Error in preload:', error);
    }
  }

  create() {
    try {
      // Add background
      this.background = this.add.image(400, 300, 'arena1');
      this.background.setDisplaySize(800, 600);
      
      // Create Doge fighter
      const dogeStats = CHARACTERS.find(char => char.name === 'Doge');
      if (!dogeStats) {
        console.error('Doge stats not found in CHARACTERS array');
        return;
      }
      
      this.doge = new Doge(this, 300, 400, dogeStats, true);
      
      // Create dummy fighter (Trump)
      const dummyStats = CHARACTERS.find(char => char.name === 'Trump');
      if (!dummyStats) {
        console.error('Trump stats not found in CHARACTERS array');
        return;
      }
      
      this.dummy = new GenericFighter(this, 500, 400, dummyStats, false);
      
      // Set targets
      this.doge.target = this.dummy;
      this.dummy.target = this.doge;
      
      // Add animation status display
      this.animationStatus = this.add.text(400, 550, 'Ready', {
        fontSize: '18px',
        fill: '#fff',
        backgroundColor: '#333',
        padding: { x: 10, y: 5 }
      });
      this.animationStatus.setOrigin(0.5);
      
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
      this.add.text(400, 50, 'DOGE TEST SCENE', {
        fontSize: '32px',
        fill: '#fff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // Add instructions
      this.add.text(400, 100, 'Click buttons to test Doge animations', {
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
      if (this.doge.sprite) {
        this.doge.sprite.on('animationstart', (animation) => {
          this.animationStatus.setText(`Playing: ${animation.key}`);
        });
        
        this.doge.sprite.on('animationcomplete', (animation) => {
          this.animationStatus.setText(`Completed: ${animation.key}`);
        });
      }
    } catch (error) {
      console.error('Error in create:', error);
    }
  }
  
  createButtons() {
    const buttonConfig = [
      { text: 'IDLE', action: () => this.doge.sprite.play('doge_idle') },
      { text: 'WALK', action: () => this.doge.sprite.play('doge_walk') },
      { text: 'ATTACK', action: () => this.doge.attack(this.dummy) },
      { text: 'KICK', action: () => this.doge.kick(this.dummy) },
      { text: 'JUMP', action: () => this.doge.jump() },
      { text: 'DEFEND', action: () => {
        this.doge.isDefending = !this.doge.isDefending;
        if (this.doge.isDefending) {
          this.doge.sprite.play('doge_defense');
        } else {
          this.doge.sprite.play('doge_idle');
        }
      }},
      { text: 'HIT', action: () => {
        this.doge.sprite.play('doge_hit');
        this.doge.takeDamage(10);
      }},
      { text: 'DEATH', action: () => {
        this.doge.sprite.play('doge_death');
        this.doge.stats.hp = 0;
        this.doge.die();
      }},
      { text: 'SKILL 1', action: () => this.doge.useSpecialSkill(1) },
      { text: 'SKILL 2', action: () => this.doge.useSpecialSkill(2) },
      { text: 'RESET', action: () => this.resetFighters() }
    ];
    
    const buttonWidth = 100;
    const buttonHeight = 40;
    const buttonsPerRow = 4;
    const startX = 400 - ((buttonsPerRow * buttonWidth) / 2) + (buttonWidth / 2);
    const startY = 480;
    
    buttonConfig.forEach((config, index) => {
      const row = Math.floor(index / buttonsPerRow);
      const col = index % buttonsPerRow;
      
      const button = this.add.text(
        startX + (col * buttonWidth),
        startY + (row * buttonHeight),
        config.text,
        {
          fontSize: '16px',
          fill: '#fff',
          backgroundColor: '#444',
          padding: { x: 10, y: 5 }
        }
      ).setOrigin(0.5);
      
      button.setInteractive();
      
      button.on('pointerdown', () => {
        config.action();
      });
      
      button.on('pointerover', () => {
        button.setBackgroundColor('#666');
      });
      
      button.on('pointerout', () => {
        button.setBackgroundColor('#444');
      });
      
      this.buttons.push(button);
    });
  }
  
  getStatsText() {
    if (!this.doge || !this.doge.stats) {
      return 'No fighter stats available';
    }
    
    return `DOGE STATS:
HP: ${this.doge.stats.hp}/${this.doge.stats.maxHp}
Mana: ${this.doge.stats.mana}/${this.doge.stats.maxMana}
Attack: ${this.doge.stats.baseAttack}
Critical: ${this.doge.stats.critical}%
Skill 1: ${this.doge.stats.specialSkill1Name} (${this.doge.stats.specialSkill1Cost} mana)
Skill 2: ${this.doge.stats.specialSkill2Name} (${this.doge.stats.specialSkill2Cost} mana)`;
  }
  
  resetFighters() {
    if (this.doge) {
      this.doge.stats.hp = this.doge.stats.maxHp;
      this.doge.stats.mana = this.doge.stats.maxMana;
      this.doge.updateBars();
      this.doge.sprite.play('doge_idle');
    }
    
    if (this.dummy) {
      this.dummy.stats.hp = this.dummy.stats.maxHp;
      this.dummy.stats.mana = this.dummy.stats.maxMana;
      this.dummy.updateBars();
      this.dummy.sprite.play('trump_idle');
    }
    
    this.animationStatus.setText('Fighters reset');
    this.statsDisplay.setText(this.getStatsText());
  }
  
  update(time) {
    // Update fighter position if it moves
    if (this.doge && this.doge.sprite) {
      // Update hitbox position to match sprite
      if (this.doge.hitbox) {
        this.doge.hitbox.x = this.doge.sprite.x;
        this.doge.hitbox.y = this.doge.sprite.y;
      }
      
      // Update stats display
      if (this.statsDisplay) {
        this.statsDisplay.setText(this.getStatsText());
      }
      
      // Run AI if enabled
      if (this.aiEnabled && this.doge && this.dummy) {
        this.doge.updateAI(time, this.dummy);
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