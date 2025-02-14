class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data) {
    this.roundNumber = data.roundNumber || 1;
    this.fighter1Stats = data.fighter1Stats;
    this.fighter2Stats = data.fighter2Stats;
    this.isGameActive = true;
    this.lastUpdateTime = 0;
  }

  create() {
    // Set background
    this.add.rectangle(400, 300, 800, 600, 0x000033);

    // Add battle stage platform
    this.add.rectangle(400, 500, 700, 40, 0x333333);

    // Create fighters
    this.fighter1 = new Fighter(this, 200, 400, this.fighter1Stats, true);
    this.fighter2 = new Fighter(this, 600, 400, this.fighter2Stats, false);

    // Show UI for both fighters
    this.fighter1.showUI();
    this.fighter2.showUI();

    // Add battle timer
    this.battleTimer = 60;
    this.timerText = this.add.text(400, 50, '', {
      fontSize: '48px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add round number
    this.roundText = this.add.text(400, 15, `ROUND ${this.roundNumber}`, {
      fontSize: '24px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add battle feedback text
    this.feedbackText = this.add.text(400, 200, '', {
      fontSize: '24px',
      fill: '#fff',
      align: 'center'
    }).setOrigin(0.5);

    // Add round result text (hidden initially)
    this.roundResultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffd700',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // Add victory text (hidden initially)
    this.victoryText = this.add.text(400, 300, '', {
      fontSize: '64px',
      fill: '#ffd700',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // Start the battle timer
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // Set initial action delays for fighters
    this.fighter1.nextActionTime = this.time.now + Math.random() * 1000;
    this.fighter2.nextActionTime = this.time.now + Math.random() * 1000;
  }

  update(time) {
    if (!this.isGameActive) return;

    // Ensure consistent update rate
    if (time - this.lastUpdateTime < 16) return; // ~60 FPS
    this.lastUpdateTime = time;

    // Update fighters' AI with current game time
    this.fighter1.update(time, this.fighter2);
    this.fighter2.update(time, this.fighter1);

    // Check if fighters are stuck and reset their positions if needed
    this.checkAndResetFighterPositions();
  }

  checkAndResetFighterPositions() {
    const distance = Math.abs(this.fighter1.sprite.x - this.fighter2.sprite.x);

    // If fighters are too close or too far for too long, reset their positions
    if (distance < 30 || distance > 600) {
      this.fighter1.sprite.x = 200;
      this.fighter2.sprite.x = 600;
      this.fighter1.targetPosition = this.fighter1.sprite.x;
      this.fighter2.targetPosition = this.fighter2.sprite.x;
      this.fighter1.isMovingRight = Math.random() < 0.5;
      this.fighter2.isMovingRight = Math.random() < 0.5;
    }
  }

  attackFighter(attacker, target, skillType = 0) {
    if (!this.isGameActive) return;

    if (skillType === 0) {
      // Regular attack
      const result = attacker.attack(target);
      this.showFeedback(
        `${attacker.stats.name} hits for ${result.damage}${result.isCritical ? ' CRITICAL!' : ''}`,
        result.isCritical ? '#ff0000' : '#ffffff'
      );
    } else {
      // Special skill attack
      const skillName = skillType === 1 ? attacker.stats.specialSkill1Name : attacker.stats.specialSkill2Name;
      const damage = skillType === 1 ? attacker.stats.baseAttack * 2 : attacker.stats.baseAttack * 3;
      const actualDamage = target.takeDamage(damage);
      this.showFeedback(
        `${attacker.stats.name} uses ${skillName} for ${actualDamage} damage!`,
        '#00ff00'
      );
    }

    if (target.stats.hp <= 0) {
      this.endRound(attacker, true); // true indicates KO victory
    }
  }

  showFeedback(text, color = '#ffffff') {
    this.feedbackText.setText(text);
    this.feedbackText.setColor(color);
    this.time.delayedCall(1000, () => {
      this.feedbackText.setText('');
    });
  }

  showRoundResult(winner, isKO = false) {
    const resultText = isKO ? 'ROUND WIROUND WIN!' : 'ROUND WIN!';
    this.roundResultText.setText(`${winner.stats.name}\n${resultText}`);
    this.roundResultText.setVisible(true);

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
        this.roundResultText.setVisible(false);
      }
    });
  }

  startNextRound() {
    // Reset fighters but keep their round wins
    this.fighter1.reset();
    this.fighter2.reset();

    // Reset game state
    this.isGameActive = true;
    this.battleTimer = 60;

    // Reset fighter positions
    this.fighter1.sprite.x = 200;
    this.fighter2.sprite.x = 600;

    // Update round number
    this.roundNumber++;
    this.roundText.setText(`ROUND ${this.roundNumber}`);
  }

  startNewMatch() {
    // Select new random fighters
    const availableFighters = [...CHARACTERS];
    const newFighter1 = availableFighters.splice(Math.floor(Math.random() * availableFighters.length), 1)[0];
    const newFighter2 = availableFighters[Math.floor(Math.random() * availableFighters.length)];

    // Start preparation phase with new fighters
    this.scene.start('PreparationScene', {
      roundNumber: 1,
      fighter1Stats: newFighter1,
      fighter2Stats: newFighter2
    });
  }

  showVictoryAnimation(winner) {
    this.victoryText.setText(`${winner.stats.name}\nWINS THE MATCH!`);
    this.victoryText.setVisible(true);

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
        // After 5 seconds, start new match
        this.time.delayedCall(5000, () => {
          this.startNewMatch();
        });
      }
    });
  }

  endRound(winner, isKO) {
    this.isGameActive = false;

    // Show round result animation
    this.showRoundResult(winner, isKO);

    // Increment winner's round count
    winner.winRound();

    // Check if either fighter has won 2 rounds
    if (this.fighter1.roundsWon >= 2 || this.fighter2.roundsWon >= 2) {
      // Show victory animation after round result
      this.time.delayedCall(2000, () => {
        this.showVictoryAnimation(winner);
      });
    } else {
      // After 3 seconds, start next round in the same scene
      this.time.delayedCall(3000, () => {
        this.startNextRound();
      });
    }
  }

  updateTimer() {
    if (!this.isGameActive) return;

    this.battleTimer--;
    this.timerText.setText(this.battleTimer.toString());

    if (this.battleTimer <= 0) {
      // When time's up, fighter with more HP percentage wins the round
      const fighter1HPPercent = (this.fighter1.stats.hp / this.fighter1.stats.maxHp) * 100;
      const fighter2HPPercent = (this.fighter2.stats.hp / this.fighter2.stats.maxHp) * 100;
      const winner = fighter1HPPercent > fighter2HPPercent ? this.fighter1 : this.fighter2;
      this.endRound(winner, false); // false indicates time-up victory
    }
  }
} 
