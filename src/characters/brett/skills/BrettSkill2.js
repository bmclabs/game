class BrettSkill2 {
  constructor(fighter) {
    this.fighter = fighter;
    this.damage = 65;
    this.manaCost = 75;
  }

  execute() {
    if (this.fighter.stats.mana < this.manaCost) {
      this.fighter.addLogMessage(`Need ${this.manaCost} mana!`, '#ff0000');
      return false;
    }

    this.fighter.stats.mana -= this.manaCost;
    this.fighter.updateBars();
    
    this.fighter.isAttacking = true;

    // Play dramatic background effect
    const dramatic = this.fighter.scene.add.sprite(
      this.fighter.scene.cameras.main.centerX,
      this.fighter.scene.cameras.main.centerY,
      'brett_atlas'
    );
    dramatic.setScale(4);
    dramatic.setDepth(-1);
    dramatic.play('brett_dramatic');

    this.fighter.sprite.play('brett_skill2', true);

    this.fighter.scene.time.delayedCall(400, () => {
      const target = this.fighter.target;
      if (!target) {
        console.error('No target found for skill');
        return;
      }

      const effectX = target.sprite.x;
      const effectY = target.sprite.y;
      
      const effect = this.fighter.scene.add.sprite(effectX, effectY, 'brett_atlas');
      effect.setScale(this.fighter.sprite.scale * 3);
      effect.setFlipX(!this.fighter.isPlayer1);
      
      effect.play('brett_ulti_effect', true);
      effect.setTint(0xff6b00); // Orange tint
      
      this.fighter.scene.time.delayedCall(300, () => {
        target.takeDamage(this.damage);
        this.fighter.addLogMessage('Mega Power Strike!', '#ff6b00');
      });
      
      effect.once('animationcomplete', () => {
        effect.destroy();
        dramatic.destroy();
      });
    });

    this.fighter.sprite.once('animationcomplete', () => {
      this.fighter.isAttacking = false;
      this.fighter.sprite.play('brett_idle');
    });

    return true;
  }
} 