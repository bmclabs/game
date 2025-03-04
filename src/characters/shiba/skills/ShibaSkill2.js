class ShibaSkill2 {
  constructor(fighter) {
    this.fighter = fighter;
    this.scene = fighter.scene;
    this.name = "Shiba Fury";
    this.description = "Shiba enters a furious state, unleashing a powerful combo attack";
    this.manaCost = 70;
    this.cooldown = 8000; // 8 seconds cooldown
    this.lastUsed = 0;
    this.damage = 3.5; // Multiplier for fighter's base attack
    this.duration = 2000; // Duration of the fury state
  }
  
  execute() {
    // Check if fighter can use skill
    if (!this.canUseSkill()) {
      return false;
    }
    
    // Consume mana
    this.fighter.stats.mana -= this.manaCost;
    
    // Set last used time
    this.lastUsed = this.scene.time.now;
    
    // Play skill animation
    this.fighter.sprite.play('shiba_skill2', true);
    
    // Add log message
    this.fighter.addLogMessage(`${this.fighter.stats.name} uses ${this.name}!`, '#ff3300');
    
    // Add fury effect to the fighter
    this.addFuryEffect();
    
    // Perform the fury attack sequence
    this.performFurySequence();
    
    // Handle skill completion
    this.fighter.sprite.once('animationcomplete', () => {
      // Reset skill state after animation completes
      this.fighter.isUsingSkill = false;
      
      // Return to idle animation
      this.fighter.sprite.play('shiba_idle', true);
    });
    
    return true;
  }
  
  canUseSkill() {
    // Check if fighter is already attacking, defending, or using another skill
    if (this.fighter.isAttacking || this.fighter.isDefending || this.fighter.isUsingSkill) {
      return false;
    }
    
    // Check if fighter has enough mana
    if (this.fighter.stats.mana < this.manaCost) {
      this.fighter.addLogMessage('Not enough mana!', '#ffffff');
      return false;
    }
    
    // Check if skill is on cooldown
    if (this.scene.time.now - this.lastUsed < this.cooldown) {
      const remainingCooldown = Math.ceil((this.cooldown - (this.scene.time.now - this.lastUsed)) / 1000);
      this.fighter.addLogMessage(`Skill on cooldown (${remainingCooldown}s)!`, '#ffffff');
      return false;
    }
    
    // Set fighter state
    this.fighter.isUsingSkill = true;
    
    return true;
  }
  
  addFuryEffect() {
    // Add glow effect to the fighter
    if (this.fighter.sprite.preFX) {
      // Clear existing effects
      this.fighter.sprite.preFX.clear();
      
      // Add red glow effect
      this.fighter.sprite.preFX.addGlow(0xff3300, 0.8, 0, false, 0.1, 16);
    }
    
    // Add particle effect around the fighter
    const particles = this.scene.add.particles(0, 0, 'particle', {
      frame: 0,
      color: [0xff3300, 0xff5500, 0xff7700],
      colorEase: 'quad.out',
      lifespan: 800,
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      speed: 100,
      advance: 2000,
      blendMode: 'ADD',
      frequency: 50,
      emitting: false
    });
    
    // Position the particles at the fighter
    particles.setPosition(this.fighter.sprite.x, this.fighter.sprite.y);
    
    // Start emitting particles
    particles.start();
    
    // Add camera shake effect
    this.scene.cameras.main.shake(500, 0.005);
    
    // Stop particles and remove effects after duration
    this.scene.time.delayedCall(this.duration, () => {
      particles.stop();
      
      // Remove particle emitter after particles fade
      this.scene.time.delayedCall(800, () => {
        particles.destroy();
      });
      
      // Reset glow effect
      if (this.fighter.sprite.preFX) {
        this.fighter.sprite.preFX.clear();
        this.fighter.sprite.preFX.addGlow(this.fighter.stats.color || 0xff0000, 0.5, 0, false, 0.1, 16);
      }
    });
  }
  
  performFurySequence() {
    const target = this.fighter.scene.getOpponent(this.fighter);
    if (!target) return;
    
    // Check if target is in range
    if (!this.isTargetInRange(target)) {
      // If not in range, dash toward the target first
      this.dashToTarget(target, () => {
        this.executeAttackSequence(target);
      });
    } else {
      // If already in range, execute attack sequence directly
      this.executeAttackSequence(target);
    }
  }
  
  dashToTarget(target, callback) {
    // Calculate direction to target
    const direction = this.fighter.sprite.x < target.sprite.x ? 1 : -1;
    
    // Calculate dash distance (stop short of target)
    const dashDistance = Math.abs(this.fighter.sprite.x - target.sprite.x) - 100;
    
    // Create dash tween
    this.scene.tweens.add({
      targets: this.fighter.sprite,
      x: this.fighter.sprite.x + (direction * dashDistance),
      duration: 300,
      ease: 'Power2',
      onComplete: callback
    });
    
    // Add dash effect
    this.createDashEffect(direction);
  }
  
  createDashEffect(direction) {
    // Create motion blur effect
    for (let i = 1; i <= 5; i++) {
      const alpha = 0.7 - (i * 0.12);
      const afterImage = this.scene.add.sprite(
        this.fighter.sprite.x - (direction * i * 15),
        this.fighter.sprite.y,
        this.fighter.sprite.texture.key,
        this.fighter.sprite.frame.name
      );
      
      afterImage.setAlpha(alpha);
      afterImage.setTint(0xff3300);
      afterImage.setScale(this.fighter.sprite.scaleX, this.fighter.sprite.scaleY);
      afterImage.setFlipX(this.fighter.sprite.flipX);
      
      // Fade out and destroy after-image
      this.scene.tweens.add({
        targets: afterImage,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          afterImage.destroy();
        }
      });
    }
  }
  
  executeAttackSequence(target) {
    // Define attack sequence with delays
    const sequence = [
      { delay: 0, type: 'uppercut' },
      { delay: 300, type: 'punch' },
      { delay: 600, type: 'kick' },
      { delay: 900, type: 'finisher' }
    ];
    
    // Execute each attack in sequence
    sequence.forEach(attack => {
      this.scene.time.delayedCall(attack.delay, () => {
        this.performAttack(target, attack.type);
      });
    });
  }
  
  performAttack(target, attackType) {
    if (!target || !target.sprite || target.isDead) return;
    
    // Calculate base damage for this attack
    let damageMultiplier = 0.5; // Default multiplier for sequence attacks
    let effectColor = 0xff3300; // Default red color
    let effectText = 'HIT!';
    
    // Customize based on attack type
    switch (attackType) {
      case 'uppercut':
        damageMultiplier = 0.6;
        effectText = 'UPPERCUT!';
        break;
      case 'punch':
        damageMultiplier = 0.7;
        effectText = 'PUNCH!';
        break;
      case 'kick':
        damageMultiplier = 0.8;
        effectText = 'KICK!';
        break;
      case 'finisher':
        damageMultiplier = 1.4;
        effectColor = 0xffff00;
        effectText = 'FURY FINISHER!';
        break;
    }
    
    // Calculate damage
    const baseDamage = this.fighter.stats.baseAttack * this.damage * damageMultiplier;
    const isCritical = Math.random() * 100 < this.fighter.stats.critical;
    const damage = baseDamage * (isCritical ? 2 : 1);
    
    // Apply damage
    const actualDamage = target.takeDamage(damage);
    
    // Create visual effect
    this.createAttackEffect(target, attackType, effectColor, effectText);
    
    // Add log message for significant hits
    if (attackType === 'finisher' || isCritical) {
      this.fighter.addLogMessage(
        `${effectText}${isCritical ? ' CRITICAL' : ''} for ${Math.floor(actualDamage)}!`,
        isCritical ? '#ffff00' : '#ff3300'
      );
    }
    
    // Apply knockback on finisher
    if (attackType === 'finisher') {
      this.applyKnockback(target);
    }
  }
  
  createAttackEffect(target, attackType, color, text) {
    // Calculate effect position
    const effectX = target.sprite.x;
    const effectY = target.sprite.y - 20;
    
    // Create impact graphic
    const impact = this.scene.add.graphics();
    impact.fillStyle(color, 0.7);
    
    // Draw different shapes based on attack type
    if (attackType === 'finisher') {
      // Star burst for finisher
      impact.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const innerRadius = 20;
        const outerRadius = 60;
        
        const innerX = effectX + innerRadius * Math.cos(angle);
        const innerY = effectY + innerRadius * Math.sin(angle);
        const outerX = effectX + outerRadius * Math.cos(angle);
        const outerY = effectY + outerRadius * Math.sin(angle);
        
        if (i === 0) {
          impact.moveTo(innerX, innerY);
        } else {
          impact.lineTo(innerX, innerY);
        }
        
        impact.lineTo(outerX, outerY);
      }
      impact.closePath();
      impact.fill();
    } else {
      // Simple circle for other attacks
      impact.fillCircle(effectX, effectY, attackType === 'uppercut' ? 25 : 35);
    }
    
    // Add text
    const hitText = this.scene.add.text(
      effectX, 
      effectY, 
      text, 
      { 
        fontFamily: 'Arial', 
        fontSize: attackType === 'finisher' ? 24 : 18, 
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    hitText.setOrigin(0.5);
    
    // Scale effect for emphasis
    this.scene.tweens.add({
      targets: [hitText],
      scale: 1.3,
      duration: 100,
      yoyo: true
    });
    
    // Fade out and destroy effects
    this.scene.tweens.add({
      targets: [impact, hitText],
      alpha: 0,
      duration: 300,
      onComplete: () => {
        impact.destroy();
        hitText.destroy();
      }
    });
    
    // Add camera shake effect
    const intensity = attackType === 'finisher' ? 0.01 : 0.005;
    this.scene.cameras.main.shake(200, intensity);
  }
  
  applyKnockback(target) {
    if (!target || !target.sprite) return;
    
    // Determine knockback direction
    const direction = this.fighter.sprite.x < target.sprite.x ? 1 : -1;
    
    // Apply knockback
    this.scene.tweens.add({
      targets: target.sprite,
      x: target.sprite.x + (direction * 150),
      y: target.sprite.y - 50,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Return to ground
        this.scene.tweens.add({
          targets: target.sprite,
          y: target.sprite.y + 50,
          duration: 200,
          ease: 'Bounce'
        });
      }
    });
  }
  
  isTargetInRange(target) {
    if (!target || !target.sprite) return false;
    
    // Calculate distance between fighters
    const distance = Math.abs(this.fighter.sprite.x - target.sprite.x);
    
    // Define attack range (slightly longer than normal attacks)
    const attackRange = 200;
    
    return distance <= attackRange;
  }
}

// Export to global scope
window.ShibaSkill2 = ShibaSkill2; 