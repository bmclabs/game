class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
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

      // Load character sprites
      CHARACTERS.forEach(char => {
        const spriteName = char.name.toLowerCase();
        if (spriteName !== 'pepe' && !this.textures.exists(spriteName)) {
          this.load.image(spriteName, `assets/characters/${spriteName}.png`);
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

      // Load Doge special skill assets
      if (!this.textures.exists('skill1')) {
        this.load.image('skill1', 'assets/fighters/skills/doge/skill1.png');
      }
      if (!this.textures.exists('skill2')) {
        this.load.image('skill2', 'assets/fighters/skills/doge/skill2.png');
      }
      // Load Doge special skill sounds
      if (!this.sound.get('skill1')) {
        this.load.audio('skill1', 'assets/sounds/effects/skills/doge/skill1.mp3');
      }
      if (!this.sound.get('skill2')) {
        this.load.audio('skill2', 'assets/sounds/effects/skills/doge/skill2.mp3');
      }

      // Load Shiba special skill assets
      if (!this.textures.exists('hell_background')) {
        this.load.image('hell_background', 'assets/fighters/skills/shiba/hell_background.png');
      }
      // Load Shiba special skill sounds
      if (!this.sound.get('shiba_slash')) {
        this.load.audio('shiba_slash', 'assets/sounds/effects/skills/shiba/slash.wav');
      }
      if (!this.sound.get('inu_impact')) {
        this.load.audio('inu_impact', 'assets/sounds/effects/skills/shiba/impact.wav');
      }

      // Preload Pepe assets dengan path yang sama seperti TestPepeScene
      this.load.atlas('pepe_atlas', 
        'assets/fighters/sprites/pepe/PEPE.png',
        'assets/fighters/sprites/pepe/PEPE.json'
      );
      
      // Tunggu sampai semua asset dimuat
      this.load.start();
    } catch (error) {
      console.error('Error in preload:', error);
    }
  }

  init(data) {
    this.roundNumber = data.roundNumber || 1;
    this.fighter1Stats = data.fighter1Stats;
    this.fighter2Stats = data.fighter2Stats;
    this.currentArena = data.arenaNumber || 1;
    this.isGameActive = false; // Set to false initially until countdown finishes
    this.lastUpdateTime = 0;
    this.isTransitioning = false;

    // Stop any currently playing background music
    this.sound.stopAll();
  }

  create() {
    try {
      // Set background with arena image
      this.background = this.add.image(400, 300, `arena${this.currentArena}`);
      this.background.setDisplaySize(800, 600);
      this.background.setDepth(-1);

      // Play background music for current arena
      this.backgroundMusic = this.sound.add(`arena${this.currentArena}_bgm`, {
        loop: true,
        volume: 0.5
      });
      this.backgroundMusic.play();

      // Add semi-transparent overlay for better visibility
      this.overlay = this.add.rectangle(400, 300, 800, 600, 0x000033, 0.2);
      this.overlay.setDepth(-0.5);

      // Create fighters using createFighter method
      this.fighter1 = this.createFighter(this.fighter1Stats, true);
      this.fighter2 = this.createFighter(this.fighter2Stats, false);

      // Show UI for both fighters
      this.fighter1.showUI();
      this.fighter2.showUI();

      // Add countdown text (hidden initially)
      this.countdownText = this.add.text(400, 250, '', {
        fontSize: '120px',
        fill: '#fff',
        align: 'center',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8
      }).setOrigin(0.5).setVisible(false);

      // Add battle timer
      this.battleTimer = 60;
      this.timerText = this.add.text(400, 50, '', {
        fontSize: '48px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      // Add round number
      this.roundText = this.add.text(400, 15, `ROUND ${this.roundNumber}`, {
        fontSize: '24px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      // Add round result text (hidden initially)
      this.roundResultText = this.add.text(400, 250, '', {
        fontSize: '48px',
        fill: '#ffd700',
        align: 'center',
        fontStyle: 'bold'
      }).setOrigin(0.5).setVisible(false);

      // Add victory text (hidden initially)
      this.victoryText = this.add.text(400, 350, '', {
        fontSize: '64px',
        fill: '#ffd700',
        align: 'center',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5).setVisible(false);

      // Start countdown animation
      this.startCountdown();

      // Set target untuk setiap fighter
      this.fighter1.target = this.fighter2;
      this.fighter2.target = this.fighter1;

      // Initialize skills
      if (this.fighter1 instanceof Pepe) {
        this.fighter1.initializePepeSkills();
      }
      if (this.fighter2 instanceof Pepe) {
        this.fighter2.initializePepeSkills();
      }

    } catch (error) {
      console.error('Error in create:', error, error.stack);
    }
  }

  createFighter(stats, isPlayer1) {
    const x = isPlayer1 ? 200 : 600;
    const y = 400;

    if (stats.name === 'Doge') {
      return new Doge(this, x, y, stats, isPlayer1);
    } else if (stats.name === 'Shiba') {
      return new Shiba(this, x, y, stats, isPlayer1);
    } else if (stats.name === 'Pepe') {
      return new Pepe(this, x, y, stats, isPlayer1);
    } else {
      return new Fighter(this, x, y, stats, isPlayer1);
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
      this.isTransitioning = false;

      // Ensure timer text is visible and set
      this.timerText.setText(this.battleTimer.toString());
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
      this.isTransitioning = false;
    }
  }

  update(time) {
    if (!this.isGameActive || this.isTransitioning) return;

    try {
      // Ensure consistent update rate
      if (time - this.lastUpdateTime < 16) return; // ~60 FPS
      this.lastUpdateTime = time;

      // Update fighters' AI with current game time
      if (this.fighter1 && this.fighter2) {
        this.fighter1.update(time, this.fighter2);
        this.fighter2.update(time, this.fighter1);
      }
    } catch (error) {
      console.error('Error in BattleScene update:', error);
    }
  }

  attackFighter(attacker, target, skillType = 0) {
    if (!this.isGameActive || !attacker || !target) return;
  
    try {
      attacker.target = target;
      
      // Check if target should defend (before attack happens)
      if (target instanceof Pepe) {
        const defendProbability = target.stats.defend || 5; // Use defend stat as probability
        const shouldDefend = Math.random() * 10 < defendProbability;
        
        if (shouldDefend) {
          target.defend(true);
          // Reset defend state after a short delay
          this.time.delayedCall(500, () => {
            target.defend(false);
          });
        }
      }
      
      // Add kick probability check for Pepe
      if (attacker instanceof Pepe && skillType === 0) {
        const kickProbability = attacker.stats.kickProbability || 5;
        const useKick = Math.random() * 10 < kickProbability;
        
        if (useKick) {
          const success = attacker.kick(target);
          if (success) {
            return;
          }
        }
      }
      
      // Continue with normal attack logic
      if (skillType === 0) {
        const success = attacker.attack(target);
        if (success) {
          attacker.gainMana(15);
        }
      } else {
        const success = attacker.useSpecialSkill(skillType);
        if (!success) {
          console.log('Failed to execute skill - Check mana:', attacker.stats.mana);
        }
      }
  
      if (target.stats.hp <= 0) {
        this.endRound(attacker, true);
      }
    } catch (error) {
      console.error('Error in attackFighter:', error);
    }
  }

  showRoundResult(winner) {
    try {
      // Show round result text
      const resultText = winner === this.fighter1 ? 'PLAYER 1 WINS!' : 'PLAYER 2 WINS!';
      this.roundResultText.setText(resultText);
      this.roundResultText.setVisible(true);

      // Play win animation for winner only
      if (winner === this.fighter1) {
        if (this.fighter1 instanceof Pepe) {
          this.fighter1.sprite.play('pepe_win');
          // Loop win animation
          this.fighter1.sprite.on('animationcomplete', function(anim) {
            if (anim.key === 'pepe_win') {
              this.play('pepe_win');
            }
          });
        }
      } else {
        if (this.fighter2 instanceof Pepe) {
          this.fighter2.sprite.play('pepe_win');
          // Loop win animation
          this.fighter2.sprite.on('animationcomplete', function(anim) {
            if (anim.key === 'pepe_win') {
              this.play('pepe_win');
            }
          });
        }
      }

      // Add scaling animation for result text
      this.tweens.add({
        targets: this.roundResultText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // Check for match victory
          if (winner.roundsWon >= 2) {
            this.showVictoryAnimation(winner);
          }
        }
      });
    } catch (error) {
      console.error('Error in showRoundResult:', error);
    }
  }

  startNextRound() {
    try {
      // Clean up any ongoing animations first
      if (this.fighter1 instanceof Pepe) {
        this.fighter1.sprite.removeAllListeners('animationcomplete');
        this.fighter1.sprite.play('pepe_idle');
      }
      if (this.fighter2 instanceof Pepe) {
        this.fighter2.sprite.removeAllListeners('animationcomplete');
        this.fighter2.sprite.play('pepe_idle');
      }

      // Reset fighters but keep their round wins
      this.fighter1.reset();
      this.fighter2.reset();
      this.roundResultText.setVisible(false)

      // Reset game state
      this.isGameActive = false;
      this.isTransitioning = false;
      this.battleTimer = 60;

      // Reset fighter positions and facing
      this.fighter1.sprite.x = 200;
      this.fighter1.sprite.y = 400;
      this.fighter1.groundY = 400;
      this.fighter1.updateFacing(1); // Face right
      this.fighter1.hitbox.x = 200;
      this.fighter1.hitbox.y = 400;

      this.fighter2.sprite.x = 600;
      this.fighter2.sprite.y = 400;
      this.fighter2.groundY = 400;
      this.fighter2.updateFacing(-1); // Face left
      this.fighter2.hitbox.x = 600;
      this.fighter2.hitbox.y = 400;

      // Reset any ongoing animations or effects
      this.tweens.killAll();

      // Update round number
      this.roundNumber++;
      this.roundText.setText(`ROUND ${this.roundNumber}`);

      // Start new countdown for next round
      this.startCountdown();
    } catch (error) {
      console.error('Error in startNextRound:', error);
    }
  }

  startNewMatch() {
    try {
      this.isTransitioning = true;

      // Stop current background music
      if (this.backgroundMusic) {
        this.backgroundMusic.stop();
      }

      // Clean up current scene
      this.fighter1.hideUI();
      this.fighter2.hideUI();

      // Select new random fighters and arena
      const availableFighters = [...CHARACTERS];
      const newFighter1 = availableFighters.splice(Math.floor(Math.random() * availableFighters.length), 1)[0];
      const newFighter2 = availableFighters[Math.floor(Math.random() * availableFighters.length)];
      const newArena = Math.floor(Math.random() * 5) + 1;

      // Start preparation phase with new fighters and arena
      this.scene.start('PreparationScene', {
        roundNumber: 1,
        fighter1Stats: newFighter1,
        fighter2Stats: newFighter2,
        arenaNumber: newArena
      });
    } catch (error) {
      console.error('Error in startNewMatch:', error);
    }
  }

  showVictoryAnimation(winner) {
    try {
      this.victoryText.setText(`${winner.stats.name}\nWINS THE MATCH!`);
      this.victoryText.setVisible(true);

      // Play final victory/death animations
      if (winner === this.fighter1) {
        if (this.fighter1 instanceof Pepe) {
          this.fighter1.sprite.play('pepe_win');
          // Loop win animation indefinitely for match victory
          this.fighter1.sprite.on('animationcomplete', function(anim) {
            if (anim.key === 'pepe_win') {
              this.play('pepe_win');
            }
          });
        }
        if (this.fighter2 instanceof Pepe) {
          this.fighter2.sprite.play('pepe_death');
          // Don't reset to idle - stay in death animation
        }
      } else {
        if (this.fighter2 instanceof Pepe) {
          this.fighter2.sprite.play('pepe_win');
          // Loop win animation indefinitely for match victory
          this.fighter2.sprite.on('animationcomplete', function(anim) {
            if (anim.key === 'pepe_win') {
              this.play('pepe_win');
            }
          });
        }
        if (this.fighter1 instanceof Pepe) {
          this.fighter1.sprite.play('pepe_death');
          // Don't reset to idle - stay in death animation
        }
      }

      // Victory text animation
      this.tweens.add({
        targets: this.victoryText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        yoyo: true,
        repeat: 4,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.time.delayedCall(2000, () => {
            this.startNewMatch();
          });
        }
      });
    } catch (error) {
      console.error('Error in showVictoryAnimation:', error);
    }
  }

  endRound(winner, isKO) {
    if (!winner || this.isTransitioning) return;

    try {
      this.isGameActive = false;
      this.isTransitioning = true;

      // Increment winner's round count
      winner.winRound();

      // Show round result animation
      this.showRoundResult(winner);

      // If no winner yet, start next round after delay
      if (winner.roundsWon < 2) {
        this.time.delayedCall(3000, () => {
          this.isTransitioning = false;
          this.startNextRound();
        });
      }
    } catch (error) {
      console.error('Error in endRound:', error);
    }
  }

  updateTimer() {
    if (!this.isGameActive || this.isTransitioning) return;

    try {
      this.battleTimer--;
      this.timerText.setText(this.battleTimer.toString());

      if (this.battleTimer <= 0) {
        // When time's up, fighter with more HP percentage wins the round
        const fighter1HPPercent = (this.fighter1.stats.hp / this.fighter1.stats.maxHp) * 100;
        const fighter2HPPercent = (this.fighter2.stats.hp / this.fighter2.stats.maxHp) * 100;
        const winner = fighter1HPPercent > fighter2HPPercent ? this.fighter1 : this.fighter2;
        this.endRound(winner, false); // false indicates time-up victory
      }
    } catch (error) {
      console.error('Error in updateTimer:', error);
    }
  }
} 
