class Fighter {
    constructor(scene, x, y, stats, isPlayer1) {
        this.scene = scene;
        this.sprite = scene.add.rectangle(x, y, 50, 100, stats.color || 0xff0000);
        this.isPlayer1 = isPlayer1;
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

        // Fighting style properties
        this.nextActionTime = 0;
        this.actionDelay = Math.random() * 300 + 200;
        this.targetPosition = x;
        this.moveSpeed = 4;
        this.attackRange = 70;
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
                (uiX + barWidth - indicatorRadius - (1-i) * indicatorSpacing);
            
            this.roundIndicators[i] = scene.add.circle(x, indicatorY, indicatorRadius, 0x666666);
            this.uiGroup.add(this.roundIndicators[i]);
        }

        // Add logger system
        this.logMessages = [];
        this.maxLogMessages = 4;
        
        // Create logger container with adjusted position
        const loggerY = scene.game.config.height - 180; // Moved up higher
        const loggerX = isPlayer1 ? 20 : scene.game.config.width - 20;
        
        // Create log background
        this.logBackground = scene.add.rectangle(
            isPlayer1 ? 125 : scene.game.config.width - 125,
            scene.game.config.height - 120,
            250,
            120,
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
        
        // Add log message for damage taken
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
        
        // Clear log messages but keep the UI visible
        this.logMessages = [];
        this.updateLogDisplay();
    }

    update(time, opponent) {
        if (!this.scene || !this.scene.isGameActive) return;
        
        try {
            const distance = Math.abs(this.sprite.x - opponent.sprite.x);
            
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
                    this.sprite.x = newX;
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
        } catch (error) {
            console.error('Error in Fighter update:', error);
        }
    }

    approachOpponent(opponent) {
        // Calculate optimal attack position
        const baseOffset = this.attackRange * 0.7; // Reduced from attackRange to make movement more natural
        const randomOffset = Math.random() * (this.attackRange * 0.3); // Add some randomness
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

    performAttack(opponent) {
        if (!this.scene || !opponent) return;
        
        try {
            if (this.stats.mana >= this.stats.specialSkill2Cost) {
                // Use powerful special if available
                if (this.useSpecialSkill(2)) {
                    this.scene.attackFighter(this, opponent, 2);
                }
            } else if (this.stats.mana >= this.stats.specialSkill1Cost && Math.random() < 0.7) {
                // Use regular special with 70% chance if available
                if (this.useSpecialSkill(1)) {
                    this.scene.attackFighter(this, opponent, 1);
                }
            } else {
                // Regular attack
                this.scene.attackFighter(this, opponent, 0);
            }
        } catch (error) {
            console.error('Error in performAttack:', error);
        }
    }
} 