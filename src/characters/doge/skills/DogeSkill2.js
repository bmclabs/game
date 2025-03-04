class DogeSkill2 {
  constructor(fighter) {
    this.fighter = fighter;
    this.scene = fighter.scene;
    this.name = "To The Moon";
    this.description = "Doge launches into the air and crashes down on enemies for massive damage";
    this.manaCost = 50;
    this.cooldown = 8000; // 8 seconds cooldown
    this.lastUsed = 0;
    this.damage = 2.5; // Multiplier for fighter's base attack
    this.jumpHeight = 200;
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
    
    // Add log message
    this.fighter.addLogMessage(`${this.fighter.stats.name} uses ${this.name}!`, '#00ffff');
    
    // Perform the skill animation sequence
    this.performSkillSequence();
    
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
  
  performSkillSequence() {
    // Play skill animation
    this.fighter.sprite.play('doge_skill2', true);
    
    // Store original position
    const originalY = this.fighter.sprite.y;
    
    // Add rocket effect
    this.addRocketEffect();
    
    // Jump up animation
    this.scene.tweens.add({
      targets: this.fighter.sprite,
      y: originalY - this.jumpHeight,
      duration: 500,
      ease: 'Power2',
      onUpdate: () => {
        // Update hitbox position
        if (this.fighter.hitbox) {
          this.fighter.hitbox.y = this.fighter.sprite.y;
        }
      },
      onComplete: () => {
        // Add moon effect
        this.addMoonEffect();
        
        // Pause briefly at the top
        this.scene.time.delayedCall(300, () => {
          // Crash down animation
          this.scene.tweens.add({
            targets: this.fighter.sprite,
            y: originalY,
            duration: 300,
            ease: 'Bounce.easeOut',
            onUpdate: () => {
              // Update hitbox position
              if (this.fighter.hitbox) {
                this.fighter.hitbox.y = this.fighter.sprite.y;
              }
            },
            onComplete: () => {
              // Apply damage on landing
              this.applyDamageOnLanding();
              
              // Create impact effect
              this.createImpactEffect();
              
              // Reset skill state
              this.scene.time.delayedCall(500, () => {
                this.fighter.isUsingSkill = false;
                this.fighter.sprite.play('doge_idle', true);
              });
            }
          });
        });
      }
    });
    
    // Set a safety timeout to reset skill state if animation sequence doesn't complete
    this.scene.time.delayedCall(3000, () => {
      if (this.fighter.isUsingSkill) {
        console.log(`${this.fighter.stats.name} skill animation timed out, resetting state`);
        this.fighter.isUsingSkill = false;
        this.fighter.sprite.play('doge_idle', true);
        
        // Reset position if stuck in the air
        if (this.fighter.sprite.y !== originalY) {
          this.fighter.sprite.y = originalY;
          if (this.fighter.hitbox) {
            this.fighter.hitbox.y = originalY;
          }
        }
      }
    });
  }
  
  addRocketEffect() {
    // Create rocket flame effect
    const flameX = this.fighter.sprite.x;
    const flameY = this.fighter.sprite.y + 50;
    
    // Create flame particles
    const particles = this.scene.add.particles('doge_atlas');
    const emitter = particles.createEmitter({
      frame: '{doge} #iddle 0.aseprite', // Use a simple frame as particle
      x: flameX,
      y: flameY,
      speed: { min: 50, max: 100 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.2, end: 0.1 },
      lifespan: 500,
      blendMode: 'ADD',
      frequency: 50,
      tint: [0xff8800, 0xff0000]
    });
    
    // Follow the fighter during jump
    this.scene.tweens.add({
      targets: particles,
      y: flameY - this.jumpHeight,
      duration: 500,
      ease: 'Power2'
    });
    
    // Stop and destroy particles after jump
    this.scene.time.delayedCall(800, () => {
      emitter.stop();
      this.scene.time.delayedCall(500, () => {
        particles.destroy();
      });
    });
  }
  
  addMoonEffect() {
    // Create moon image at the top of the jump
    const moonX = this.fighter.sprite.x;
    const moonY = this.fighter.sprite.y - 80;
    
    // Create moon text
    const moonText = this.scene.add.text(
      moonX, 
      moonY, 
      '🌙 TO THE MOON! 🌙', 
      { 
        fontFamily: 'Arial', 
        fontSize: 24, 
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    moonText.setOrigin(0.5);
    
    // Animate moon text
    this.scene.tweens.add({
      targets: moonText,
      scale: 1.5,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        this.scene.tweens.add({
          targets: moonText,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            moonText.destroy();
          }
        });
      }
    });
  }
  
  createImpactEffect() {
    // Create impact effect on landing
    const impactX = this.fighter.sprite.x;
    const impactY = this.fighter.sprite.y + 50;
    
    // Create shockwave circle
    const shockwave = this.scene.add.circle(impactX, impactY, 10, 0xffff00, 0.7);
    
    // Animate shockwave
    this.scene.tweens.add({
      targets: shockwave,
      radius: 150,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        shockwave.destroy();
      }
    });
    
    // Add camera shake effect
    this.scene.cameras.main.shake(300, 0.01);
    
    // Add impact text
    const impactText = this.scene.add.text(
      impactX, 
      impactY - 50, 
      'CRASH!', 
      { 
        fontFamily: 'Arial', 
        fontSize: 32, 
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    impactText.setOrigin(0.5);
    
    // Animate impact text
    this.scene.tweens.add({
      targets: impactText,
      y: impactText.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        impactText.destroy();
      }
    });
  }
  
  applyDamageOnLanding() {
    // Get opponent
    const target = this.fighter.scene.getOpponent(this.fighter);
    
    if (target) {
      // Calculate damage
      const isCritical = Math.random() * 100 < this.fighter.stats.critical;
      const damage = this.fighter.stats.baseAttack * this.damage * (isCritical ? 2 : 1);
      
      // Apply damage
      const actualDamage = target.takeDamage(damage);
      
      // Add log message
      this.fighter.addLogMessage(
        `${this.name}${isCritical ? ' CRITICAL' : ''} for ${actualDamage}!`,
        isCritical ? '#ff0000' : '#00ffff'
      );
      
      // Apply stun effect to target
      if (target.sprite) {
        // Visual indicator of stun
        const stunEffect = this.scene.add.text(
          target.sprite.x,
          target.sprite.y - 70,
          '💫 STUNNED 💫',
          {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
          }
        );
        stunEffect.setOrigin(0.5);
        
        // Animate stun effect
        this.scene.tweens.add({
          targets: stunEffect,
          y: stunEffect.y - 20,
          alpha: 0,
          duration: 1500,
          onComplete: () => {
            stunEffect.destroy();
          }
        });
        
        // Temporarily prevent target from acting
        const originalIsAttacking = target.isAttacking;
        const originalIsDefending = target.isDefending;
        const originalIsUsingSkill = target.isUsingSkill;
        
        target.isAttacking = true;
        target.isDefending = true;
        target.isUsingSkill = true;
        
        // Reset after stun duration
        this.scene.time.delayedCall(1500, () => {
          target.isAttacking = originalIsAttacking;
          target.isDefending = originalIsDefending;
          target.isUsingSkill = originalIsUsingSkill;
        });
      }
    }
  }
}

// Export to global scope
window.DogeSkill2 = DogeSkill2; 