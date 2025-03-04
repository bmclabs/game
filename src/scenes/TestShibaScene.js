class TestShibaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TestShibaScene' });
    
    this.shiba = null;
    this.dummy = null;
    this.statsText = null;
    this.logText = null;
    this.buttons = [];
  }
  
  preload() {
    // Load Shiba assets if not already loaded
    if (!this.textures.exists('shiba_atlas')) {
      this.load.aseprite('shiba_atlas', 'assets/fighters/sprites/shiba/SHIBA.png', 'assets/fighters/sprites/shiba/SHIBA.json');
    }
    
    // Load Trump assets for dummy opponent
    if (!this.textures.exists('trump_atlas')) {
      this.load.aseprite('trump_atlas', 'assets/fighters/sprites/trump/TRUMP.png', 'assets/fighters/sprites/trump/TRUMP.json');
    }
    
    // Load background
    if (!this.textures.exists('arena1')) {
      this.load.image('arena1', 'assets/backgrounds/arena1.png');
    }
    
    // Load particle texture
    if (!this.textures.exists('particle')) {
      this.load.image('particle', 'assets/effects/particle.png');
    }
  }
  
  create() {
    // Add background
    const bg = this.add.image(400, 300, 'arena1');
    bg.setScale(0.8);
    
    // Create Shiba character
    const shibaStats = CHARACTERS.find(c => c.name === 'Shiba');
    this.shiba = new Shiba(this, 300, 450, shibaStats, true);
    
    // Create dummy opponent (Trump)
    const trumpStats = CHARACTERS.find(c => c.name === 'Trump');
    this.dummy = new window.GenericFighter(this, 500, 450, trumpStats, false);
    
    // Process Aseprite animations
    this.anims.createFromAseprite('shiba_atlas');
    this.anims.createFromAseprite('trump_atlas');
    
    // Add stats text
    this.statsText = this.add.text(20, 20, this.getStatsText(), {
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    
    // Add log text
    this.logText = this.add.text(20, 550, '', {
      fontFamily: 'Arial',
      fontSize: 14,
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 },
      wordWrap: { width: 760 }
    });
    
    // Create buttons for actions
    this.createButtons();
    
    // Add reset button
    const resetButton = this.add.text(700, 20, 'RESET', {
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#ffffff',
      backgroundColor: '#880000',
      padding: { x: 10, y: 5 }
    });
    resetButton.setInteractive({ useHandCursor: true });
    resetButton.on('pointerdown', () => {
      this.resetFighters();
    });
    
    // Add back button
    const backButton = this.add.text(700, 60, 'BACK', {
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#ffffff',
      backgroundColor: '#000088',
      padding: { x: 10, y: 5 }
    });
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => {
      this.scene.start('PreparationScene');
    });
    
    // Add event listeners for animations
    this.shiba.sprite.on('animationcomplete', (animation) => {
      console.log(`Animation complete: ${animation.key}`);
    });
    
    // Update stats display
    this.time.addEvent({
      delay: 100,
      callback: () => {
        this.statsText.setText(this.getStatsText());
      },
      loop: true
    });
  }
  
  createButtons() {
    const buttonConfig = [
      { text: 'ATTACK', x: 20, y: 150, callback: () => this.shiba.attack(this.dummy) },
      { text: 'DEFEND', x: 20, y: 190, callback: () => this.shiba.defend(true) },
      { text: 'STOP DEFEND', x: 20, y: 230, callback: () => this.shiba.defend(false) },
      { text: 'JUMP', x: 20, y: 270, callback: () => this.shiba.jump() },
      { text: 'MOVE LEFT', x: 20, y: 310, callback: () => this.shiba.move(-1) },
      { text: 'MOVE RIGHT', x: 20, y: 350, callback: () => this.shiba.move(1) },
      { text: 'STOP MOVE', x: 20, y: 390, callback: () => this.shiba.stopMoving() },
      { text: 'SKILL 1', x: 150, y: 150, callback: () => this.shiba.useSpecialSkill(1) },
      { text: 'SKILL 2', x: 150, y: 190, callback: () => this.shiba.useSpecialSkill(2) },
      { text: 'GAIN MANA', x: 150, y: 230, callback: () => this.shiba.gainMana(25) },
      { text: 'TAKE DAMAGE', x: 150, y: 270, callback: () => this.shiba.takeDamage(20) },
      { text: 'KICK', x: 150, y: 310, callback: () => this.shiba.kick(this.dummy) }
    ];
    
    buttonConfig.forEach(config => {
      const button = this.add.text(config.x, config.y, config.text, {
        fontFamily: 'Arial',
        fontSize: 14,
        color: '#ffffff',
        backgroundColor: '#444444',
        padding: { x: 10, y: 5 }
      });
      
      button.setInteractive({ useHandCursor: true });
      button.on('pointerdown', config.callback);
      button.on('pointerover', () => button.setBackgroundColor('#666666'));
      button.on('pointerout', () => button.setBackgroundColor('#444444'));
      
      this.buttons.push(button);
    });
  }
  
  getStatsText() {
    if (!this.shiba || !this.shiba.stats) return 'Loading...';
    
    return [
      `SHIBA STATS:`,
      `HP: ${this.shiba.stats.hp}/${this.shiba.stats.maxHp}`,
      `Mana: ${this.shiba.stats.mana}/${this.shiba.stats.maxMana}`,
      `Attack: ${this.shiba.stats.baseAttack}`,
      `Critical: ${this.shiba.stats.critical}%`,
      `Defend: ${this.shiba.stats.defend}`,
      `Skill 1: ${this.shiba.stats.specialSkill1Name} (${this.shiba.stats.specialSkill1Cost} mana)`,
      `Skill 2: ${this.shiba.stats.specialSkill2Name} (${this.shiba.stats.specialSkill2Cost} mana)`
    ].join('\n');
  }
  
  resetFighters() {
    // Reset Shiba
    if (this.shiba) {
      this.shiba.stats.hp = this.shiba.stats.maxHp;
      this.shiba.stats.mana = 0;
      this.shiba.updateBars();
      this.shiba.sprite.play('shiba_idle', true);
      this.shiba.isAttacking = false;
      this.shiba.isDefending = false;
      this.shiba.isUsingSkill = false;
      this.shiba.isJumping = false;
    }
    
    // Reset dummy
    if (this.dummy) {
      this.dummy.stats.hp = this.dummy.stats.maxHp;
      this.dummy.stats.mana = 0;
      this.dummy.updateBars();
      this.dummy.sprite.play('trump_idle', true);
    }
    
    // Clear log
    this.logText.setText('');
  }
  
  update(time) {
    // Update fighters
    if (this.shiba) {
      this.shiba.update(time, this.dummy);
      
      // Update log display
      if (this.shiba.logMessages && this.shiba.logMessages.length > 0) {
        this.logText.setText(this.shiba.logMessages.join('\n'));
      }
    }
    
    if (this.dummy) {
      this.dummy.update(time, this.shiba);
    }
  }
}

// Export to global scope
window.TestShibaScene = TestShibaScene; 