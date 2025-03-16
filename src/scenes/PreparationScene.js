class PreparationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreparationScene' });
    // Add flag to track if mode has been updated
    this.modeUpdateInProgress = false;
    // Flag to track if fighters have been sent to backend
    this.fightersSent = false;
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
    try {
      console.log('Initializing PreparationScene with data:', data);
      
      // Reset flag for tracking if fighters have been sent
      this.fightersSent = false;
      
      // Set round number
      this.roundNumber = data?.roundNumber || 1;
      
      // Set fighter stats if provided
      if (data?.fighter1Stats && data?.fighter2Stats) {
        this.fighter1Stats = data.fighter1Stats;
        this.fighter2Stats = data.fighter2Stats;
      }
      
      // Set arena number
      this.currentArena = data?.arenaNumber || Math.floor(Math.random() * 6) + 1;
      
      // Set fighter scores if provided (to continue an ongoing match)
      this.fighter1Score = data?.fighter1Score || 0;
      this.fighter2Score = data?.fighter2Score || 0;
      
      console.log(`Preparation for round ${this.roundNumber} with scores: ${this.fighter1Score}-${this.fighter2Score}`);
    } catch (error) {
      console.error('Error initializing PreparationScene:', error);
    }
  }

  create() {
    try {
      // Set preparation background with a subtle animation
      this.background = this.add.image(400, 300, 'prep_bg');
      this.background.setDisplaySize(this.scale.width, this.scale.height);

      // Make sure background is behind everything
      this.background.setDepth(-1);

      // Instead of a start button, add a countdown text that will automatically start the battle
      const countdownText = this.add.text(400, 50, 'MATCH STARTING IN 15...', { // Moved down from 550 to 580
        fontSize: '42px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 6,
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
      }).setOrigin(0.5);
      
      // Start countdown
      let countdown = 15;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          countdownText.setText(`MATCH STARTING IN ${countdown}`);
        } else {
          clearInterval(countdownInterval);
          countdownText.setText('FIGHT!');
          
          // Start battle after a short delay
          this.time.delayedCall(1000, () => {
            this.startBattle();
          });
        }
      }, 1000);

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

        // Only send next match fighters if not sent before
        if (!this.fightersSent) {
          this.fightersSent = true;
          
          const matchId = gameApiClient._generateMatchId();
          // Send next match fighters to backend with preparation status
          gameApiClient.sendNextMatchFighters(this.fighter1Stats, this.fighter2Stats, matchId)
          .then(() => {
            console.log('Next match fighters sent to backend with preparation status');
            
            // Update fighter stats display after receiving response from backend
            this.updateFighterStats();
          })
          .catch(error => {
            console.error('Error sending next match fighters:', error);
            // Reset flag if error occurs
            this.fightersSent = false;
          });
        } else {
          console.log('Fighters already sent to backend, skipping duplicate send');
        }
        
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
          if (this.fighter1.nameText) this.fighter1.nameText.visible = false;
          if (this.fighter1.healthBar) this.fighter1.healthBar.visible = false;
          if (this.fighter1.healthBarBg) this.fighter1.healthBarBg.visible = false;
          if (this.fighter1.manaBar) this.fighter1.manaBar.visible = false;
          if (this.fighter1.manaBarBg) this.fighter1.manaBarBg.visible = false;
          if (this.fighter1.roundIndicators[0]) this.fighter1.roundIndicators[0].visible = false;
          if (this.fighter1.roundIndicators[1]) this.fighter1.roundIndicators[1].visible = false;
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
          if (this.fighter2.nameText) this.fighter2.nameText.visible = false;
          if (this.fighter2.healthBar) this.fighter2.healthBar.visible = false;
          if (this.fighter2.healthBarBg) this.fighter2.healthBarBg.visible = false;
          if (this.fighter2.manaBar) this.fighter2.manaBar.visible = false;
          if (this.fighter2.manaBarBg) this.fighter2.manaBarBg.visible = false;
          if (this.fighter2.roundIndicators[0]) this.fighter2.roundIndicators[0].visible = false;
          if (this.fighter2.roundIndicators[1]) this.fighter2.roundIndicators[1].visible = false;
        }
        
        // Add fighter names with enhanced styling
        this.add.text(200, 500, this.fighter1Stats.name.toUpperCase(), {
          fontSize: '28px',
          fill: '#9945FF',
          stroke: '#000',
          fontStyle: 'bold',
          strokeThickness: 4,
          shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        this.add.text(600, 500, this.fighter2Stats.name.toUpperCase(), {
          fontSize: '28px',
          fill: '#ff69b4',
          stroke: '#000',
          fontStyle: 'bold',
          strokeThickness: 4,
          shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Create fighter stats display
        // this.createFighterStats();
        
        return;
      }
      
      // If no fighters are pre-selected, select random ones
      console.log('No fighters pre-selected, selecting random fighters');
      this.selectRandomFighters();
    } catch (error) {
      console.error('Error in createFighterSelection:', error);
    }
  }
  
  // Display fighter statistics
  createFighterStats() {
    try {
      console.log('Creating fighter stats display');
      
      // Remove previous stats if they exist
      if (this.fighter1StatsGroup) {
        this.fighter1StatsGroup.clear(true, true);
      }
      if (this.fighter2StatsGroup) {
        this.fighter2StatsGroup.clear(true, true);
      }
      
      // Create container for fighter 1 stats
      this.fighter1StatsGroup = this.add.group();
      
      // Add background for fighter 1 stats
      const fighter1StatsBg = this.add.graphics();
      fighter1StatsBg.fillStyle(0x000000, 0.7);
      fighter1StatsBg.fillRoundedRect(50, 150, 150, 100, 10);
      this.fighter1StatsGroup.add(fighter1StatsBg);
      
      // Add stats for fighter 1
      const fighter1StatsText = this.add.text(60, 160, 
        `HP: ${this.fighter1Stats.hp}\nATK: ${this.fighter1Stats.baseAttack}\nDEF: ${this.fighter1Stats.defend}\nCRIT: ${this.fighter1Stats.critical}%`, 
        { fontSize: '16px', fill: '#00ffff' }
      );
      this.fighter1StatsGroup.add(fighter1StatsText);
      
      // Create container for fighter 2 stats
      this.fighter2StatsGroup = this.add.group();
      
      // Add background for fighter 2 stats
      const fighter2StatsBg = this.add.graphics();
      fighter2StatsBg.fillStyle(0x000000, 0.7);
      fighter2StatsBg.fillRoundedRect(600, 150, 150, 100, 10);
      this.fighter2StatsGroup.add(fighter2StatsBg);
      
      // Add stats for fighter 2
      const fighter2StatsText = this.add.text(610, 160, 
        `HP: ${this.fighter2Stats.hp}\nATK: ${this.fighter2Stats.baseAttack}\nDEF: ${this.fighter2Stats.defend}\nCRIT: ${this.fighter2Stats.critical}%`, 
        { fontSize: '16px', fill: '#ff6666' }
      );
      this.fighter2StatsGroup.add(fighter2StatsText);
      
      console.log('Fighter stats display created successfully');
    } catch (error) {
      console.error('Error creating fighter stats:', error);
    }
  }
  
  // Update fighter statistics display
  updateFighterStats() {
    try {
      console.log('Updating fighter stats display');
      
      // Remove and recreate stats display
      // this.createFighterStats();
      
      console.log('Fighter stats display updated successfully');
    } catch (error) {
      console.error('Error updating fighter stats:', error);
    }
  }
  
  selectRandomFighters() {
    try {
      // Get all available fighters
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
      
      // Update fighter stats
      this.fighter1Stats = fighter1;
      this.fighter2Stats = fighter2;

      // Only send next match fighters if not sent before
      if (!this.fightersSent) {
        this.fightersSent = true;
        
        const matchId = gameApiClient._generateMatchId();
        
        // Send next match fighters to backend with preparation status
        gameApiClient.sendNextMatchFighters(fighter1, fighter2, matchId)
          .then(() => {
            console.log('Next match fighters sent to backend with preparation status');
            
            // Update fighter stats display after receiving response from backend
            this.updateFighterStats();
          })
          .catch(error => {
            console.error('Error sending next match fighters:', error);
            // Reset flag if error occurs
            this.fightersSent = false;
          });
      } else {
        console.log('Fighters already sent to backend, skipping duplicate send');
      }
      
      // Recreate fighter selection with new fighters
      this.createFighterSelection();
    } catch (error) {
      console.error('Error selecting random fighters:', error);
    }
  }

  createArenaSelection() {
    try {
      
      // Add arena preview with enhanced styling - REDUCED SIZE to avoid overlap with countdown
      this.arenaPreview = this.add.image(400, 500, `arena${this.currentArena}`);
      this.arenaPreview.setDisplaySize(140, 80); // Reduced from 300x150 to 200x100
      
      // Add a decorative frame around the arena preview - adjusted for new size
      const graphics = this.add.graphics();
      
      // Add a glow effect to the arena preview
      this.tweens.add({
        targets: graphics,
        alpha: { from: 0.5, to: 1 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      });
      
      // Add text indicating arena is selected
      this.add.text(400, 560, 'arena selected', {
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
    } catch (error) {
      console.error('Error in createStartButton:', error);
    }
  }
  
  startBattle() {
    try {
      // Stop preparation music
      if (this.backgroundMusic) {
        this.backgroundMusic.stop();
      }
      
      // Store reference to this scene
      const self = this;
      
      // Check if mode update is in progress
      if (this.modeUpdateInProgress) {
        console.log('Mode update already in progress, skipping duplicate call');
        // Directly start battle scene
        self.scene.start('BattleScene', {
          fighter1Stats: self.fighter1Stats,
          fighter2Stats: self.fighter2Stats,
          arenaNumber: self.currentArena,
          roundNumber: self.roundNumber,
          fighter1Score: self.fighter1Score,
          fighter2Score: self.fighter2Score
        });
        return;
      }
      
      // Set flag that mode update is in progress
      this.modeUpdateInProgress = true;
      
      // Notify backend about mode change to battle
      console.log('Attempting to update game mode to battle...');
      gameApiClient.updateGameMode(API_CONFIG.modes.battle)
        .then(() => {
          console.log('Game mode successfully set to battle');
        })
        .catch(error => {
          console.error('Error updating game mode:', error);
        })
        .finally(() => {
          // Reset flag
          self.modeUpdateInProgress = false;
          
          // Always continue to battle scene, even if API call fails
          console.log('Starting battle scene...');
          self.scene.start('BattleScene', {
            fighter1Stats: self.fighter1Stats,
            fighter2Stats: self.fighter2Stats,
            arenaNumber: self.currentArena,
            roundNumber: self.roundNumber,
            fighter1Score: self.fighter1Score,
            fighter2Score: self.fighter2Score
          });
        });
    } catch (error) {
      console.error('Error starting battle:', error);
      
      // Reset flag if error occurs
      this.modeUpdateInProgress = false;
      
      // If error occurs, still try to start battle scene
      this.scene.start('BattleScene', {
        fighter1Stats: this.fighter1Stats,
        fighter2Stats: this.fighter2Stats,
        arenaNumber: this.currentArena,
        roundNumber: this.roundNumber,
        fighter1Score: this.fighter1Score,
        fighter2Score: this.fighter2Score
      });
    }
  }
}

// Register the scene globally instead of using export
window.PreparationScene = PreparationScene; 