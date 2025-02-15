class Fighter {
  constructor(scene, x, y, stats, isPlayer1) {
    this.scene = scene;
    this.isPlayer1 = isPlayer1;

    // Create fighter sprite
    try {
      const spriteName = stats.name.toLowerCase();

      // Check if sprite texture exists and is loaded
      if (scene.textures.exists(spriteName) && scene.textures.get(spriteName).key !== '__MISSING') {
        this.sprite = scene.add.sprite(x, y, spriteName);
        this.sprite.setOrigin(0.5);

        // Increase fighter size (150px height)
        const desiredHeight = 150;
        const scale = desiredHeight / this.sprite.height;
        this.sprite.setScale(scale);

        // Add sprite glow effect
        if (this.sprite.preFX) {
          this.sprite.preFX.addGlow(stats.color || 0xff0000, 0.5, 0, false, 0.1, 16);
        }

        // Add hitbox
        this.hitbox = scene.add.rectangle(x, y, this.sprite.displayWidth * 0.8, this.sprite.displayHeight * 0.9);
        this.hitbox.setVisible(false); // Hide hitbox visually but keep it active

        console.log(`Created sprite for ${spriteName}`);
      } else {
        // Use default rectangle if sprite not found
        const defaultWidth = 75;
        const defaultHeight = 150;
        this.sprite = scene.add.rectangle(x, y, defaultWidth, defaultHeight, stats.color || 0xff0000);
        this.sprite.texture = { key: '__DEFAULT' };

        // Add hitbox for default rectangle
        this.hitbox = scene.add.rectangle(x, y, defaultWidth * 0.8, defaultHeight * 0.9);
        this.hitbox.setVisible(false);

        console.log(`Using default rectangle for ${spriteName}`);
      }
    } catch (error) {
      console.warn('Fighter sprite creation failed, using fallback:', error);
      const defaultWidth = 75;
      const defaultHeight = 150;
      this.sprite = scene.add.rectangle(x, y, defaultWidth, defaultHeight, stats.color || 0xff0000);
      this.sprite.texture = { key: '__DEFAULT' };
      this.hitbox = scene.add.rectangle(x, y, defaultWidth * 0.8, defaultHeight * 0.9);
      this.hitbox.setVisible(false);
    }

    // Set initial facing direction
    this.updateFacing(isPlayer1 ? 1 : -1);

    this.roundsWon = 0;
    this.stats = {
      hp: stats.hp || 100,
      maxHp: stats.hp || 100,
      mana: stats.mana || 0,
      maxMana: stats.maxMana || 100,
      baseAttack: stats.baseAttack || 10,
      critical: stats.critical || 5,
      defend: stats.defend || 5,
      specialSkill1Cost: stats.specialSkill1Cost || 30,
      specialSkill2Cost: stats.specialSkill2Cost || 60,
      specialSkill1Name: stats.specialSkill1Name || 'Special 1',
      specialSkill2Name: stats.specialSkill2Name || 'Special 2',
      name: stats.name || (isPlayer1 ? 'Player 1' : 'Player 2')
    };

    // Add jumping properties
    this.isJumping = false;
    this.jumpVelocity = 0;
    this.jumpSpeed = 15;
    this.gravity = 0.8;
    this.groundY = y;
    this.canSwapPosition = true;
    this.swapCooldown = 2000; // 2 seconds cooldown
    this.lastSwapTime = 0;

    // Fighting style properties
    this.nextActionTime = 0;
    this.actionDelay = Math.random() * 300 + 200;
    this.targetPosition = x;
    this.moveSpeed = 5;
    this.attackRange = 80; // Reduced for closer combat
    this.minDistance = 60; // Reduced minimum distance
    this.isMovingRight = Math.random() < 0.5;
    this.consecutiveAttacks = 0;
    this.maxConsecutiveAttacks = 4;
    this.lastMoveTime = 0;
    this.moveCooldown = 1000;
    this.isStuck = false;
    this.stuckTime = 0;
    this.maxStuckTime = 500;

    // Create UI container
    const barWidth = 250;
    const healthBarHeight = 25;
    const manaBarHeight = 15;
    const barPadding = 5;
    const uiX = isPlayer1 ? 20 : scene.game.config.width - barWidth - 20;
    const uiY = 30;

    // Create UI group
    this.uiGroup = scene.add.group();

    // Create background bars
    this.healthBarBg = scene.add.rectangle(uiX + barWidth / 2, uiY + healthBarHeight / 2, barWidth, healthBarHeight, 0x666666);
    this.manaBarBg = scene.add.rectangle(uiX + barWidth / 2, uiY + healthBarHeight + barPadding + manaBarHeight / 2, barWidth, manaBarHeight, 0x666666);

    // Create health and mana bars
    this.healthBar = scene.add.rectangle(uiX + barWidth / 2, uiY + healthBarHeight / 2, barWidth, healthBarHeight, isPlayer1 ? 0xff0000 : 0xff4444);
    this.manaBar = scene.add.rectangle(uiX + barWidth / 2, uiY + healthBarHeight + barPadding + manaBarHeight / 2, barWidth, manaBarHeight, isPlayer1 ? 0x0000ff : 0x4444ff);

    // Add name text
    this.nameText = scene.add.text(uiX + (isPlayer1 ? 0 : barWidth), uiY - 30, this.stats.name, {
      fontSize: '24px',
      fill: '#ffffff',
      align: isPlayer1 ? 'left' : 'right',
      fontStyle: 'bold'
    }).setOrigin(isPlayer1 ? 0 : 1, 0);

    // Add round indicators
    const indicatorY = uiY + healthBarHeight + manaBarHeight + barPadding * 3;
    const indicatorRadius = 10;
    const indicatorSpacing = 25;

    this.roundIndicators = [];
    for (let i = 0; i < 2; i++) {
      const x = isPlayer1 ?
        (uiX + indicatorRadius + i * indicatorSpacing) :
        (uiX + barWidth - indicatorRadius - (1 - i) * indicatorSpacing);

      this.roundIndicators[i] = scene.add.circle(x, indicatorY, indicatorRadius, 0x666666);
      this.uiGroup.add(this.roundIndicators[i]);
    }

    // Add logger system
    this.logMessages = [];
    this.maxLogMessages = 4;

    // Create logger container with adjusted position
    const loggerY = scene.game.config.height - 115; // Moved down more
    const loggerX = isPlayer1 ? 20 : scene.game.config.width - 20;

    // Create log background with adjusted height
    this.logBackground = scene.add.rectangle(
      isPlayer1 ? 125 : scene.game.config.width - 125,
      scene.game.config.height - 70, // Adjusted to match new position
      250,
      100, // Reduced height to better match log count
      0x000000,
      0.5
    );
    this.uiGroup.add(this.logBackground);

    this.logTexts = [];
    for (let i = 0; i < this.maxLogMessages; i++) {
      const text = scene.add.text(loggerX, loggerY + (i * 25), '', {
        fontSize: '16px',
        fill: '#ffffff',
        align: isPlayer1 ? 'left' : 'right',
        fontFamily: 'Arial',
        fixedWidth: 230,
        wordWrap: { width: 230 }
      }).setOrigin(isPlayer1 ? 0 : 1, 0);

      this.logTexts.push(text);
      this.uiGroup.add(text);
    }

    // Add all UI elements to the group
    this.uiGroup.addMultiple([
      this.healthBarBg, this.manaBarBg,
      this.healthBar, this.manaBar,
      this.nameText
    ]);

    // Initially show the UI
    this.showUI();
  }

  showUI() {
    this.uiGroup.setVisible(true);
  }

  hideUI() {
    this.uiGroup.setVisible(false);
  }

  updateBars() {
    const healthWidth = (this.stats.hp / this.stats.maxHp) * 250;
    const manaWidth = (this.stats.mana / this.stats.maxMana) * 250;

    this.healthBar.width = Math.max(0, Math.min(250, healthWidth));
    this.manaBar.width = Math.max(0, Math.min(250, manaWidth));
  }

  winRound() {
    if (this.roundsWon < 2) {
      this.roundIndicators[this.roundsWon].setFillStyle(0x00ff00);
      this.roundsWon++;
    }
  }

  resetRounds() {
    this.roundsWon = 0;
    this.roundIndicators.forEach(indicator => indicator.setFillStyle(0x666666));
  }

  addLogMessage(message, color = '#ffffff') {
    if (!message || !this.logTexts) return;

    try {
      // Add new message to the beginning of the array
      this.logMessages.unshift({ text: message, color });

      // Keep only the last maxLogMessages
      while (this.logMessages.length > this.maxLogMessages) {
        this.logMessages.pop();
      }

      // Update all log texts
      this.updateLogDisplay();
    } catch (error) {
      console.error('Error in addLogMessage:', error);
    }
  }

  updateLogDisplay() {
    if (!this.logTexts || !this.logMessages) return;

    try {
      // Update each log text with current messages
      this.logTexts.forEach((text, i) => {
        if (i < this.logMessages.length) {
          const message = this.logMessages[i];
          text.setText(message.text);
          text.setColor(message.color);
          text.setVisible(true);
        } else {
          text.setText('');
          text.setVisible(false);
        }
      });
    } catch (error) {
      console.error('Error in updateLogDisplay:', error);
    }
  }

  takeDamage(amount) {
    const damage = Math.max(0, amount - this.stats.defend);
    this.stats.hp = Math.max(0, this.stats.hp - damage);
    this.gainMana(damage * 0.5);
    this.updateBars();

    // Play hit sound with reduced volume
    this.scene.sound.play('hit', { volume: 0.2 });

    // Enhanced damage effects
    if (this.sprite.texture.key !== '__DEFAULT') {
      // Add flash effect
      if (this.sprite.preFX) {
        const flashFX = this.sprite.preFX.addFlash(0xff0000);
        this.scene.tweens.add({
          targets: flashFX,
          intensity: 1,
          duration: 100,
          yoyo: true,
          onComplete: () => flashFX.remove()
        });
      }

      // Add color tint effect
      this.sprite.setTint(0xff0000);
      this.scene.time.delayedCall(200, () => {
        this.sprite.clearTint();
      });

      // Add shake effect
      this.scene.tweens.add({
        targets: this.sprite,
        x: this.sprite.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 2,
        ease: 'Power1'
      });
    } else {
      // For default rectangle fighters
      this.sprite.setFillStyle(0xff0000);
      this.scene.time.delayedCall(200, () => {
        this.sprite.setFillStyle(this.stats.color || 0xff0000);
      });
    }

    this.addLogMessage(`Took ${damage} damage!`, '#ff6666');
    return damage;
  }

  gainMana(amount) {
    const oldMana = this.stats.mana;
    this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + amount);
    const gainedMana = this.stats.mana - oldMana;

    if (gainedMana > 0) {
      this.addLogMessage(`Gained ${Math.floor(gainedMana)} mana`, '#6666ff');
    }

    this.updateBars();
  }

  useSpecialSkill(skillNumber) {
    const cost = skillNumber === 1 ? this.stats.specialSkill1Cost : this.stats.specialSkill2Cost;
    if (this.stats.mana >= cost) {
      this.stats.mana -= cost;
      this.updateBars();
      const skillName = skillNumber === 1 ? this.stats.specialSkill1Name : this.stats.specialSkill2Name;
      this.addLogMessage(`Using ${skillName}!`, '#00ff00');
      return true;
    }
    return false;
  }

  attack(target) {
    const isCritical = Math.random() * 100 < this.stats.critical;
    const damage = this.stats.baseAttack * (isCritical ? 2 : 1);
    const actualDamage = target.takeDamage(damage);

    // Add log message for attack
    this.addLogMessage(
      `Attack${isCritical ? ' CRITICAL' : ''} for ${actualDamage}!`,
      isCritical ? '#ff0000' : '#ffffff'
    );

    this.gainMana(actualDamage * 0.3);
    return { damage: actualDamage, isCritical };
  }

  reset() {
    this.stats.hp = this.stats.maxHp;
    this.stats.mana = 0;
    this.updateBars();

    // Reset sprite effects if using custom sprite
    if (this.sprite.texture.key !== '__DEFAULT' && this.sprite.preFX) {
      this.sprite.preFX.clear();
      this.sprite.preFX.addGlow(this.stats.color || 0xff0000, 0.5, 0, false, 0.1, 16);
    }

    this.logMessages = [];
    this.updateLogDisplay();
  }

  updateFacing(direction) {
    if (this.sprite.texture.key !== '__DEFAULT' && this.sprite.setFlipX) {
      this.sprite.setFlipX(direction < 0);
    }
  }

  update(time, opponent) {
    if (!this.scene || !this.scene.isGameActive) return;

    try {
      // Update jumping physics
      if (this.isJumping) {
        this.sprite.y -= this.jumpVelocity;
        this.jumpVelocity -= this.gravity;

        // Update hitbox position
        this.hitbox.y = this.sprite.y;

        // Check if landed
        if (this.sprite.y >= this.groundY) {
          this.sprite.y = this.groundY;
          this.hitbox.y = this.groundY;
          this.isJumping = false;
          this.jumpVelocity = 0;
        }
      }

      const distance = Math.abs(this.sprite.x - opponent.sprite.x);

      // Update facing direction based on opponent position
      this.updateFacing(this.sprite.x < opponent.sprite.x ? 1 : -1);

      // Check if fighters are too close
      if (distance < this.minDistance) {
        // Random chance to swap positions or jump over
        if (this.canSwapPosition && time - this.lastSwapTime > this.swapCooldown && Math.random() < 0.3) {
          this.swapPositionWithOpponent(opponent);
        } else if (!this.isJumping && Math.random() < 0.4) {
          this.jumpOverOpponent(opponent);
        }
      }

      // Random jumping during movement
      if (!this.isJumping && Math.random() < 0.02) {
        if (Math.random() < 0.3) {
          this.jumpOverOpponent(opponent);
        } else {
          this.jump();
        }
      }

      // Check if fighter is stuck
      if (Math.abs(this.sprite.x - this.targetPosition) < this.moveSpeed) {
        if (!this.isStuck) {
          this.isStuck = true;
          this.stuckTime = time;
        } else if (time - this.stuckTime > this.maxStuckTime) {
          // Force movement if stuck too long
          this.moveAway(opponent);
          this.isStuck = false;
        }
      } else {
        this.isStuck = false;
      }

      // Update fighter position based on movement
      if (Math.abs(this.sprite.x - this.targetPosition) > this.moveSpeed) {
        const direction = this.sprite.x < this.targetPosition ? 1 : -1;
        const newX = this.sprite.x + direction * this.moveSpeed;

        // Check boundaries and prevent getting stuck at edges
        if (newX >= 100 && newX <= 700) {
          // Check if moving would cause overlap
          const newDistance = Math.abs(newX - opponent.sprite.x);
          if (newDistance >= this.minDistance) {
            this.sprite.x = newX;
          } else {
            this.moveAway(opponent);
          }
        } else {
          this.moveAway(opponent);
        }
      }

      // Check if it's time for next action
      if (time > this.nextActionTime) {
        // Decide next action based on distance and state
        if (distance <= this.attackRange) {
          if (this.consecutiveAttacks < this.maxConsecutiveAttacks) {
            this.performAttack(opponent);
            this.consecutiveAttacks++;
          } else {
            this.moveAway(opponent);
            this.consecutiveAttacks = 0;
          }
        } else {
          // Only move if not on cooldown
          if (time - this.lastMoveTime > this.moveCooldown) {
            this.approachOpponent(opponent);
            this.lastMoveTime = time;
            this.consecutiveAttacks = 0;
          }
        }

        // Add some randomness to next action time
        this.nextActionTime = time + this.actionDelay + Math.random() * 100;
      }

      // Update hitbox position with sprite movement
      this.hitbox.x = this.sprite.x;
    } catch (error) {
      console.error('Error in Fighter update:', error);
    }
  }

  approachOpponent(opponent) {
    // Calculate optimal attack position
    const baseOffset = this.attackRange * 0.5; // Reduced offset for closer combat
    const randomOffset = Math.random() * (this.attackRange * 0.2);
    const offset = baseOffset + randomOffset;

    // Determine which side to approach from
    const approachFromLeft = this.sprite.x < opponent.sprite.x;
    this.targetPosition = opponent.sprite.x + (approachFromLeft ? -offset : offset);

    // Ensure target position is within bounds
    this.targetPosition = Math.max(100, Math.min(700, this.targetPosition));
  }

  moveAway(opponent) {
    // Calculate escape distance based on current position
    const minDistance = 150;
    const maxDistance = 250;
    const moveDistance = minDistance + Math.random() * (maxDistance - minDistance);

    // Determine escape direction (prefer moving towards center if near edges)
    const nearLeftEdge = this.sprite.x < 250;
    const nearRightEdge = this.sprite.x > 550;

    let escapeDirection;
    if (nearLeftEdge) {
      escapeDirection = 1; // Move right
    } else if (nearRightEdge) {
      escapeDirection = -1; // Move left
    } else {
      // Move away from opponent
      escapeDirection = this.sprite.x < opponent.sprite.x ? -1 : 1;
    }

    this.targetPosition = this.sprite.x + (moveDistance * escapeDirection);
    this.targetPosition = Math.max(100, Math.min(700, this.targetPosition));
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpSpeed;

      // Play jump sound with reduced volume
      this.scene.sound.play('jump', { volume: 0.1 });

      // Add random horizontal movement during jump
      const jumpDistance = (Math.random() - 0.5) * 200;
      const newX = Math.max(100, Math.min(700, this.sprite.x + jumpDistance));

      this.scene.tweens.add({
        targets: [this.sprite, this.hitbox],
        x: newX,
        duration: 500,
        ease: 'Power1'
      });
    }
  }

  jumpOverOpponent(opponent) {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpSpeed * 1.2; // Higher jump for crossing over

      // Play jump sound with reduced volume
      this.scene.sound.play('jump', { volume: 0.1 });

      // Calculate landing position on other side of opponent
      const jumpDistance = this.sprite.x < opponent.sprite.x ? 200 : -200;
      const newX = Math.max(100, Math.min(700, opponent.sprite.x + jumpDistance));

      this.scene.tweens.add({
        targets: [this.sprite, this.hitbox],
        x: newX,
        duration: 600,
        ease: 'Power1'
      });
    }
  }

  swapPositionWithOpponent(opponent) {
    if (!this.canSwapPosition || !opponent.canSwapPosition) return;

    const myOldX = this.sprite.x;
    const opponentOldX = opponent.sprite.x;

    // Add transition effect before swap
    if (this.sprite.preFX) {
      const fadeOutFX = this.sprite.preFX.addColorMatrix();
      fadeOutFX.alpha = 0.3;
    }
    if (opponent.sprite.preFX) {
      const fadeOutFX = opponent.sprite.preFX.addColorMatrix();
      fadeOutFX.alpha = 0.3;
    }

    // Swap positions with smooth animation
    this.scene.tweens.add({
      targets: [this.sprite, this.hitbox],
      x: opponentOldX,
      duration: 400,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (this.sprite.preFX) {
          this.sprite.preFX.clear();
          this.sprite.preFX.addGlow(this.stats.color || 0xff0000, 0.5, 0, false, 0.1, 16);
        }
      }
    });

    this.scene.tweens.add({
      targets: [opponent.sprite, opponent.hitbox],
      x: myOldX,
      duration: 400,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (opponent.sprite.preFX) {
          opponent.sprite.preFX.clear();
          opponent.sprite.preFX.addGlow(opponent.stats.color || 0xff0000, 0.5, 0, false, 0.1, 16);
        }
      }
    });

    // Set cooldown
    this.lastSwapTime = this.scene.time.now;
    opponent.lastSwapTime = this.scene.time.now;

    // Add trail effect during swap
    const numTrails = 5;
    for (let i = 0; i < numTrails; i++) {
      const progress = i / (numTrails - 1);
      const trailX1 = myOldX + (opponentOldX - myOldX) * progress;
      const trailX2 = opponentOldX + (myOldX - opponentOldX) * progress;

      setTimeout(() => {
        if (this.sprite.preFX && opponent.sprite.preFX) {
          const trail1 = this.scene.add.sprite(trailX1, this.sprite.y, this.sprite.texture.key);
          const trail2 = this.scene.add.sprite(trailX2, opponent.sprite.y, opponent.sprite.texture.key);

          trail1.setScale(this.sprite.scale);
          trail2.setScale(opponent.sprite.scale);
          trail1.setAlpha(0.3);
          trail2.setAlpha(0.3);

          this.scene.tweens.add({
            targets: [trail1, trail2],
            alpha: 0,
            duration: 200,
            onComplete: () => {
              trail1.destroy();
              trail2.destroy();
            }
          });
        }
      }, progress * 200);
    }
  }

  performAttack(opponent) {
    if (!this.scene || !opponent) return;

    try {
      // Check hitbox collision before attack
      const hitboxesOverlap = Phaser.Geom.Rectangle.Overlaps(
        this.hitbox.getBounds(),
        opponent.hitbox.getBounds()
      );

      // Allow attack if overlapping or very close
      const distance = Math.abs(this.sprite.x - opponent.sprite.x);
      const canAttack = hitboxesOverlap || distance <= this.attackRange;

      if (!canAttack && !this.isJumping) {
        // If not in range, try to get closer
        this.approachOpponent(opponent);
        return;
      }

      // Add attack animation
      const originalX = this.sprite.x;
      const attackDistance = this.sprite.texture.key === '__DEFAULT' ? 30 : 40;
      const attackDuration = 200;

      this.scene.tweens.add({
        targets: [this.sprite, this.hitbox],
        x: this.sprite.x + (this.sprite.x < opponent.sprite.x ? attackDistance : -attackDistance),
        duration: attackDuration / 2,
        ease: 'Power1',
        yoyo: true,
        onComplete: () => {
          this.sprite.x = originalX;
          this.hitbox.x = originalX;
        }
      });

      // Add attack effects based on sprite type
      if (this.sprite.texture.key !== '__DEFAULT') {
        if (this.stats.mana >= this.stats.specialSkill2Cost) {
          // Powerful special attack
          if (this.useSpecialSkill(2)) {
            if (this.sprite.preFX) {
              const glowFX = this.sprite.preFX.addGlow(0xffff00, 1);
              this.scene.tweens.add({
                targets: glowFX,
                intensity: 0,
                duration: 500,
                onComplete: () => glowFX.remove()
              });
            }
            this.scene.attackFighter(this, opponent, 2);
          }
        } else if (this.stats.mana >= this.stats.specialSkill1Cost && Math.random() < 0.7) {
          // Regular special attack
          if (this.useSpecialSkill(1)) {
            if (this.sprite.preFX) {
              const glowFX = this.sprite.preFX.addGlow(0x00ff00, 0.8);
              this.scene.tweens.add({
                targets: glowFX,
                intensity: 0,
                duration: 300,
                onComplete: () => glowFX.remove()
              });
            }
            this.scene.attackFighter(this, opponent, 1);
          }
        } else {
          // Regular attack
          this.scene.attackFighter(this, opponent, 0);
        }
      } else {
        // Simplified effects for default rectangle
        this.scene.attackFighter(this, opponent, 0);
      }
    } catch (error) {
      console.error('Error in performAttack:', error);
    }
  }
} 
