class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  preload() {
    // Ensure arena backgrounds are loaded
    for (let i = 1; i <= 6; i++) {
      if (!this.textures.exists(`arena${i}`)) {
        this.load.image(`arena${i}`, `assets/arena/arena${i}.png`);
      }
      // Ensure background music is loaded
      if (!this.sound.get(`arena${i}_bgm`)) {
        this.load.audio(`arena${i}_bgm`, `assets/sounds/background/arena${i}.mp3`);
      }
    }

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

      // Create fighters
      this.fighter1 = new Fighter(this, 200, 400, this.fighter1Stats, true);
      this.fighter2 = new Fighter(this, 600, 400, this.fighter2Stats, false);

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

    } catch (error) {
      console.error('Error in BattleScene create:', error);
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
      if (skillType === 0) {
        // Regular attack
        const result = attacker.attack(target);
      } else {
        // Special skill attack
        const skillName = skillType === 1 ? attacker.stats.specialSkill1Name : attacker.stats.specialSkill2Name;
        const damage = skillType === 1 ? attacker.stats.baseAttack * 2 : attacker.stats.baseAttack * 3;
        const actualDamage = target.takeDamage(damage);
      }

      if (target.stats.hp <= 0) {
        this.endRound(attacker, true); // true indicates KO victory
      }
    } catch (error) {
      console.error('Error in attackFighter:', error);
    }
  }

  showRoundResult(winner, isKO = false) {
    if (!winner) return;

    try {
      const resultText = isKO ? 'ROUND WIN!' : 'ROUND WIN!';
      this.roundResultText.setText(`${winner.stats.name}\n${resultText}`);
      this.roundResultText.setVisible(true);
      this.roundResultText.setScale(1);

      // Add log message for round result
      winner.addLogMessage('Won the round!', '#ffd700');

      // Add scaling animation
      this.tweens.add({
        targets: this.roundResultText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // Ensure text is hidden after animation
          this.time.delayedCall(200, () => {
            this.roundResultText.setVisible(false);
            this.roundResultText.setScale(1);
          });

          // Check for match victory
          if (winner.roundsWon >= 2) {
            this.time.delayedCall(500, () => {
              this.showVictoryAnimation(winner);
            });
          }
        }
      });
    } catch (error) {
      console.error('Error in showRoundResult:', error);
      // Fallback: ensure text is hidden even if animation fails
      this.roundResultText.setVisible(false);
      this.roundResultText.setScale(1);
    }
  }

  startNextRound() {
    try {
      // Reset fighters but keep their round wins
      this.fighter1.reset();
      this.fighter2.reset();

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
    if (!winner) return;

    try {
      this.isTransitioning = true;
      this.victoryText.setText(`${winner.stats.name}\nWINS THE MATCH!`);
      this.victoryText.setVisible(true);
      this.victoryText.setScale(1);

      // Add log message for match victory
      winner.addLogMessage('Won the match!', '#ffd700');

      // Hide round result text if it's still visible
      if (this.roundResultText.visible) {
        this.roundResultText.setVisible(false);
      }

      // Add scaling animation
      this.tweens.add({
        targets: this.victoryText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        yoyo: true,
        repeat: 4,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.victoryText.setVisible(false);
          this.victoryText.setScale(1);

          // Ensure we transition to the next match
          this.time.delayedCall(3000, () => {
            if (this.scene) {
              this.startNewMatch();
            }
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
      this.showRoundResult(winner, isKO);

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
