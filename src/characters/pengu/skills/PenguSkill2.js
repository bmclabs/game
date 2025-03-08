class PenguSkill2 {
  constructor(fighter) {
    this.fighter = fighter;
    this.damage = 50;
    this.manaCost = 70;
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
      'pengu_atlas'
    );
    dramatic.setScale(4);
    dramatic.setDepth(-1);
    dramatic.play('pengu_dramatic');

    this.fighter.sprite.play('pengu_skill2', true);

    this.fighter.scene.time.delayedCall(400, () => {
      const target = this.fighter.target;
      if (!target) {
        console.error('No target found for skill');
        return;
      }

      const effectX = target.sprite.x;
      const effectY = target.sprite.y;
      
      const effect = this.fighter.scene.add.sprite(effectX, effectY, 'pengu_atlas');
      effect.setScale(this.fighter.sprite.scale * 3);
      effect.setFlipX(!this.fighter.isPlayer1);
      
      effect.play('pengu_ulti_effect', true);
      effect.setTint(0x00ffff); // Ice blue tint
      
      this.fighter.scene.time.delayedCall(300, () => {
        target.takeDamage(this.damage);
        this.fighter.addLogMessage('Blizzard Strike!', '#00ffff');
      });
      
      effect.once('animationcomplete', () => {
        effect.destroy();
        dramatic.destroy();
      });
    });

    this.fighter.sprite.once('animationcomplete', () => {
      this.fighter.isAttacking = false;
      this.fighter.sprite.play('pengu_idle');
    });

    return true;
  }
} 