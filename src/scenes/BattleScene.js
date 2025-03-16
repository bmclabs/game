class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
    this.resultSent = false; // Flag to track if the result has been sent
    this.modeUpdated = false;
    
    // Add tracking for round scores
    this.fighter1Score = 0;
    this.fighter2Score = 0;
    this.roundsToWin = 2; // Need 2 wins to win the match
    
    // Flag to prevent multiple calls to startNewRound
    this.isStartingNewRound = false;
  }

  preload() {
    try {
      // Load arena backgrounds
      for (let i = 1; i <= 6; i++) {
        if (!this.textures.exists(`arena${i}`)) {
          this.load.image(`arena${i}`, `assets/arena/arena${i}.png`);
        }
        // Ensure background music is loaded
        if (!this.sound.get(`arena${i}_bgm`)) {
          this.load.audio(`arena${i}_bgm`, `assets/sounds/background/arena${i}.mp3`);
        }
      }

      // Preload fighter assets using FighterFactory
      FighterFactory.preloadFighterAssets(this, CHARACTERS);

      // Load character sprites for fighters without sprite sheets
      CHARACTERS.forEach(char => {
        const spriteName = char.name.toLowerCase();
        if (spriteName !== 'pepe' && spriteName !== 'trump' && !this.textures.exists(spriteName)) {
          this.load.image(spriteName, `assets/fighters/${spriteName}.png`);
        }
      });

      // Load sound effects if not already loaded
      if (!this.sound.get('hit')) {
        this.load.audio('hit', 'assets/sounds/effects/hit.wav');
      }
      if (!this.sound.get('jump')) {
        this.load.audio('jump', 'assets/sounds/effects/jump.wav');
      }

      // Load countdown sound effects
      this.load.audio('3', 'assets/sounds/effects/3.wav');
      this.load.audio('2', 'assets/sounds/effects/2.wav');
      this.load.audio('1', 'assets/sounds/effects/1.wav');
      this.load.audio('fight', 'assets/sounds/effects/fight.mp3');

      // Load generic skill sounds
      if (!this.sound.get('skill1')) {
        this.load.audio('skill1', 'assets/sounds/effects/skills/generic/skill1.mp3');
      }
      if (!this.sound.get('skill2')) {
        this.load.audio('skill2', 'assets/sounds/effects/skills/generic/skill2.mp3');
      }
      
      // Create a particle texture for confetti if it doesn't exist
      if (!this.textures.exists('particle')) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 8, 8);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
      }
    } catch (error) {
      console.error('Error in preload:', error);
    }
  }

  init(data) {
    try {
      console.log('Initializing BattleScene with data:', data);
      
      // Reset flag untuk memulai round baru
      this.isStartingNewRound = false;
      
      // Store round number
      this.roundNumber = data?.roundNumber || 1;
      
      // Store fighter stats
      this.fighter1Stats = data?.fighter1Stats;
      this.fighter2Stats = data?.fighter2Stats;
      
      // Store arena number
      this.arenaNumber = data?.arenaNumber || 1;
      
      // Get fighter scores from data or use default
      this.fighter1Score = data?.fighter1Score || 0;
      this.fighter2Score = data?.fighter2Score || 0;
      
      // Initialize game state
      this.isGameActive = false;
      this.timeLeft = 60; // Set timer to 60 seconds
      this.lastUpdateTime = 0;
      this.isTransitioning = false;
      
      // Stop any currently playing background music
      this.sound.stopAll();
      
      console.log(`Initializing battle: Round ${this.roundNumber}, Arena ${this.arenaNumber}`);
      console.log(`Fighter 1: ${this.fighter1Stats?.name} (Score: ${this.fighter1Score}), Fighter 2: ${this.fighter2Stats?.name} (Score: ${this.fighter2Score})`);
    } catch (error) {
      console.error('Error in init:', error);
    }
  }

  create() {
    try {
      console.log('Creating battle scene...');
      
      // Get fighter stats from registry or use defaults
      this.fighter1Stats = this.fighter1Stats || this.registry.get('fighter1Stats') || { name: 'Player 1', hp: 100, baseAttack: 10 };
      this.fighter2Stats = this.fighter2Stats || this.registry.get('fighter2Stats') || { name: 'Player 2', hp: 100, baseAttack: 10 };
      
      // Get round number from registry or use default
      this.roundNumber = this.roundNumber || this.registry.get('roundNumber') || 1;
      
      // Get arena number from registry or use default
      this.arenaNumber = this.arenaNumber || this.registry.get('arenaNumber') || 1;
      
      console.log(`Battle scene created with fighters: ${this.fighter1Stats.name} vs ${this.fighter2Stats.name}`);
      console.log(`Round: ${this.roundNumber}, Arena: ${this.arenaNumber}`);
      
      // Add arena background
      this.background = this.add.image(400, 300, `arena${this.arenaNumber}`);
      this.background.setDisplaySize(800, 600);
      
      // Add overlay for darkening
      this.overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.3);
      this.overlay.setDepth(-0.5);
      
      // Create fighters
      console.log('Creating fighter 1...');
      this.fighter1 = this.createFighter(this.fighter1Stats, true);
      
      console.log('Creating fighter 2...');
      this.fighter2 = this.createFighter(this.fighter2Stats, false);
      
      // Set targets
      this.fighter1.target = this.fighter2;
      this.fighter2.target = this.fighter1;
      
      // Ensure fighters are facing each other initially if they have the setFlipX method
      if (this.fighter1.sprite.setFlipX && this.fighter2.sprite.setFlipX) {
        this.fighter1.updateFacing(this.fighter2);
        this.fighter2.updateFacing(this.fighter1);
      }
      
      // Add round text
      this.roundText = this.add.text(400, 25, `ROUND ${this.roundNumber}`, {
        fontSize: '32px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(100);
      
      // Add countdown text
      this.countdownText = this.add.text(400, 300, '', {
        fontSize: '120px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 8
      }).setOrigin(0.5).setDepth(100).setVisible(false);
      
      // Add round result text
      this.roundResultText = this.add.text(400, 200, '', {
        fontSize: '36px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 6
      }).setOrigin(0.5).setDepth(100).setVisible(false);
      
      // Add KO text
      this.koText = this.add.text(400, 300, 'K.O.!', {
        fontSize: '120px',
        fill: '#ff0000',
        fontStyle: 'bold',
        stroke: '#fff',
        strokeThickness: 8
      }).setOrigin(0.5).setDepth(100).setVisible(false);
      
      // Add timer text
      this.timeLeft = 60;
      this.timerText = this.add.text(400, 60, this.timeLeft.toString(), {
        fontSize: '36px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(100);
      
      // Play arena background music
      try {
        this.backgroundMusic = this.sound.add(`arena${this.arenaNumber}_bgm`, { loop: true, volume: 0.3 });
        this.backgroundMusic.play();
      } catch (error) {
        console.warn('Could not play arena background music:', error);
      }
      
      // Start countdown
      this.startCountdown();
      
      // Update round indicators based on current scores
      // Delay sedikit untuk memastikan fighter sudah dibuat sepenuhnya
      this.time.delayedCall(100, () => {
        this.updateRoundIndicators();
      });
    } catch (error) {
      console.error('Error in create:', error);
    }
  }

  createFighter(stats, isPlayer1) {
    try {
      if (!stats) {
        console.error('No fighter stats provided');
        return null;
      }
      
      console.log(`Creating fighter: ${stats.name}, isPlayer1: ${isPlayer1}`);
      
      const x = isPlayer1 ? 200 : 600;
      const y = 400;
      
      // Always use FighterFactory to create fighters
      const fighter = FighterFactory.createFighter(this, x, y, stats, isPlayer1);
      
      // Ensure fighter has necessary properties
      if (fighter) {
        // Set initial properties
        fighter.groundY = y;
        fighter.isMoving = false;
        fighter.moveDirection = 0;
        fighter.moveIntervalId = null;
        
        // Log success
        console.log(`Fighter ${stats.name} created successfully`);
      } else {
        console.error(`Failed to create fighter: ${stats.name}`);
      }
      
      return fighter;
    } catch (error) {
      console.error(`Error creating fighter ${stats?.name}:`, error);
      return null;
    }
  }

  startCountdown() {
    const countdownConfig = {
      fontSize: '120px',
      fill: '#fff',
      align: 'center',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    };

    const showNumber = (number, delay) => {
      this.time.delayedCall(delay, () => {
        this.countdownText.setStyle(countdownConfig);
        this.countdownText.setText(number);
        this.countdownText.setVisible(true);

        // Play corresponding sound with error handling
        try {
          const soundKey = number === 'FIGHT!' ? 'fight' : number;
          const sound = this.sound.add(soundKey, { volume: 0.5 });
          sound.play();
        } catch (error) {
          console.warn('Sound effect not played:', error);
        }

        // Add scale animation
        this.tweens.add({
          targets: this.countdownText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 200,
          yoyo: true,
          ease: 'Power2',
          onComplete: () => {
            this.countdownText.setScale(1);

            // Hide text after animation
            this.time.delayedCall(800, () => {
              this.countdownText.setVisible(false);
            });

            // Start battle only after FIGHT! animation
            if (number === 'FIGHT!') {
              this.time.delayedCall(500, () => {
                this.startBattle();
              });
            }
          }
        });
      });
    };

    // Ensure countdown text is reset
    this.countdownText.setScale(1);
    this.countdownText.setVisible(false);

    // Show countdown numbers with delays
    showNumber('3', 0);
    showNumber('2', 1500);
    showNumber('1', 3000);

    // Show FIGHT! with different style
    this.time.delayedCall(4500, () => {
      this.countdownText.setStyle({
        ...countdownConfig,
        fontSize: '150px',
        fill: '#ffd700'
      });
      showNumber('FIGHT!', 0);
    });
  }

  startBattle() {
    try {
      // Ensure game is not already active
      if (this.isGameActive) return;

      this.isGameActive = true;
      
      // Ensure timer text is visible and set
      this.timerText.setText(Math.ceil(this.timeLeft).toString());
      this.timerText.setVisible(true);

      // Start the battle timer
      if (this.timerEvent) this.timerEvent.remove();

      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
      });

      // Reset and set initial action delays for fighters
      if (this.fighter1 && this.fighter2) {
        this.fighter1.nextActionTime = this.time.now + Math.random() * 1000;
        this.fighter2.nextActionTime = this.time.now + Math.random() * 1000;
      }
    } catch (error) {
      console.error('Error in startBattle:', error);
      // Attempt recovery
      this.isGameActive = true;
    }
  }

  update(time) {
    try {
      if (!this.isGameActive) return;
      
      // Update timer
      this.updateTimer();
      
      // Update fighters
      if (this.fighter1 && this.fighter2) {
        // Track previous HP for determining who took damage last
        const prevHP1 = this.fighter1.stats.hp;
        const prevHP2 = this.fighter2.stats.hp;
        
        // Update fighter positions and AI
        if (this.fighter1.sprite) {
          this.fighter1.update(time, this.fighter2);
          
          // Periodically gain mana for both fighters
          if (time % 60 === 0) {
            this.fighter1.gainMana(1);
          }
        }
        
        if (this.fighter2.sprite) {
          this.fighter2.update(time, this.fighter1);
          
          // Periodically gain mana for both fighters
          if (time % 60 === 0) {
            this.fighter2.gainMana(1);
          }
        }
        
        // Check for KO with improved handling for simultaneous KO
        if (this.fighter1.stats.hp <= 0 && this.fighter2.stats.hp <= 0) {
          console.log('Both fighters KO at the same time! Determining winner...');
          
          // Determine who took damage last by comparing previous HP
          const fighter1Damage = prevHP1 - this.fighter1.stats.hp;
          const fighter2Damage = prevHP2 - this.fighter2.stats.hp;
          
          // If one fighter took more damage this frame, the other wins
          if (fighter1Damage > fighter2Damage) {
            console.log(`${this.fighter2.stats.name} wins - took less damage in final hit`);
            this.endRound(this.fighter2, true);
          } else if (fighter2Damage > fighter1Damage) {
            console.log(`${this.fighter1.stats.name} wins - took less damage in final hit`);
            this.endRound(this.fighter1, true);
          } else {
            // If damage is equal, determine winner based on previous health percentage
            const fighter1PrevHealthPercent = prevHP1 / this.fighter1.stats.maxHp;
            const fighter2PrevHealthPercent = prevHP2 / this.fighter2.stats.maxHp;
            
            if (fighter1PrevHealthPercent > fighter2PrevHealthPercent) {
              console.log(`${this.fighter1.stats.name} wins - had higher health percentage before final hit`);
              this.endRound(this.fighter1, true);
            } else if (fighter2PrevHealthPercent > fighter1PrevHealthPercent) {
              console.log(`${this.fighter2.stats.name} wins - had higher health percentage before final hit`);
              this.endRound(this.fighter2, true);
            } else {
              // If everything is equal, choose randomly
              const randomWinner = Math.random() < 0.5 ? this.fighter1 : this.fighter2;
              console.log(`Completely equal KO! Random winner: ${randomWinner.stats.name}`);
              this.endRound(randomWinner, true);
            }
          }
          return;
        } else if (this.fighter1.stats.hp <= 0) {
          this.endRound(this.fighter2, true);
          return;
        } else if (this.fighter2.stats.hp <= 0) {
          this.endRound(this.fighter1, true);
          return;
        }
        
        // Always ensure fighters are facing each other
        // Only if they have sprites with setFlipX method
        if (this.fighter1.sprite && this.fighter2.sprite && 
            this.fighter1.sprite.setFlipX && this.fighter2.sprite.setFlipX) {
          this.fighter1.updateFacing(this.fighter2);
          this.fighter2.updateFacing(this.fighter1);
        }
        
        // Update fighter UI
        this.fighter1.updateBars();
        this.fighter2.updateBars();
        
        // Log fighter positions for debugging
        if (time % 300 === 0) {
          console.log(`Fighter positions: ${this.fighter1.stats.name}(${Math.round(this.fighter1.sprite.x)},${Math.round(this.fighter1.sprite.y)}) vs ${this.fighter2.stats.name}(${Math.round(this.fighter2.sprite.x)},${Math.round(this.fighter2.sprite.y)})`);
        }
      }
    } catch (error) {
      console.error('Error in update:', error);
    }
  }

  attackFighter(attacker, target, skillType = 0) {
    try {
      if (!attacker || !target) {
        console.error('Invalid attacker or target in attackFighter');
        return false;
      }
      
      // Check if attacker is already attacking
      if (attacker.isAttacking || attacker.isUsingSkill) {
        return false;
      }
      
      // Make sure attacker is facing target if it has setFlipX method
      if (attacker.sprite.setFlipX) {
        attacker.updateFacing(target);
      }
      
      // Calculate distance between fighters
      const distance = Math.abs(attacker.sprite.x - target.sprite.x);
      
      // Determine if attack is in range
      const attackRange = skillType > 0 ? 300 : 100; // Skills have longer range
      const inRange = distance <= attackRange;
      
      // If not in range and not a skill, return false
      if (!inRange && skillType === 0) {
        console.log(`Attack out of range: ${distance} > ${attackRange}`);
        return false;
      }
      
      // Set attacking flag
      attacker.isAttacking = true;
      
      // Play attack animation if it's a sprite with animations
      const animKey = skillType === 0 ? 
        `${attacker.fighterName}_attack` : 
        `${attacker.fighterName}_skill${skillType}`;
      
      if (attacker.sprite.anims && attacker.sprite.play && this.anims.exists(animKey)) {
        attacker.sprite.play(animKey);
        
        // Wait for animation to complete
        attacker.sprite.once('animationcomplete', () => {
          // Reset attacking flag
          attacker.isAttacking = false;
          
          // Return to idle animation
          attacker.sprite.play(`${attacker.fighterName}_idle`);
          
          // Make sure we're still facing the target if we have setFlipX method
          if (attacker.sprite.setFlipX) {
            attacker.updateFacing(target);
          }
        });
      } else {
        // No animation, just attack directly
        if (skillType === 0) {
          attacker.attack(target);
        } else {
          // Handle skill attack
          const skillDamage = skillType === 1 ? 20 : 40;
          target.takeDamage(skillDamage);
        }
        
        // Reset attacking flag after delay
        this.time.delayedCall(500, () => {
          attacker.isAttacking = false;
          
          // Make sure we're still facing the target if we have setFlipX method
          if (attacker.sprite.setFlipX) {
            attacker.updateFacing(target);
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error in attackFighter:', error);
      return false;
    }
  }

  showRoundResult(winner) {
    try {
      // Show round result text
      const resultText = winner === this.fighter1 ? `${winner.stats.name.toUpperCase()} WINS ROUND!` : `${winner.stats.name.toUpperCase()} WINS ROUND!`;
      this.roundResultText.setText(resultText);
      this.roundResultText.setVisible(true);
      
      // Play win animation for winner
      if (winner.sprite && winner.fighterName) {
        const winAnimKey = `${winner.fighterName}_win`;
        if (this.anims.exists(winAnimKey)) {
          winner.sprite.play(winAnimKey);
          // Loop win animation
          winner.sprite.on('animationcomplete', function(anim) {
            if (anim.key === winAnimKey) {
              this.play(winAnimKey);
            }
          });
        }
      }
      
      console.log(`${winner.stats.name} won round ${this.roundNumber}. Current score: ${this.fighter1Score}-${this.fighter2Score}`);
      
      // Delay sebelum memulai round berikutnya
      this.time.delayedCall(3000, () => {
        // Pastikan roundResultText tidak visible lagi
        this.roundResultText.setVisible(false);
        
        // Mulai round baru
        this.startNewRound();
      });
    } catch (error) {
      console.error('Error showing round result:', error);
      // Langsung mulai round berikutnya jika terjadi error
      this.startNewRound();
    }
  }

  startNewRound() {
    try {
      // Check if already in the process of starting a new round
      if (this.isStartingNewRound) {
        console.log('Already starting new round, ignoring duplicate call');
        return;
      }
      
      // Set flag bahwa sedang memulai round baru
      this.isStartingNewRound = true;
      
      console.log('Starting new round...');
      
      // Reset flags untuk round baru
      this.resultSent = false;
      this.modeUpdated = false;
      
      // Restart the current scene with updated round number and scores
      this.scene.restart({
        fighter1Stats: this.fighter1Stats,
        fighter2Stats: this.fighter2Stats,
        arenaNumber: this.arenaNumber,
        roundNumber: this.roundNumber + 1,
        fighter1Score: this.fighter1Score,
        fighter2Score: this.fighter2Score
      });
    } catch (error) {
      console.error('Error starting new round:', error);
      // Reset flag jika terjadi error
      this.isStartingNewRound = false;
    }
  }

  startNewMatch() {
    try {
      console.log('Starting new match...');
      
      // Reset flags untuk pertandingan baru
      this.resultSent = false;
      this.modeUpdated = false;
      
      // Select random fighters for the next match
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
      
      console.log('Selected new fighters:', fighter1.name, 'vs', fighter2.name);
      
      // Select random arena
      const arenaNumber = Math.floor(Math.random() * 6) + 1;
      
      // Start preparation scene directly without changing mode
      // (Preparation scene will handle sending next match fighters)
      this.scene.start('PreparationScene', {
        roundNumber: 1, // Reset round number for new match
        fighter1Stats: fighter1,
        fighter2Stats: fighter2,
        arenaNumber: arenaNumber,
        fighter1Score: 0, // Reset scores for new match
        fighter2Score: 0
      });
    } catch (error) {
      console.error('Error starting new match:', error);
    }
  }

  showVictoryAnimation(winner) {
    try {
      // Stop the game
      this.isGameActive = false;
      
      // Hide round result text
      this.roundResultText.setVisible(false);

      // Show victory text
      const victoryText = winner === this.fighter1 ? `${winner.stats.name.toUpperCase()} WINS THE MATCH!` : `${winner.stats.name.toUpperCase()} WINS THE MATCH!`;
      this.victoryText = this.add.text(400, 200, victoryText, {
        fontSize: '36px',
        fill: '#ffff00',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 6,
        align: 'center'
      }).setOrigin(0.5).setDepth(100);
      
      // Play victory animation for winner
      if (winner.sprite && winner.fighterName) {
        const winAnimKey = `${winner.fighterName}_win`;
        if (this.anims.exists(winAnimKey)) {
          winner.sprite.play(winAnimKey);
          
          // Loop win animation
          winner.sprite.on('animationcomplete', function(anim) {
            if (anim.key === winAnimKey) {
              this.play(winAnimKey);
            }
          });
        }
      }
      
      // Add confetti effect
      this.addConfettiEffect();
      
      // Add "NEXT MATCH" text
      const nextMatchText = this.add.text(400, 470, 'NEXT MATCH STARTING SOON...', {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#444',
        padding: { x: 20, y: 10 },
        borderRadius: 8
      }).setOrigin(0.5).setDepth(100);
      
      // Add pulsing effect to next match text
      this.tweens.add({
        targets: nextMatchText,
        alpha: 0.5,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
      
      // Automatically return to preparation scene after delay
      this.time.delayedCall(5000, () => {
        // Stop background music
        if (this.backgroundMusic) {
          this.backgroundMusic.stop();
        }
        
        // Start new match
        this.startNewMatch();
      });
    } catch (error) {
      console.error('Error in showVictoryAnimation:', error);
      
      // Fallback to preparation scene if there's an error
      this.scene.start('PreparationScene');
    }
  }
  
  addConfettiEffect() {
    try {
      // Create particle emitter for confetti
      const particles = this.add.particles('particle');
      
      // Create confetti colors
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
      
      // Create emitter
      const emitter = particles.createEmitter({
        x: { min: 0, max: 800 },
        y: -50,
        lifespan: 5000,
        speedY: { min: 100, max: 300 },
        speedX: { min: -100, max: 100 },
        angle: { min: 0, max: 360 },
        rotate: { min: 0, max: 360 },
        scale: { min: 0.5, max: 1.5 },
        quantity: 2,
        frequency: 50,
        tint: { min: colors[0], max: colors[colors.length - 1] }
      });
      
      // Stop emitter after 5 seconds
      this.time.delayedCall(5000, () => {
        emitter.stop();
      });
    } catch (error) {
      console.warn('Could not create confetti effect:', error);
    }
  }

  endRound(winner, isKO = false) {
    try {
      // If no winner is provided, it's a draw or forced end
      if (!winner) {
        console.log('Round ended without a winner');
        this.startNewMatch();
        return;
      }
      
      console.log(`Round ended with winner: ${winner.stats.name}, KO: ${isKO}`);
      
      // Stop the game
      this.isGameActive = false;
      
      // Update round scores and indicators
      if (winner === this.fighter1) {
        this.fighter1Score++;
        // Update round indicator for fighter 1
        if (this.fighter1.roundIndicators && this.fighter1.roundIndicators[this.fighter1Score - 1]) {
          this.fighter1.roundIndicators[this.fighter1Score - 1].setFillStyle(0x00ff00); // Set to green
        }
        console.log(`${this.fighter1Stats.name} score increased to ${this.fighter1Score}`);
      } else {
        this.fighter2Score++;
        // Update round indicator for fighter 2
        if (this.fighter2.roundIndicators && this.fighter2.roundIndicators[this.fighter2Score - 1]) {
          this.fighter2.roundIndicators[this.fighter2Score - 1].setFillStyle(0x00ff00); // Set to green
        }
        console.log(`${this.fighter2Stats.name} score increased to ${this.fighter2Score}`);
      }
      
      // Check if a fighter has won the match (reached 2 wins)
      const matchWinner = this.fighter1Score >= this.roundsToWin ? this.fighter1 : 
                      this.fighter2Score >= this.roundsToWin ? this.fighter2 : null;
      
      if (matchWinner) {
        console.log(`Match winner: ${matchWinner.stats.name} with score ${this.fighter1Score}-${this.fighter2Score}`);
        
        // Check if match result has already been sent
        if (this.resultSent) {
          console.log('Match result already sent, skipping duplicate send');
          this.showVictoryAnimation(matchWinner);
          return;
        }
        
        // Set flag bahwa hasil sudah dikirim
        this.resultSent = true;
        
        // Send match result to backend
        gameApiClient.sendMatchResult(
          matchWinner === this.fighter1 ? this.fighter1Stats : this.fighter2Stats,
          isKO
        )
          .then(() => {
            console.log('Match result sent to backend');
            
            // Show victory animation
            this.showVictoryAnimation(matchWinner);
          })
          .catch(error => {
            console.error('Error sending match result:', error);
            
            // Still show victory animation and continue
            this.showVictoryAnimation(matchWinner);
          });
      } else {
        // Jika belum ada yang mencapai 2 kemenangan, lanjutkan ke round berikutnya
        console.log(`Current score: ${this.fighter1Stats.name} ${this.fighter1Score} - ${this.fighter2Score} ${this.fighter2Stats.name}`);
        console.log('No match winner yet, continuing to next round');
        
        // Tampilkan animasi round winner dan lanjutkan ke round berikutnya
        this.showRoundResult(winner);
      }
    } catch (error) {
      console.error('Error ending round:', error);
    }
  }

  updateTimer() {
    try {
      if (!this.isGameActive) return;
      
      // Decrease timer
      this.timeLeft -= 1/60; // Decrease by 1 second every 60 frames (assuming 60 FPS)
      
      // Update timer text
      const timeLeftInt = Math.ceil(this.timeLeft);
      this.timerText.setText(timeLeftInt.toString());
      
      // Change color when time is running out
      if (timeLeftInt <= 10) {
        this.timerText.setStyle({
          fontSize: '48px',
          fill: '#ff0000',
          fontStyle: 'bold',
          stroke: '#000',
          strokeThickness: 4
        });
      }
      
      // End round if time runs out
      if (this.timeLeft <= 0) {
        console.log('Time ran out! Determining winner based on health percentage');
        
        // Determine winner based on health percentage
        const fighter1HealthPercent = this.fighter1.stats.hp / this.fighter1.stats.maxHp;
        const fighter2HealthPercent = this.fighter2.stats.hp / this.fighter2.stats.maxHp;
        
        let winner;
        if (fighter1HealthPercent > fighter2HealthPercent) {
          winner = this.fighter1;
          console.log(`${this.fighter1.stats.name} wins by health percentage: ${(fighter1HealthPercent * 100).toFixed(1)}% vs ${(fighter2HealthPercent * 100).toFixed(1)}%`);
        } else if (fighter2HealthPercent > fighter1HealthPercent) {
          winner = this.fighter2;
          console.log(`${this.fighter2.stats.name} wins by health percentage: ${(fighter2HealthPercent * 100).toFixed(1)}% vs ${(fighter1HealthPercent * 100).toFixed(1)}%`);
        } else {
          // If health percentages are equal, choose randomly
          winner = Math.random() < 0.5 ? this.fighter1 : this.fighter2;
          console.log(`Health percentages equal! Random winner: ${winner.stats.name}`);
        }
        
        // End round with time out
        this.endRound(winner, false);
      }
    } catch (error) {
      console.error('Error in updateTimer:', error);
    }
  }

  // Add function to update round indicators based on scores
  updateRoundIndicators() {
    try {
      console.log('Updating round indicators based on scores');
      
      // Update fighter 1 round indicators
      for (let i = 0; i < this.fighter1Score; i++) {
        if (this.fighter1.roundIndicators && this.fighter1.roundIndicators[i]) {
          this.fighter1.roundIndicators[i].setFillStyle(0x00ff00); // Set to green
        }
      }
      
      // Update fighter 2 round indicators
      for (let i = 0; i < this.fighter2Score; i++) {
        if (this.fighter2.roundIndicators && this.fighter2.roundIndicators[i]) {
          this.fighter2.roundIndicators[i].setFillStyle(0x00ff00); // Set to green
        }
      }
    } catch (error) {
      console.error('Error updating round indicators:', error);
    }
  }
}

// Register the scene globally
window.BattleScene = BattleScene; 
