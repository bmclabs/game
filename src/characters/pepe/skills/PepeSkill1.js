class PepeSkill1 {
  constructor(fighter) {
    this.fighter = fighter;
    this.damage = 15;
    this.manaCost = 20;
  }

  execute() {
    console.log('Executing Pepe Skill 1');
    console.log('Current mana:', this.fighter.stats.mana);
    console.log('Mana cost:', this.manaCost);
    
    // Strict mana check
    if (this.fighter.stats.mana < this.manaCost) {
      this.fighter.addLogMessage(`Need ${this.manaCost} mana!`, '#ff0000');
      return false;
    }

    // Consume mana
    this.fighter.stats.mana -= this.manaCost;
    this.fighter.updateBars();
    
    // Set attacking state
    this.fighter.isAttacking = true;
    
    // Play character skill animation
    this.fighter.sprite.play('pepe_skill1', true);

    // Delay effect to sync with animation
    this.fighter.scene.time.delayedCall(300, () => {
      // Get target position
      const target = this.fighter.target;
      if (!target) {
        console.error('No target found for skill');
        return;
      }

      const effectX = target.sprite.x;
      const effectY = target.sprite.y;
      
      // Create effect sprite
      const effect = this.fighter.scene.add.sprite(effectX, effectY, 'pepe_atlas');
      effect.setScale(this.fighter.sprite.scale * 2);
      effect.setFlipX(!this.fighter.isPlayer1);
      
      // Play effect animation
      effect.play('pepe_skill_effect', true);
      effect.setTint(0x00ff00);
      
      // Apply damage after delay
      this.fighter.scene.time.delayedCall(200, () => {
        target.takeDamage(this.damage);
        this.fighter.addLogMessage('Poison effect applied!', '#00ff00');
      });
      
      // Cleanup effect
      effect.once('animationcomplete', () => {
        effect.destroy();
      });
    });

    // Reset state after animation
    this.fighter.sprite.once('animationcomplete', () => {
      this.fighter.isAttacking = false;
      this.fighter.sprite.play('pepe_idle');
    });

    return true;
  }
}

window.PepeSkill1 = PepeSkill1;