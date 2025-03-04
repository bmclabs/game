class DogeSkill1 {
  constructor(fighter) {
    this.fighter = fighter;
    this.scene = fighter.scene;
    this.name = "Much Wow";
    this.description = "Doge unleashes a powerful bark that damages and pushes back enemies";
    this.manaCost = 30;
    this.cooldown = 5000; // 5 seconds cooldown
    this.lastUsed = 0;
    this.damage = 1.5; // Multiplier for fighter's base attack
    this.pushbackDistance = 150;
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
    this.fighter.sprite.play('doge_skill1', true);
    
    // Add log message
    this.fighter.addLogMessage(`${this.fighter.stats.name} uses ${this.name}!`, '#ffff00');
    
    // Create visual effect
    this.createVisualEffect();
    
    // Set a timeout to reset skill state if animation doesn't complete
    this.scene.time.delayedCall(1500, () => {
      if (this.fighter.isUsingSkill) {
        console.log(`${this.fighter.stats.name} skill animation timed out, resetting state`);
        this.fighter.isUsingSkill = false;
        this.fighter.sprite.play('doge_idle', true);
      }
    });
    
    // Handle skill completion
    this.fighter.sprite.once('animationcomplete', () => {
      // Apply damage to target if in range
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
          isCritical ? '#ff0000' : '#ffff00'
        );
        
        // Apply pushback effect
        this.applyPushback(target);
      }
      
      // Reset skill state
      this.fighter.isUsingSkill = false;
      
      // Return to idle animation
      this.fighter.sprite.play('doge_idle', true);
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
  
  createVisualEffect() {
    // Create a visual effect for the skill
    const direction = this.fighter.sprite.flipX ? -1 : 1;
    const effectX = this.fighter.sprite.x + (direction * 100);
    const effectY = this.fighter.sprite.y;
    
    // Create effect sprite
    const effect = this.scene.add.sprite(effectX, effectY, 'doge_atlas');
    effect.setScale(2);
    effect.setFlipX(this.fighter.sprite.flipX);
    
    // Play effect animation
    if (this.scene.anims.exists('doge_skill_effect')) {
      effect.play('doge_skill_effect');
    } else {
      // Fallback if specific effect animation doesn't exist
      effect.play('doge_attack');
    }
    
    // Add text effect
    const textEffect = this.scene.add.text(
      effectX, 
      effectY - 50, 
      'MUCH WOW!', 
      { 
        fontFamily: 'Arial', 
        fontSize: 24, 
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    textEffect.setOrigin(0.5);
    
    // Animate text effect
    this.scene.tweens.add({
      targets: textEffect,
      y: textEffect.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        textEffect.destroy();
      }
    });
    
    // Remove effect after animation completes
    effect.once('animationcomplete', () => {
      effect.destroy();
    });
    
    // Add camera shake effect
    this.scene.cameras.main.shake(200, 0.005);
  }
  
  applyPushback(target) {
    if (!target || !target.sprite) return;
    
    // Determine direction based on fighter's position
    const direction = this.fighter.sprite.x < target.sprite.x ? 1 : -1;
    
    // Calculate new position
    const newX = target.sprite.x + (direction * this.pushbackDistance);
    
    // Animate target movement
    this.scene.tweens.add({
      targets: target.sprite,
      x: newX,
      duration: 300,
      ease: 'Power2',
      onUpdate: () => {
        // Update hitbox position
        if (target.hitbox) {
          target.hitbox.x = target.sprite.x;
        }
      }
    });
  }
}

// Export to global scope
window.DogeSkill1 = DogeSkill1; 