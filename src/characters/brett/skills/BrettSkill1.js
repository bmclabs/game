class BrettSkill1 {
  constructor(fighter) {
    this.fighter = fighter;
    this.damage = 30;
    this.manaCost = 40;
  }

  execute() {
    if (this.fighter.stats.mana < this.manaCost) {
      this.fighter.addLogMessage(`Need ${this.manaCost} mana!`, '#ff0000');
      return false;
    }

    this.fighter.stats.mana -= this.manaCost;
    this.fighter.updateBars();
    
    this.fighter.isAttacking = true;
    
    this.fighter.sprite.play('brett_skill1', true);

    this.fighter.scene.time.delayedCall(300, () => {
      const target = this.fighter.target;
      if (!target) {
        console.error('No target found for skill');
        return;
      }

      const effectX = target.sprite.x;
      const effectY = target.sprite.y;
      
      const effect = this.fighter.scene.add.sprite(effectX, effectY, 'brett_atlas');
      effect.setScale(this.fighter.sprite.scale * 2);
      effect.setFlipX(!this.fighter.isPlayer1);
      
      effect.play('brett_skill_effect', true);
      effect.setTint(0xff6b00); // Orange tint
      
      this.fighter.scene.time.delayedCall(200, () => {
        target.takeDamage(this.damage);
        this.fighter.addLogMessage('Power Strike!', '#ff6b00');
      });
      
      effect.once('animationcomplete', () => {
        effect.destroy();
      });
    });

    this.fighter.sprite.once('animationcomplete', () => {
      this.fighter.isAttacking = false;
      this.fighter.sprite.play('brett_idle');
    });

    return true;
  }
} 