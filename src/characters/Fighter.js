class Fighter {
  constructor(scene, x, y, stats, isPlayer1) {
    this.scene = scene;
    this.isPlayer1 = isPlayer1;
    this.fighterName = stats.name.toLowerCase();

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

    // Set initial facing direction based on player number
    // Only call setFlipX if it's a sprite (not a rectangle)
    if (this.sprite.setFlipX) {
      this.sprite.setFlipX(isPlayer1 ? false : true);
    }
    
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

    // Create background bars with depth
    this.healthBarBg = scene.add.rectangle(uiX + barWidth / 2, uiY + healthBarHeight / 2, barWidth, healthBarHeight, 0x666666);
    this.healthBarBg.setDepth(100);

    this.manaBarBg = scene.add.rectangle(uiX + barWidth / 2, uiY + healthBarHeight + barPadding + manaBarHeight / 2, barWidth, manaBarHeight, 0x666666);
    this.manaBarBg.setDepth(100);

    // Create health and mana bars with depth
    this.healthBar = scene.add.rectangle(uiX + barWidth / 2, uiY + healthBarHeight / 2, barWidth, healthBarHeight, isPlayer1 ? 0xff0000 : 0xff4444);
    this.healthBar.setDepth(100);

    this.manaBar = scene.add.rectangle(uiX + barWidth / 2, uiY + healthBarHeight + barPadding + manaBarHeight / 2, barWidth, manaBarHeight, isPlayer1 ? 0x0000ff : 0x4444ff);
    this.manaBar.setDepth(100);

    // Add name text with depth
    this.nameText = scene.add.text(uiX + (isPlayer1 ? 0 : barWidth), uiY - 30, this.stats.name, {
      fontSize: '24px',
      fill: '#ffffff',
      align: isPlayer1 ? 'left' : 'right',
      fontStyle: 'bold'
    }).setOrigin(isPlayer1 ? 0 : 1, 0).setDepth(100);

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
      this.roundIndicators[i].setDepth(100);
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
    this.logBackground.setDepth(100);

    this.logTexts = [];
    for (let i = 0; i < this.maxLogMessages; i++) {
      const text = scene.add.text(loggerX, loggerY + (i * 25), '', {
        fontSize: '16px',
        fill: '#ffffff',
        align: isPlayer1 ? 'left' : 'right',
        fontFamily: 'Arial',
        fixedWidth: 230,
        wordWrap: { width: 230 }
      }).setOrigin(isPlayer1 ? 0 : 1, 0).setDepth(100);

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

    // Add special skill animation properties
    this.specialAnimations = {};
    this.currentSpecialAnimation = null;

    // Add cooldown system for special skills
    this.skillCooldowns = {
      skill1: {
        timer: 0,
        duration: 2000 // 2 seconds cooldown
      },
      skill2: {
        timer: 0,
        duration: 3000 // 3 seconds cooldown
      }
    };

    // Add skill usage tracking
    this.lastAttackTime = 0;
    this.consecutiveNormalAttacks = 0;
    this.damageReceived = 0;

    // Add moon power flag
    this.hasMoonPower = false;
  }

  showUI() {
    // Only show UI if we're in BattleScene
    if (this.scene.scene.key === 'BattleScene') {
      this.uiGroup.setVisible(true);
      if (this.logBackground) this.logBackground.setVisible(true);
      this.logTexts.forEach(text => text.setVisible(true));
    } else {
      // Hide logs in other scenes
      this.uiGroup.setVisible(true);
      if (this.logBackground) this.logBackground.setVisible(false);
      this.logTexts.forEach(text => text.setVisible(false));
    }
  }

  hideUI() {
    this.uiGroup.setVisible(false);
    if (this.logBackground) this.logBackground.setVisible(false);
    this.logTexts.forEach(text => text.setVisible(false));
  }

  updateBars() {
    const healthWidth = (this.stats.hp / this.stats.maxHp) * 250;
    const manaWidth = (this.stats.mana / this.stats.maxMana) * 250;

    this.healthBar.width = Math.max(0, Math.min(250, healthWidth));
    this.manaBar.width = Math.max(0, Math.min(250, manaWidth));
  }

  winRound() {
    // Increment rounds won counter by 1
    this.roundsWon++;
    console.log(`${this.stats.name} won a round. Total rounds won: ${this.roundsWon}`);
    
    // Update round indicators (up to 2)
    for (let i = 0; i < Math.min(this.roundsWon, 2); i++) {
      if (this.roundIndicators && this.roundIndicators[i]) {
        this.roundIndicators[i].setFillStyle(0x00ff00);
      }
    }
    
    // Add log message
    this.addLogMessage(`Won round! Points: ${this.roundsWon}/2`, '#00ff00');
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

    // Track damage received for skill probability
    this.damageReceived += damage;

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
    // Increase mana gain by 100% to ensure enough mana for skill 2
    const adjustedAmount = amount * 2;
    this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + adjustedAmount);
    const gainedMana = this.stats.mana - oldMana;

    if (gainedMana > 0) {
      this.addLogMessage(`Gained ${Math.floor(gainedMana)} mana`, '#6666ff');
    }

    this.updateBars();
  }

  useSpecialSkill(skillNumber) {
    // Make sure we're facing the target before using a special skill if we have setFlipX method
    if (this.target && this.target.sprite && this.sprite.setFlipX) {
      this.updateFacing(this.target);
    }
    
    // Base class implementation - can be overridden by child classes
    const cost = skillNumber === 1 ? this.stats.specialSkill1Cost : this.stats.specialSkill2Cost;
    if (this.stats.mana < cost) {
      return false;
    }

    // Consume mana in base class
    this.stats.mana -= cost;
    this.updateBars();

    // Log skill usage
    const skillName = skillNumber === 1 ? this.stats.specialSkill1Name : this.stats.specialSkill2Name;
    this.addLogMessage(`Using ${skillName}!`, '#00ff00');

    return true;
  }

  attack(target) {
    // Make sure we're facing the target before attacking if we have setFlipX method
    if (target && target.sprite && this.sprite.setFlipX) {
      this.updateFacing(target);
    }
    
    const isCritical = Math.random() * 100 < this.stats.critical;
    const damage = this.stats.baseAttack * (isCritical ? 2 : 1);
    const actualDamage = target.takeDamage(damage);

    // Add moon power healing if active
    if (this.hasMoonPower && this.stats.name === 'Doge') {
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 10);
      this.updateBars();
      this.addLogMessage('Moon power heals 10 HP', '#00ff00');
    }

    // Add log message for attack
    this.addLogMessage(
      `Attack${isCritical ? ' CRITICAL' : ''} for ${actualDamage}!`,
      isCritical ? '#ff0000' : '#ffffff'
    );

    // Increase mana gain from attacks
    this.gainMana(actualDamage * 0.6);
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
    
    // Reset animation to idle if it's a sprite with animations
    if (this.sprite.anims && this.fighterName) {
      this.sprite.play(`${this.fighterName}_idle`);
    }
    
    // Reset flags
    this.isAttacking = false;
    this.isDefending = false;
    this.isJumping = false;
    this.isUsingSkill = false;
    this.moveDirection = 0;
    this.isMoving = false;
    
    // Make sure we're facing the opponent if one exists and we have setFlipX method
    if (this.target && this.target.sprite && this.sprite.setFlipX) {
      this.updateFacing(this.target);
    }

    this.logMessages = [];
    this.updateLogDisplay();
  }

  updateFacing(opponent) {
    // Only proceed if the sprite has the setFlipX method (sprites have it, rectangles don't)
    if (!this.sprite.setFlipX) {
      return;
    }
    
    // If opponent is a direction (number), use that
    if (typeof opponent === 'number') {
      const direction = opponent;
      if (this.isPlayer1) {
        this.sprite.setFlipX(direction < 0);
      } else {
        // For player 2, flip when facing right (positive direction)
        this.sprite.setFlipX(direction > 0);
      }
      return;
    }
    
    // If opponent is an object with sprite, face that opponent
    if (opponent && opponent.sprite) {
      // Always determine facing based on relative position, regardless of player number
      const shouldFaceRight = this.sprite.x < opponent.sprite.x;
      
      // Player 1 should NOT be flipped when facing right
      // Player 2 should be flipped when facing right
      if (this.isPlayer1) {
        this.sprite.setFlipX(!shouldFaceRight);
      } else {
        // FIXED: Player 2 should be flipped when facing LEFT (not right)
        // This means we flip when shouldFaceRight is true
        this.sprite.setFlipX(!shouldFaceRight);
      }
    }
  }

  update(time, opponent) {
    try {
      // ALWAYS update facing first, regardless of state, if we have setFlipX method
      if (opponent && opponent.sprite && this.sprite.setFlipX) {
        this.updateFacing(opponent);
      }
      
      // Update position if jumping
      if (this.isJumping && this.jumpVelocity) {
        // Apply gravity
        this.jumpVelocity += this.gravity;
        
        // Update position
        this.sprite.y += this.jumpVelocity;
        
        // Check if landed
        if (this.sprite.y >= this.groundY) {
          this.sprite.y = this.groundY;
          this.isJumping = false;
          this.jumpVelocity = 0;
          
          // Return to idle animation if it's a sprite with animations
          if (this.sprite.anims && this.fighterName) {
            this.sprite.play(`${this.fighterName}_idle`);
          }
          
          // Update facing again after landing if we have setFlipX method
          if (opponent && opponent.sprite && this.sprite.setFlipX) {
            this.updateFacing(opponent);
          }
        }
      }
      
      // Update hitbox position
      if (this.hitbox) {
        this.hitbox.x = this.sprite.x;
        this.hitbox.y = this.sprite.y;
      }
      
      // Update log display
      this.updateLogDisplay();
      
      // Update AI if not player controlled
      if (!this.isPlayerControlled && opponent) {
        this.updateAI(time, opponent);
      }
      
      // Update last position
      this.lastX = this.sprite.x;
      this.lastY = this.sprite.y;
    } catch (error) {
      console.error(`Error in Fighter update for ${this.stats?.name}:`, error);
    }
  }
  
  updateAI(time, opponent) {
    try {
      // Skip if already attacking or defending
      if (this.isAttacking || this.isDefending || this.isUsingSkill) {
        return;
      }
      
      // Calculate distance to opponent
      const distance = Math.abs(this.sprite.x - opponent.sprite.x);
      
      // Decide what to do based on time
      if (time > this.nextActionTime) {
        // Reset action time with some randomness to make AI less predictable
        this.nextActionTime = time + this.actionDelay + Math.random() * 1000;
        
        // Get fighter's personality traits from stats or use defaults
        const aggressiveness = this.stats.aggressiveness || 50; // 0-100 scale
        const defensiveness = this.stats.defensiveness || 50; // 0-100 scale
        const jumpiness = this.stats.jumpiness || 30; // 0-100 scale
        
        // Adjust strategy based on health and personality
        const healthRatio = this.stats.hp / this.stats.maxHp;
        const opponentHealthRatio = opponent.stats.hp / opponent.stats.maxHp;
        
        // Calculate action probabilities based on health and personality
        let attackProb = aggressiveness * 0.8;
        let defendProb = defensiveness * 0.8;
        let jumpProb = jumpiness * 0.8;
        let moveProb = 50;
        
        // Adjust probabilities based on health
        if (healthRatio < 0.3) {
          // Low health - more defensive
          defendProb += 30;
          attackProb -= 20;
          jumpProb += 10;
        } else if (healthRatio > 0.7 && opponentHealthRatio < 0.5) {
          // High health vs low health opponent - more aggressive
          attackProb += 20;
          defendProb -= 10;
        }
        
        // Adjust probabilities based on distance
        const inAttackRange = distance < (this.attackRange || 150);
        if (inAttackRange) {
          attackProb += 20;
          moveProb -= 20;
        } else {
          moveProb += 20;
          attackProb -= 10;
        }
        
        // Normalize probabilities
        const totalProb = attackProb + defendProb + jumpProb + moveProb;
        attackProb = (attackProb / totalProb) * 100;
        defendProb = (defendProb / totalProb) * 100;
        jumpProb = (jumpProb / totalProb) * 100;
        moveProb = (moveProb / totalProb) * 100;
        
        // Choose action based on probabilities
        const action = Math.random() * 100;
        let currentThreshold = 0;
        
        // Attack action
        if (action < (currentThreshold + attackProb)) {
          if (inAttackRange) {
            // Choose attack type
            const attackType = Math.random() * 100;
            if (attackType < 15 && this.stats.mana >= this.stats.specialSkill2Cost) {
              // Use special skill 2
              console.log(`${this.stats.name} using special skill 2`);
              this.useSpecialSkill(2);
            } else if (attackType < 40 && this.stats.mana >= this.stats.specialSkill1Cost) {
              // Use special skill 1
              console.log(`${this.stats.name} using special skill 1`);
              this.useSpecialSkill(1);
            } else if (attackType < 60) {
              // Kick
              console.log(`${this.stats.name} kicking`);
              this.kick(opponent);
            } else {
              // Normal attack
              console.log(`${this.stats.name} attacking`);
              this.attack(opponent);
            }
          } else {
            // Move toward opponent if not in range
            const direction = this.sprite.x < opponent.sprite.x ? 1 : -1;
            console.log(`${this.stats.name} moving toward opponent`);
            this.move(direction);
            
            // Stop moving after a random time
            this.scene.time.delayedCall(300 + Math.random() * 700, () => {
              this.stopMoving();
            });
          }
        }
        // Defend action
        else if (action < (currentThreshold += defendProb)) {
          console.log(`${this.stats.name} defending`);
          this.defend(true);
          
          // Stop defending after a random time
          this.scene.time.delayedCall(500 + Math.random() * 1000, () => {
            this.defend(false);
          });
        }
        // Jump action
        else if (action < (currentThreshold += jumpProb)) {
          // Decide jump type
          const jumpType = Math.random() * 100;
          if (jumpType < 30 && distance < 200) {
            // Jump over opponent
            console.log(`${this.stats.name} jumping over opponent`);
            this.jumpOverOpponent(opponent);
          } else {
            // Regular jump
            console.log(`${this.stats.name} jumping`);
            this.jump();
          }
        }
        // Move action
        else {
          // Decide movement type
          const moveType = Math.random() * 100;
          if (moveType < 30 && healthRatio < 0.5) {
            // Move away when low health
            console.log(`${this.stats.name} moving away`);
            this.moveAway(opponent);
          } else if (moveType < 70) {
            // Move toward opponent
            console.log(`${this.stats.name} moving toward opponent`);
            this.approachOpponent(opponent);
          } else {
            // Random movement
            const direction = Math.random() < 0.5 ? 1 : -1;
            console.log(`${this.stats.name} moving randomly`);
            this.move(direction);
          }
          
          // Stop moving after a random time
          this.scene.time.delayedCall(300 + Math.random() * 1000, () => {
            this.stopMoving();
          });
        }
      }
    } catch (error) {
      console.error(`Error in updateAI for ${this.stats?.name}:`, error);
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
    if (this.isJumping || this.isAttacking || this.isDefending || this.isUsingSkill) return false;
    
    this.isJumping = true;
    
    // Calculate jump destination (other side of opponent)
    const currentX = this.sprite.x;
    const opponentX = opponent.sprite.x;
    const jumpDistance = 100; // Distance beyond opponent
    
    // Determine jump direction
    const jumpDirection = currentX < opponentX ? 1 : -1;
    const destinationX = opponentX + (jumpDirection * jumpDistance);
    
    // Play jump animation if it's a sprite with animations
    if (this.sprite.anims && this.sprite.play && this.fighterName) {
      const jumpAnim = this.sprite.anims.animationManager.get(`${this.fighterName}_jump`);
      if (jumpAnim) {
        this.sprite.play(`${this.fighterName}_jump`);
      }
    }
    
    // Create jump tween
    this.scene.tweens.add({
      targets: this.sprite,
      x: destinationX,
      y: this.sprite.y - 150, // Jump height
      duration: 800,
      ease: 'Quad.out',
      yoyo: false,
      onComplete: () => {
        // Land at destination
        this.scene.tweens.add({
          targets: this.sprite,
          y: this.groundY,
          duration: 300,
          ease: 'Bounce.out',
          onComplete: () => {
            this.isJumping = false;
            
            // IMPORTANT: Update facing direction to face opponent after landing if we have setFlipX method
            if (opponent && opponent.sprite && this.sprite.setFlipX) {
              this.updateFacing(opponent);
            }
            
            // Return to idle animation if it's a sprite with animations
            if (this.sprite.anims && this.sprite.play && this.fighterName) {
              this.sprite.play(`${this.fighterName}_idle`);
            }
          }
        });
      },
      // Update facing during the jump as well if we have setFlipX method
      onUpdate: () => {
        if (opponent && opponent.sprite && this.sprite.setFlipX) {
          this.updateFacing(opponent);
        }
      }
    });
    
    return true;
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
      const currentTime = this.scene.time.now;
      const distance = Math.abs(this.sprite.x - opponent.sprite.x);

      // Check if we can attack
      const canAttack = Phaser.Geom.Rectangle.Overlaps(
        this.hitbox.getBounds(),
        opponent.hitbox.getBounds()
      ) || distance <= this.attackRange;

      if (!canAttack && !this.isJumping) {
        this.approachOpponent(opponent);
        return;
      }

      // Special skill logic
      const skill1Cost = this.stats.specialSkill1Cost;
      const skill2Cost = this.stats.specialSkill2Cost;
      const currentMana = this.stats.mana;

      // Update cooldown timers
      const skill1Ready = currentTime > this.skillCooldowns.skill1.timer;
      const skill2Ready = currentTime > this.skillCooldowns.skill2.timer;

      if (skill1Ready) this.skillCooldowns.skill1.timer = 0;
      if (skill2Ready) this.skillCooldowns.skill2.timer = 0;

      // Check if skills are available
      const canUseSkill1 = currentMana >= skill1Cost && skill1Ready;
      const canUseSkill2 = currentMana >= skill2Cost && skill2Ready;

      // Force skill 2 usage when available
      let selectedSkill = 0;

      // Always try to use skill 2 first if available
      if (canUseSkill2) {
        selectedSkill = 2;
      }
      // Use skill 1 only if skill 2 is not available
      else if (canUseSkill1 && !canUseSkill2) {
        selectedSkill = 1;
      }

      // Try to use selected skill
      if (selectedSkill > 0) {
        if (this.useSpecialSkill(selectedSkill)) {
          // Short cooldown to ensure more frequent usage
          const cooldownDuration = selectedSkill === 2 ? 2000 : 1500;
          this.skillCooldowns[`skill${selectedSkill}`].timer = currentTime + cooldownDuration;

          // Reset tracking variables
          this.consecutiveNormalAttacks = 0;
          this.damageReceived = 0;

          // Execute the attack
          this.scene.attackFighter(this, opponent, selectedSkill);
          return;
        }
      }

      // If no special skill was used, do regular attack
      this.consecutiveNormalAttacks++;
      this.scene.attackFighter(this, opponent, 0);

      this.lastAttackTime = currentTime;
    } catch (error) {
      console.error('Error in performAttack:', error);
    }
  }

  startSpecialAnimation(animationKey) {
    try {
      // Stop any current animation and ensure cleanup
      if (this.currentSpecialAnimation) {
        this.currentSpecialAnimation.destroy();
        this.currentSpecialAnimation = null;
      }

      // Get animation configuration
      const animation = this.specialAnimations[animationKey];
      if (!animation) return;

      // Create animation elements
      const elements = animation.create();

      // Store current animation
      this.currentSpecialAnimation = {
        key: animationKey,
        elements: elements,
        update: () => animation.update(elements),
        destroy: () => {
          animation.destroy(elements);
          this.currentSpecialAnimation = null;
        }
      };

      // Set timeout to stop animation
      const duration = animationKey === 'toTheMoon' ? 4000 : 2000;
      this.scene.time.delayedCall(duration, () => {
        if (this.currentSpecialAnimation && this.currentSpecialAnimation.key === animationKey) {
          this.stopSpecialAnimation();
        }
      });
    } catch (error) {
      console.error('Error in startSpecialAnimation:', error);
    }
  }

  stopSpecialAnimation() {
    try {
      if (this.currentSpecialAnimation) {
        // Only stop if it's not To The Moon animation or if To The Moon has completed
        if (this.currentSpecialAnimation.key !== 'toTheMoon' || !this.isToTheMoonActive) {
          this.currentSpecialAnimation.destroy();
          this.currentSpecialAnimation = null;
        }
      }
    } catch (error) {
      console.error('Error in stopSpecialAnimation:', error);
    }
  }

  defend(isDefending) {
    if (this.isHit || this.isAttacking) return;
    
    this.isDefending = isDefending;
    
    if (this.sprite && this.sprite.play) {
      const characterName = this.constructor.name.toLowerCase();
      const animKey = isDefending ? `${characterName}_defense` : `${characterName}_idle`;
      
      if (this.scene.anims.exists(animKey)) {
        this.sprite.play(animKey);
      }
    }
  }

  move(direction) {
    // Don't move if attacking, defending, or using a skill
    if (this.isAttacking || this.isDefending || this.isUsingSkill) return;
    
    // Set movement direction
    this.moveDirection = direction;
    this.isMoving = true;
    
    // Update facing based on movement direction if we have setFlipX method
    if (this.sprite.setFlipX) {
      if (this.target && this.target.sprite) {
        // Always face the opponent while moving
        this.updateFacing(this.target);
      } else {
        // If no opponent, face the direction of movement
        this.updateFacing(direction);
      }
    }
    
    // Play walk animation if available
    if (this.sprite.anims && this.fighterName) {
      const walkAnim = `${this.fighterName}_walk`;
      if (this.scene.anims.exists(walkAnim)) {
        this.sprite.play(walkAnim, true);
      }
    }
  }
  
  stopMoving() {
    this.isMoving = false;
    this.moveDirection = 0;
    
    // Return to idle animation if not in another state and if it's a sprite with animations
    if (!this.isAttacking && !this.isDefending && !this.isJumping && !this.isUsingSkill && 
        this.sprite.anims && this.fighterName) {
      const idleAnim = `${this.fighterName}_idle`;
      if (this.scene.anims.exists(idleAnim)) {
        this.sprite.play(idleAnim, true);
      }
    }
    
    // Make sure we're still facing the opponent if we have setFlipX method
    if (this.target && this.target.sprite && this.sprite.setFlipX) {
      this.updateFacing(this.target);
    }
  }

  kick(target) {
    // Make sure we're facing the target before kicking if we have setFlipX method
    if (target && target.sprite && this.sprite.setFlipX) {
      this.updateFacing(target);
    }
    
    // Calculate kick damage (1.5x base attack)
    const kickDamage = Math.round(this.stats.baseAttack * 1.5);
    const actualDamage = target.takeDamage(kickDamage);
    
    // Add log message for kick
    this.addLogMessage(`Kick for ${actualDamage}!`, '#ffaa00');
    
    // Gain mana from kick
    this.gainMana(actualDamage * 0.8);
    
    return { damage: actualDamage };
  }
}

// Export to global scope
window.Fighter = Fighter; 
