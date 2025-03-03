class PreparationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreparationScene' });
  }

  preload() {
    try {
      // Preload fighter sprites using FighterFactory
      FighterFactory.preloadFighterAssets(this, CHARACTERS);
      
      // Only load basic images for fighters without sprite sheets
      const fighters = ['doge', 'shiba', 'mochi', 'floki', 'bonk', 'kishu'];
      fighters.forEach(name => {
        try {
          this.load.image(name, `assets/fighters/${name}.png`);
        } catch (error) {
          console.warn(`Failed to load fighter asset: ${name}`);
        }
      });

      // Load VS image
      this.load.image('vs', 'assets/preparation/vs.png');

      // Load preparation background
      this.load.image('prep_bg', 'assets/preparation/bg.png');

      // Load preparation background music
      this.load.audio('prep_bgm', 'assets/sounds/preparation/preparation.mp3');

      // Load sound effects
      this.load.audio('hit', 'assets/sounds/effects/hit.wav');
      this.load.audio('jump', 'assets/sounds/effects/jump.wav');

      // Load arena backgrounds and their background music
      for (let i = 1; i <= 6; i++) {
        this.load.image(`arena${i}`, `assets/arena/arena${i}.png`);
        this.load.audio(`arena${i}_bgm`, `assets/sounds/background/arena${i}.mp3`);
      }
    } catch (error) {
      console.error('Error in preload:', error);
    }
  }

  init(data) {
    // Store round number
    this.roundNumber = data.roundNumber || 1;
    
    // Store fighter stats (use provided fighters or defaults)
    this.fighter1Stats = data.fighter1 || data.fighter1Stats;
    this.fighter2Stats = data.fighter2 || data.fighter2Stats;
    
    // Store arena number
    this.currentArena = data.arenaNumber || Math.floor(Math.random() * 5) + 1;
    
    // Store auto-start flag
    this.autoStart = data.autoStart || false;
    
    console.log(`Initializing preparation scene with fighters: ${this.fighter1Stats?.name} vs ${this.fighter2Stats?.name}, Arena: ${this.currentArena}`);
    console.log(`Auto-start: ${this.autoStart}`);

    // Stop any currently playing background music
    this.sound.stopAll();
  }

  create() {
    try {
      // Set preparation background with a subtle animation
      this.background = this.add.image(400, 300, 'prep_bg');
      this.background.setDisplaySize(800, 600);
      
      // Add a subtle pulsing effect to the background
      this.tweens.add({
        targets: this.background,
        scale: { from: 1, to: 1.05 },
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Make sure background is behind everything
      this.background.setDepth(-1);

      // Add title with enhanced styling
      const titleText = this.add.text(400, 50, 'BATTLE MEMECOIN CLUB', {
        fontSize: '42px',
        fill: '#ffff00',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 6,
        shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, stroke: true, fill: true }
      }).setOrigin(0.5);
      
      // Add a glow effect to the title
      const titleGlow = this.add.graphics();
      titleGlow.fillStyle(0xffff00, 0.2);
      titleGlow.fillRoundedRect(150, 30, 500, 40, 10);
      titleGlow.setDepth(-0.5);
      
      // Add pulsing effect to the title glow
      this.tweens.add({
        targets: titleGlow,
        alpha: { from: 0.2, to: 0.4 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      });

      // Add subtitle with enhanced styling
      const subtitleText = this.add.text(400, 100, 'SELECT YOUR FIGHTER', {
        fontSize: '28px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 3, stroke: true, fill: true }
      }).setOrigin(0.5);
      
      // Add subtle animation to subtitle
      this.tweens.add({
        targets: subtitleText,
        scale: { from: 1, to: 1.05 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      });

      // Add VS text with enhanced styling and animation
      const vsText = this.add.text(400, 300, 'VS', {
        fontSize: '64px',
        fill: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 8,
        shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 8, stroke: true, fill: true }
      }).setOrigin(0.5);
      
      // Add rotation animation to VS text
      this.tweens.add({
        targets: vsText,
        angle: { from: -5, to: 5 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Add scale animation to VS text
      this.tweens.add({
        targets: vsText,
        scale: { from: 1, to: 1.2 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Create fighter selection
      this.createFighterSelection();
      
      // Create arena selection
      this.createArenaSelection();
      
      // Create start button (now auto-start countdown)
      this.createStartButton();
      
      // Play preparation background music
      try {
        this.backgroundMusic = this.sound.add('prep_bgm', { loop: true, volume: 0.5 });
        this.backgroundMusic.play();
      } catch (error) {
        console.warn('Could not play menu music:', error);
      }
      
      // If auto-start is enabled, we don't need to do anything special here
      // as the createStartButton method now handles the countdown automatically
    } catch (error) {
      console.error('Error in create:', error);
    }
  }

  createFighterSelection() {
    try {
      // Check if fighters are already selected
      if (this.fighter1Stats && this.fighter2Stats) {
        console.log(`Creating fighters: ${this.fighter1Stats.name} vs ${this.fighter2Stats.name}`);
        
        // Create fighter 1 display
        this.fighter1 = FighterFactory.createFighter(this, 200, 300, this.fighter1Stats, true);
        if (this.fighter1 && this.fighter1.sprite) {
          this.fighter1.sprite.setScale(this.fighter1.sprite.scaleX * 1.5);
          
          // Add a glow effect to fighter 1
          const fighter1Glow = this.add.graphics();
          fighter1Glow.fillStyle(0x0000ff, 0.3);
          fighter1Glow.fillCircle(200, 300, 100);
          fighter1Glow.setDepth(-0.5);
          
          // Add pulsing effect to the glow
          this.tweens.add({
            targets: fighter1Glow,
            alpha: { from: 0.3, to: 0.6 },
            duration: 1500,
            yoyo: true,
            repeat: -1
          });
          
          // Hide health and mana bars in preparation scene
          if (this.fighter1.healthBar) this.fighter1.healthBar.visible = false;
          if (this.fighter1.healthBarBg) this.fighter1.healthBarBg.visible = false;
          if (this.fighter1.manaBar) this.fighter1.manaBar.visible = false;
          if (this.fighter1.manaBarBg) this.fighter1.manaBarBg.visible = false;
        }
        
        // Create fighter 2 display
        this.fighter2 = FighterFactory.createFighter(this, 600, 300, this.fighter2Stats, false);
        if (this.fighter2 && this.fighter2.sprite) {
          this.fighter2.sprite.setScale(this.fighter2.sprite.scaleX * 1.5);
          
          // Add a glow effect to fighter 2
          const fighter2Glow = this.add.graphics();
          fighter2Glow.fillStyle(0xff0000, 0.3);
          fighter2Glow.fillCircle(600, 300, 100);
          fighter2Glow.setDepth(-0.5);
          
          // Add pulsing effect to the glow
          this.tweens.add({
            targets: fighter2Glow,
            alpha: { from: 0.3, to: 0.6 },
            duration: 1500,
            yoyo: true,
            repeat: -1
          });
          
          // Hide health and mana bars in preparation scene
          if (this.fighter2.healthBar) this.fighter2.healthBar.visible = false;
          if (this.fighter2.healthBarBg) this.fighter2.healthBarBg.visible = false;
          if (this.fighter2.manaBar) this.fighter2.manaBar.visible = false;
          if (this.fighter2.manaBarBg) this.fighter2.manaBarBg.visible = false;
        }
        
        // Add fighter names with enhanced styling
        const fighter1NameText = this.add.text(200, 400, this.fighter1Stats.name, {
          fontSize: '28px',
          fill: '#00ffff',
          stroke: '#000',
          strokeThickness: 4,
          shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        const fighter2NameText = this.add.text(600, 400, this.fighter2Stats.name, {
          fontSize: '28px',
          fill: '#ff6666',
          stroke: '#000',
          strokeThickness: 4,
          shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Add subtle animation to fighter names
        this.tweens.add({
          targets: [fighter1NameText, fighter2NameText],
          y: '+=5',
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        
        return;
      }
      
      // If no fighters are pre-selected, select random ones
      console.log('No fighters pre-selected, selecting random fighters');
      this.selectRandomFighters();
    } catch (error) {
      console.error('Error in createFighterSelection:', error);
    }
  }
  
  selectRandomFighters() {
    try {
      // Get available fighters
      const availableFighters = [...CHARACTERS];
      
      // Make sure we have at least two fighters
      if (availableFighters.length < 2) {
        console.error('Not enough fighters available');
        return;
      }
      
      // Select random fighter 1
      const fighter1Index = Math.floor(Math.random() * availableFighters.length);
      this.fighter1Stats = availableFighters[fighter1Index];
      
      // Remove fighter 1 from available fighters
      availableFighters.splice(fighter1Index, 1);
      
      // Select random fighter 2
      const fighter2Index = Math.floor(Math.random() * availableFighters.length);
      this.fighter2Stats = availableFighters[fighter2Index];
      
      console.log(`Selected random fighters: ${this.fighter1Stats.name} vs ${this.fighter2Stats.name}`);
      
      // Create fighter displays
      this.fighter1 = FighterFactory.createFighter(this, 200, 300, this.fighter1Stats, true);
      if (this.fighter1 && this.fighter1.sprite) {
        this.fighter1.sprite.setScale(this.fighter1.sprite.scaleX * 1.1);
      }
      
      this.fighter2 = FighterFactory.createFighter(this, 600, 300, this.fighter2Stats, false);
      if (this.fighter2 && this.fighter2.sprite) {
        this.fighter2.sprite.setScale(this.fighter2.sprite.scaleX * 1.1);
      }
      
      // Add fighter names
      this.add.text(200, 400, this.fighter1Stats.name, {
        fontSize: '24px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);
      
      this.add.text(600, 400, this.fighter2Stats.name, {
        fontSize: '24px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);
    } catch (error) {
      console.error('Error in selectRandomFighters:', error);
    }
  }

  createArenaSelection() {
    try {
      
      // Add arena preview with enhanced styling - REDUCED SIZE to avoid overlap with countdown
      this.arenaPreview = this.add.image(400, 500, `arena${this.currentArena}`);
      this.arenaPreview.setDisplaySize(200, 100); // Reduced from 300x150 to 200x100
      
      // Add a decorative frame around the arena preview - adjusted for new size
      const graphics = this.add.graphics();
      graphics.lineStyle(4, 0xffff00, 1);
      graphics.strokeRect(300, 450, 200, 100); // Adjusted position and size
      
      // Add a glow effect to the arena preview
      this.tweens.add({
        targets: graphics,
        alpha: { from: 0.5, to: 1 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      });
      
      // Add text indicating arena is selected
      this.add.text(400, 560, 'ARENA SELECTED', {
        fontSize: '18px',
        fill: '#ffff00',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(0.5);
      
      // No arena navigation buttons are added as per request
    } catch (error) {
      console.error('Error in createArenaSelection:', error);
    }
  }
  
  updateArenaDisplay() {
    try {
      // Update arena text
      const arenaText = this.children.list.find(child => 
        child.type === 'Text' && child.text.startsWith('ARENA')
      );
      if (arenaText) {
        arenaText.setText(`ARENA ${this.currentArena}`);
      }
      
      // Update arena preview
      if (this.arenaPreview) {
        this.arenaPreview.setTexture(`arena${this.currentArena}`);
      }
    } catch (error) {
      console.error('Error in updateArenaDisplay:', error);
    }
  }

  createStartButton() {
    try {
      // Instead of a start button, add a countdown text that will automatically start the battle
      const countdownText = this.add.text(400, 580, 'MATCH STARTING IN 10...', { // Moved down from 550 to 580
        fontSize: '28px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
      }).setOrigin(0.5);
      
      // Add a pulsing effect to the countdown text
      this.tweens.add({
        targets: countdownText,
        scale: { from: 1, to: 1.1 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
      
      // Start countdown
      let countdown = 10;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          countdownText.setText(`MATCH STARTING IN ${countdown}...`);
        } else {
          clearInterval(countdownInterval);
          countdownText.setText('FIGHT!');
          
          // Start battle after a short delay
          this.time.delayedCall(1000, () => {
            this.startBattle();
          });
        }
      }, 1000);
    } catch (error) {
      console.error('Error in createStartButton:', error);
    }
  }
  
  startBattle() {
    try {
      // Stop preparation background music
      if (this.backgroundMusic) {
        this.backgroundMusic.stop();
      }
      
      // Stop all tweens before transitioning
      this.tweens.killAll();
      
      // Reset fighter positions and scales if they exist
      if (this.fighter1 && this.fighter1.sprite) {
        this.fighter1.sprite.setScale(this.fighter1.sprite.scaleX / 1.1);
      }
      
      if (this.fighter2 && this.fighter2.sprite) {
        this.fighter2.sprite.setScale(this.fighter2.sprite.scaleX / 1.1);
      }
      
      // Start battle scene
      this.scene.start('BattleScene', {
        roundNumber: this.roundNumber,
        fighter1Stats: this.fighter1Stats,
        fighter2Stats: this.fighter2Stats,
        arenaNumber: this.currentArena
      });
    } catch (error) {
      console.error('Error in startBattle:', error);
    }
  }
}

// Register the scene globally instead of using export
window.PreparationScene = PreparationScene; 
