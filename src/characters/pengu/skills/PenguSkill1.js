class PenguSkill1 {
  constructor(fighter) {
    this.fighter = fighter;
    this.damage = 25;
    this.manaCost = 35;
  }

  execute() {
    if (this.fighter.stats.mana < this.manaCost) {
      this.fighter.addLogMessage(`Need ${this.manaCost} mana!`, '#ff0000');
      return false;
    }

    this.fighter.stats.mana -= this.manaCost;
    this.fighter.updateBars();
    
    this.fighter.isAttacking = true;
    
    this.fighter.sprite.play('pengu_skill1', true);

    this.fighter.scene.time.delayedCall(300, () => {
      const target = this.fighter.target;
      if (!target) {
        console.error('No target found for skill');
        return;
      }

      const effectX = target.sprite.x;
      const effectY = target.sprite.y;
      
      const effect = this.fighter.scene.add.sprite(effectX, effectY, 'pengu_atlas');
      effect.setScale(this.fighter.sprite.scale * 2);
      effect.setFlipX(!this.fighter.isPlayer1);
      
      effect.play('pengu_skill_effect', true);
      effect.setTint(0x00ffff); // Ice blue tint
      
      this.fighter.scene.time.delayedCall(200, () => {
        target.takeDamage(this.damage);
        this.fighter.addLogMessage('Ice Strike!', '#00ffff');
      });
      
      effect.once('animationcomplete', () => {
        effect.destroy();
      });
    });

    this.fighter.sprite.once('animationcomplete', () => {
      this.fighter.isAttacking = false;
      this.fighter.sprite.play('pengu_idle');
    });

    return true;
  }
} 