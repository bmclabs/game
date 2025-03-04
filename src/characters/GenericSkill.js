class GenericSkill {
  constructor(fighter, skillNumber) {
    this.fighter = fighter;
    this.skillNumber = skillNumber;
    this.scene = fighter.scene;
    this.stats = fighter.stats;
    
    // Set skill properties based on skill number
    if (skillNumber === 1) {
      this.name = this.stats.specialSkill1Name || 'Skill 1';
      this.manaCost = this.stats.specialSkill1Cost || 35;
      this.damage = this.stats.specialSkill1Damage || this.stats.baseAttack * 2;
      this.animationKey = `${fighter.fighterName}_skill1`;
      this.effectAnimationKey = `${fighter.fighterName}_skill_effect`;
      this.soundKey = `skill1_sound`;
    } else {
      this.name = this.stats.specialSkill2Name || 'Skill 2';
      this.manaCost = this.stats.specialSkill2Cost || 70;
      this.damage = this.stats.specialSkill2Damage || this.stats.baseAttack * 3.5;
      this.animationKey = `${fighter.fighterName}_skill2`;
      this.effectAnimationKey = `${fighter.fighterName}_ulti_effect`;
      this.soundKey = `skill2_sound`;
    }
    
    console.log(`Created ${this.name} skill for ${fighter.stats.name}, damage: ${this.damage}, cost: ${this.manaCost}`);
  }
  
  use() {
    try {
      // Check if fighter has enough mana
      if (this.fighter.stats.mana < this.manaCost) {
        console.log(`Not enough mana to use ${this.name}`);
        return false;
      }
      
      // Check if fighter is already using a skill
      if (this.fighter.isUsingSkill || this.fighter.isAttacking || this.fighter.isDefending) {
        console.log(`Cannot use ${this.name} - fighter is busy`);
        return false;
      }
      
      console.log(`${this.fighter.stats.name} using ${this.name}`);
      
      // Set using skill flag
      this.fighter.isUsingSkill = true;
      
      // Deduct mana
      this.fighter.stats.mana -= this.manaCost;
      this.fighter.updateBars();
      
      // Add log message
      this.fighter.addLogMessage(`Using ${this.name}!`, '#00ffff');
      
      // Play skill animation
      if (this.scene.anims.exists(this.animationKey)) {
        this.fighter.sprite.play(this.animationKey, true);
      } else {
        console.warn(`Animation ${this.animationKey} not found, using fallback`);
        // Use attack animation as fallback
        const fallbackAnim = `${this.fighter.fighterName}_attack`;
        if (this.scene.anims.exists(fallbackAnim)) {
          this.fighter.sprite.play(fallbackAnim, true);
        }
      }
      
      // Play skill sound
      try {
        if (this.scene.sound.get(this.soundKey)) {
          this.scene.sound.play(this.soundKey, { volume: 0.5 });
        }
      } catch (error) {
        console.warn(`Could not play skill sound: ${error.message}`);
      }
      
      // Create effect sprite if animation exists
      if (this.scene.anims.exists(this.effectAnimationKey)) {
        // Position effect in front of fighter based on the direction they're facing
        // If sprite is flipped (facing left), effect should appear to the left
        // If sprite is not flipped (facing right), effect should appear to the right
        const facingRight = !this.fighter.sprite.flipX;
        const effectX = this.fighter.sprite.x + (facingRight ? 100 : -100);
        const effectY = this.fighter.sprite.y;
        
        // Create effect sprite
        this.effectSprite = this.scene.add.sprite(effectX, effectY, this.fighter.sprite.texture.key);
        this.effectSprite.setScale(this.fighter.sprite.scaleX, this.fighter.sprite.scaleY);
        
        // Match the effect sprite's flip with the fighter's orientation
        this.effectSprite.setFlipX(this.fighter.sprite.flipX);
        
        // Play effect animation
        this.effectSprite.play(this.effectAnimationKey);
        
        // Destroy effect sprite when animation completes
        this.effectSprite.once('animationcomplete', () => {
          this.effectSprite.destroy();
          
          // Apply damage when effect animation completes
          this.applyDamage();
        });
      } else {
        // If no effect animation, apply damage when fighter animation completes
        this.fighter.sprite.once('animationcomplete', () => {
          this.applyDamage();
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error using skill ${this.name}:`, error);
      this.fighter.isUsingSkill = false;
      return false;
    }
  }
  
  applyDamage() {
    // Reset using skill flag
    this.fighter.isUsingSkill = false;
    
    // Apply damage to target
    if (this.fighter.target && typeof this.fighter.target.takeDamage === 'function') {
      // Calculate actual damage with some randomness
      const baseDamage = this.damage;
      const variation = baseDamage * 0.2 * (Math.random() - 0.5); // ±10% variation
      const actualDamage = Math.round(baseDamage + variation);
      
      // Apply critical hit chance
      const criticalChance = this.fighter.stats.critical || 5;
      const isCritical = Math.random() * 100 < criticalChance;
      
      // Apply damage
      const finalDamage = isCritical ? Math.round(actualDamage * 1.5) : actualDamage;
      
      // Log critical hit
      if (isCritical) {
        this.fighter.addLogMessage('Critical hit!', '#ffff00');
      }
      
      console.log(`${this.fighter.stats.name}'s ${this.name} hit ${this.fighter.target.stats.name} for ${finalDamage} damage`);
      
      // Apply damage to target (skills always hit regardless of distance)
      this.fighter.target.takeDamage(finalDamage);
    }
    
    // Play idle animation
    this.fighter.sprite.play(`${this.fighter.fighterName}_idle`, true);
  }
} 