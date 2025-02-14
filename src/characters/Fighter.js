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
        this.actionDelay = Math.random() * 500 + 300; // Shorter delay between actions
        this.targetPosition = x;
        this.moveSpeed = 4; // Slightly faster movement
        this.attackRange = 80;
        this.isMovingRight = Math.random() < 0.5;
        this.stuckTime = 0;
        this.lastPosition = x;
        this.consecutiveAttacks = 0;

        // Create UI container
        const barWidth = 250;
        const barHeight = 25;
        const barPadding = 5;
        const uiX = isPlayer1 ? 20 : scene.game.config.width - barWidth - 20;
        const uiY = 30;

        // Create UI group
        this.uiGroup = scene.add.group();

        // Create background bars
        this.healthBarBg = scene.add.rectangle(uiX + barWidth / 2, uiY + barHeight / 2, barWidth, barHeight, 0x666666);
        this.manaBarBg = scene.add.rectangle(uiX + barWidth / 2, uiY + barHeight + barPadding + barHeight / 2, barWidth, barHeight, 0x666666);

        // Create health and mana bars
        this.healthBar = scene.add.rectangle(uiX + barWidth / 2, uiY + barHeight / 2, barWidth, barHeight, isPlayer1 ? 0xff0000 : 0xff4444);
        this.manaBar = scene.add.rectangle(uiX + barWidth / 2, uiY + barHeight + barPadding + barHeight / 2, barWidth, barHeight, isPlayer1 ? 0x0000ff : 0x4444ff);

        // Add name text
        this.nameText = scene.add.text(uiX + (isPlayer1 ? 0 : barWidth), uiY - 30, this.stats.name, {
            fontSize: '24px',
            fill: '#ffffff',
            align: isPlayer1 ? 'left' : 'right',
            fontStyle: 'bold'
        }).setOrigin(isPlayer1 ? 0 : 1, 0);

        // Add round indicators
        const indicatorY = uiY + barHeight * 2 + barPadding * 3;
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

        // Add all UI elements to the group
        this.uiGroup.addMultiple([
            this.healthBarBg, this.manaBarBg,
            this.healthBar, this.manaBar,
            this.nameText
        ]);

        // Initially hide the UI
        this.hideUI();
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

    takeDamage(amount) {
        const damage = Math.max(0, amount - this.stats.defend);
        this.stats.hp = Math.max(0, this.stats.hp - damage);
        this.gainMana(damage * 0.5);
        this.updateBars();
        return damage;
    }

    gainMana(amount) {
        this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + amount);
        this.updateBars();
    }

    useSpecialSkill(skillNumber) {
        const cost = skillNumber === 1 ? this.stats.specialSkill1Cost : this.stats.specialSkill2Cost;
        if (this.stats.mana >= cost) {
            this.stats.mana -= cost;
            this.updateBars();
            return true;
        }
        return false;
    }

    attack(target) {
        const isCritical = Math.random() * 100 < this.stats.critical;
        const damage = this.stats.baseAttack * (isCritical ? 2 : 1);
        const actualDamage = target.takeDamage(damage);
        this.gainMana(actualDamage * 0.3);
        return { damage: actualDamage, isCritical };
    }

    reset() {
        this.stats.hp = this.stats.maxHp;
        this.stats.mana = 0;
        this.updateBars();
    }

    update(time, opponent) {
        // Check if fighter is stuck
        if (Math.abs(this.sprite.x - this.lastPosition) < 1) {
            this.stuckTime++;
            if (this.stuckTime > 60) { // If stuck for 1 second (60 frames)
                this.changeDirection();
                this.stuckTime = 0;
            }
        } else {
            this.stuckTime = 0;
        }
        this.lastPosition = this.sprite.x;

        // Update fighter position based on movement
        if (Math.abs(this.sprite.x - this.targetPosition) > this.moveSpeed) {
            const direction = this.sprite.x < this.targetPosition ? 1 : -1;
            const newX = this.sprite.x + direction * this.moveSpeed;
            
            // Check boundaries
            if (newX >= 100 && newX <= 700) {
                this.sprite.x = newX;
            } else {
                this.changeDirection();
            }
        } else {
            // Reached target position, choose new action
            this.chooseNewAction(opponent);
        }

        // Check if it's time for next action
        if (time > this.nextActionTime) {
            const distance = Math.abs(this.sprite.x - opponent.sprite.x);
            
            // Decide next action based on distance and mana
            if (distance <= this.attackRange) {
                this.performAttack(opponent);
                this.consecutiveAttacks++;
                
                // After several consecutive attacks, move away
                if (this.consecutiveAttacks >= 3) {
                    this.moveAway(opponent);
                    this.consecutiveAttacks = 0;
                }
            } else {
                this.approachOpponent(opponent);
                this.consecutiveAttacks = 0;
            }

            // Set next action time
            this.nextActionTime = time + this.actionDelay;
            this.actionDelay = Math.random() * 500 + 300; // Randomize next delay
        }
    }

    changeDirection() {
        this.isMovingRight = !this.isMovingRight;
        const moveDistance = 100 + Math.random() * 100;
        this.targetPosition = this.isMovingRight ? 
            Math.min(700, this.sprite.x + moveDistance) : 
            Math.max(100, this.sprite.x - moveDistance);
    }

    chooseNewAction(opponent) {
        const distance = Math.abs(this.sprite.x - opponent.sprite.x);
        
        if (distance > this.attackRange * 2) {
            // Too far, move closer
            this.approachOpponent(opponent);
        } else if (distance < this.attackRange / 2) {
            // Too close, move away
            this.moveAway(opponent);
        } else {
            // Good range, choose random action
            if (Math.random() < 0.7) {
                this.approachOpponent(opponent);
            } else {
                this.moveAway(opponent);
            }
        }
    }

    approachOpponent(opponent) {
        const offset = this.attackRange / 2 + Math.random() * (this.attackRange / 2);
        this.targetPosition = opponent.sprite.x + (this.sprite.x < opponent.sprite.x ? -offset : offset);
        this.targetPosition = Math.max(100, Math.min(700, this.targetPosition));
    }

    moveAway(opponent) {
        const moveDistance = 100 + Math.random() * 100;
        this.targetPosition = this.sprite.x < opponent.sprite.x ?
            Math.max(100, this.sprite.x - moveDistance) :
            Math.min(700, this.sprite.x + moveDistance);
    }

    performAttack(opponent) {
        if (this.stats.mana >= this.stats.specialSkill2Cost) {
            // Use powerful special if available
            this.useSpecialSkill(2);
            this.scene.attackFighter(this, opponent, 2);
        } else if (this.stats.mana >= this.stats.specialSkill1Cost && Math.random() < 0.7) {
            // Use regular special with 70% chance if available
            this.useSpecialSkill(1);
            this.scene.attackFighter(this, opponent, 1);
        } else {
            // Regular attack
            this.scene.attackFighter(this, opponent, 0);
        }
    }
} 