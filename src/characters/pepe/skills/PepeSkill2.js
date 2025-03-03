class PepeSkill2 {
  constructor(fighter) {
    this.fighter = fighter;
    this.damage = 25;
    this.manaCost = 40;
  }

  execute() {
    // Set attacking state
    this.fighter.isAttacking = true;
    
    // Store current game state
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
    
    // Create dramatic effect sprite with dash effect
    const dramatic = scene.add.sprite(-200, 300, 'pepe_atlas');
    dramatic.setScale(4);
    dramatic.setDepth(1000);
    dramatic.play('pepe_dramatic');
    
    // Add screen flash
    scene.cameras.main.flash(500, 255, 255, 255, true);
    
    // Animate dramatic dash entrance
    scene.tweens.add({
      targets: dramatic,
      x: { from: -200, to: 400 },
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // Pause for dramatic effect
        scene.time.delayedCall(800, () => {
          // Exit animation
          scene.tweens.add({
            targets: dramatic,
            x: 1000,
            duration: 400,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              dramatic.destroy();
              
              // Resume game state and continue with skill execution
              scene.isGameActive = gameState.isActive;
              
              // Resume fighter animations
              if (this.fighter.sprite.anims) {
                this.fighter.sprite.anims.resume();
              }
              if (this.fighter.target && this.fighter.target.sprite.anims) {
                this.fighter.target.sprite.anims.resume();
              }
              
              // Continue with ulti animation
              this.fighter.sprite.play('pepe_skill2', true);
              scene.cameras.main.shake(300, 0.01);
              
              // Apply effect and damage
              scene.time.delayedCall(300, () => {
                const target = this.fighter.target;
                if (!target) return;
                
                const effectX = target.sprite.x;
                const effectY = target.sprite.y;
                
                const effect = scene.add.sprite(effectX, effectY, 'pepe_atlas');
                effect.setScale(this.fighter.sprite.scale * 2.5);
                effect.setFlipX(!this.fighter.isPlayer1);
                effect.play('pepe_ulti_effect', true);
                
                scene.time.delayedCall(500, () => {
                  target.takeDamage(this.damage, true);
                });
                
                effect.once('animationcomplete', () => {
                  effect.destroy();
                });
              });
              
              // Reset state after animation
              this.fighter.sprite.once('animationcomplete', () => {
                this.fighter.isAttacking = false;
                this.fighter.sprite.play('pepe_idle');
              });
            }
          });
        });
      }
    });
  }
}

window.PepeSkill2 = PepeSkill2;
