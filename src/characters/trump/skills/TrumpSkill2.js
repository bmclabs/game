class TrumpSkill2 {
  constructor(fighter) {
    this.fighter = fighter;
    this.damage = 35;
    this.manaCost = 50;
  }

  execute() {
    if (this.fighter.stats.mana < this.manaCost) {
      this.fighter.addLogMessage(`Need ${this.manaCost} mana!`, '#ff0000');
      return false;
    }

    // Set attacking state
    this.fighter.isAttacking = true;

    const scene = this.fighter.scene;
    const gameState = {
      isActive: scene.isGameActive
    };

    // Pause the game temporarily
    scene.isGameActive = false;

    // Pause fighter animations
    if (this.fighter.sprite.anims) {
      this.fighter.sprite.anims.pause();
    }
    if (this.fighter.target && this.fighter.target.sprite.anims) {
      this.fighter.target.sprite.anims.pause();
    }

    // Create dramatic portrait
    const dramatic = scene.add.sprite(-200, 300, 'trump_atlas');
    dramatic.setScale(4);
    dramatic.setDepth(1000);
    dramatic.play('trump_dramatic');

    // Add screen flash
    scene.cameras.main.flash(500, 255, 255, 255, true);

    // Animate dramatic dash entrance
    scene.tweens.add({
      targets: dramatic,
      x: { from: -200, to: 400 },
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        scene.time.delayedCall(800, () => {
          scene.tweens.add({
            targets: dramatic,
            x: 1000,
            duration: 400,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              dramatic.destroy();
              
              // Resume game state
              scene.isGameActive = gameState.isActive;
              
              // Resume fighter animations
              if (this.fighter.sprite.anims) {
                this.fighter.sprite.anims.resume();
              }
              if (this.fighter.target && this.fighter.target.sprite.anims) {
                this.fighter.target.sprite.anims.resume();
              }
              
              // Continue with ultimate execution
              this.fighter.stats.mana -= this.manaCost;
              this.fighter.updateBars();
              this.fighter.isAttacking = true;

              this.fighter.sprite.play('trump_skill2');
              scene.cameras.main.shake(300, 0.01);

              scene.time.delayedCall(300, () => {
                const target = this.fighter.target;
                if (!target) return;

                // Determine position based on fighter's facing direction
                const facingRight = !this.fighter.sprite.flipX;
                const effectX = this.fighter.sprite.x + (facingRight ? 100 : -100);
                const effectY = this.fighter.sprite.y;

                const effect = scene.add.sprite(
                  effectX,
                  effectY,
                  'trump_atlas'
                );
                effect.setScale(this.fighter.sprite.scale * 2.5);
                effect.setFlipX(this.fighter.sprite.flipX); // Match fighter's orientation
                effect.play('trump_ulti_effect');

                scene.time.delayedCall(200, () => {
                  target.takeDamage(this.damage);
                  this.fighter.addLogMessage('Ultimate hit!', '#ff0000');
                });

                effect.once('animationcomplete', () => {
                  effect.destroy();
                });
              });

              this.fighter.sprite.once('animationcomplete', () => {
                this.fighter.isAttacking = false;
                this.fighter.sprite.play('trump_idle');
              });
            }
          });
        });
      }
    });

    return true;
  }
}

window.TrumpSkill2 = TrumpSkill2; 