class ShibaSkill1 {
  constructor(fighter) {
    this.fighter = fighter;
    this.scene = fighter.scene;
    this.name = "Shiba Slash";
    this.description = "Shiba performs a quick series of slashes that deal damage to the opponent";
    this.manaCost = 25;
    this.cooldown = 4000; // 4 seconds cooldown
    this.lastUsed = 0;
    this.damage = 1.8; // Multiplier for fighter's base attack
    this.slashCount = 3; // Number of slashes
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
    this.fighter.sprite.play('shiba_skill1', true);
    
    // Add log message
    this.fighter.addLogMessage(`${this.fighter.stats.name} uses ${this.name}!`, '#ff9900');
    
    // Set a timeout to reset skill state if animation doesn't complete
    this.scene.time.delayedCall(1500, () => {
      if (this.fighter.isUsingSkill) {
        console.log(`${this.fighter.stats.name} skill animation timed out, resetting state`);
        this.fighter.isUsingSkill = false;
        this.fighter.sprite.play('shiba_idle', true);
      }
    });
    
    // Perform the slashes with slight delay between each
    this.performSlashes();
    
    // Handle skill completion
    this.fighter.sprite.once('animationcomplete', () => {
      // Reset skill state
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
  
  performSlashes() {
    const target = this.fighter.scene.getOpponent(this.fighter);
    if (!target) return;
    
    // Calculate base damage
    const baseDamage = this.fighter.stats.baseAttack * this.damage / this.slashCount;
    
    // Perform each slash with a delay
    for (let i = 0; i < this.slashCount; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        // Create slash effect
        this.createSlashEffect(i);
        
        // Apply damage
        if (target && this.isTargetInRange(target)) {
          // Calculate damage with critical chance
          const isCritical = Math.random() * 100 < this.fighter.stats.critical;
          const damage = baseDamage * (isCritical ? 2 : 1);
          
          // Apply damage
          const actualDamage = target.takeDamage(damage);
          
          // Add log message for the last slash only to avoid spam
          if (i === this.slashCount - 1) {
            this.fighter.addLogMessage(
              `${this.name} hit ${this.slashCount} times for ${Math.floor(actualDamage * this.slashCount)} total damage!`,
              '#ff9900'
            );
          }
        }
      });
    }
  }
  
  createSlashEffect(slashIndex) {
    // Get target position
    const target = this.fighter.scene.getOpponent(this.fighter);
    if (!target) return;
    
    // Calculate effect position (vary slightly for each slash)
    const offsetX = (slashIndex - 1) * 20;
    const offsetY = (slashIndex - 1) * -15;
    const effectX = target.sprite.x + offsetX;
    const effectY = target.sprite.y + offsetY;
    
    // Create slash line effect
    const slashLine = this.scene.add.graphics();
    slashLine.lineStyle(3, 0xffaa00, 1);
    
    // Draw different slash patterns based on index
    if (slashIndex % 3 === 0) {
      // Horizontal slash
      slashLine.beginPath();
      slashLine.moveTo(effectX - 40, effectY);
      slashLine.lineTo(effectX + 40, effectY);
      slashLine.strokePath();
    } else if (slashIndex % 3 === 1) {
      // Diagonal slash (top-left to bottom-right)
      slashLine.beginPath();
      slashLine.moveTo(effectX - 30, effectY - 30);
      slashLine.lineTo(effectX + 30, effectY + 30);
      slashLine.strokePath();
    } else {
      // Diagonal slash (top-right to bottom-left)
      slashLine.beginPath();
      slashLine.moveTo(effectX + 30, effectY - 30);
      slashLine.lineTo(effectX - 30, effectY + 30);
      slashLine.strokePath();
    }
    
    // Add slash text
    const slashText = this.scene.add.text(
      effectX, 
      effectY, 
      'SLASH!', 
      { 
        fontFamily: 'Arial', 
        fontSize: 16, 
        color: '#ffaa00',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    slashText.setOrigin(0.5);
    
    // Animate and remove effects
    this.scene.tweens.add({
      targets: [slashLine, slashText],
      alpha: 0,
      duration: 300,
      onComplete: () => {
        slashLine.destroy();
        slashText.destroy();
      }
    });
    
    // Add camera shake effect (small)
    this.scene.cameras.main.shake(100, 0.003);
  }
  
  isTargetInRange(target) {
    if (!target || !target.sprite) return false;
    
    // Calculate distance between fighters
    const distance = Math.abs(this.fighter.sprite.x - target.sprite.x);
    
    // Define attack range (slightly longer than normal attacks)
    const attackRange = 180;
    
    return distance <= attackRange;
  }
}

// Export to global scope
window.ShibaSkill1 = ShibaSkill1; 