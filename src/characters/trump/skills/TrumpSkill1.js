class TrumpSkill1 {
  constructor(fighter) {
    this.fighter = fighter;
    this.damage = 20;
    this.manaCost = 25;
  }

  execute() {
    if (this.fighter.stats.mana < this.manaCost) {
      this.fighter.addLogMessage(`Need ${this.manaCost} mana!`, '#ff0000');
      return false;
    }

    this.fighter.stats.mana -= this.manaCost;
    this.fighter.updateBars();
    this.fighter.isAttacking = true;

    this.fighter.sprite.play('trump_skill1');

    this.fighter.scene.time.delayedCall(200, () => {
      const target = this.fighter.target;
      if (!target) return;

      const effect = this.fighter.scene.add.sprite(
        target.sprite.x,
        target.sprite.y,
        'trump_atlas'
      );
      effect.setScale(this.fighter.sprite.scale * 1.5);
      effect.play('trump_skill_effect');

      this.fighter.scene.time.delayedCall(200, () => {
        target.takeDamage(this.damage);
        this.fighter.addLogMessage('Skill 1 hit!', '#00ff00');
      });

      effect.once('animationcomplete', () => {
        effect.destroy();
      });
    });

    this.fighter.sprite.once('animationcomplete', () => {
      this.fighter.isAttacking = false;
      this.fighter.sprite.play('trump_idle');
    });

    return true;
  }
}

window.TrumpSkill1 = TrumpSkill1; 