class ToTheMoonSkill {
  constructor(fighter) {
    this.fighter = fighter;
    this.scene = fighter.scene;
    this.isActive = false;
    this.trails = [];
    this.currentElements = null;
    this.cleanupScheduled = false;
    this.isOnCooldown = false;
    this.cooldownDuration = 3000; // 3 seconds cooldown
  }

  execute() {
    if (this.isActive || this.isOnCooldown) {
      return false;
    }

    try {
      this.isActive = true;
      this.isOnCooldown = true;

      // Play moon sound effect
      const skill2Sound = this.scene.sound.add('skill2', { volume: 0.3 });
      skill2Sound.play();

      // Add dark overlay
      const darkOverlay = this.scene.add.rectangle(400, 300, 800, 600, 0x000033, 0.3);
      darkOverlay.setDepth(-1);

      // Create moon sprite
      const moon = this.scene.add.sprite(400, 80, 'skill2');
      moon.setScale(0.3);
      moon.setDepth(-1);
      moon.setAlpha(0.8);

      if (moon.preFX) {
        moon.preFX.addGlow(0xFFFFFF, 0.3, 0, false, 0.1, 16);
      }

      // Store current elements
      this.currentElements = {
        skill2Sound,
        darkOverlay,
        moon
      };

      // Add healing effect
      this.fighter.stats.hp = Math.min(this.fighter.stats.maxHp, this.fighter.stats.hp + 10);
      this.fighter.updateBars();
      this.fighter.addLogMessage('Moon power heals 10 HP!', '#00ff00');

      // Set moon power flag
      this.fighter.hasMoonPower = true;

      // Animate character jumping with trail effect
      const jumpHeight = -150;
      this.scene.tweens.add({
        targets: this.fighter.sprite,
        y: this.fighter.sprite.y + jumpHeight,
        duration: 1000,
        ease: 'Power2',
        yoyo: true,
        onUpdate: () => this.createTrail(),
        onComplete: () => {
          this.fighter.sprite.y = this.fighter.groundY;
        }
      });

      // Schedule cleanup
      if (!this.cleanupScheduled) {
        this.cleanupScheduled = true;
        this.scene.time.delayedCall(4000, () => {
          this.cleanup();
          // Start cooldown timer after cleanup
          this.scene.time.delayedCall(this.cooldownDuration, () => {
            this.isOnCooldown = false;
          });
        });
      }

      return true;
    } catch (error) {
      console.error('Error in ToTheMoonSkill execute:', error);
      this.cleanup();
      return false;
    }
  }

  createTrail() {
    if (!this.isActive) return;

    try {
      if (Math.random() < 0.15) {
        const trail = this.scene.add.sprite(
          this.fighter.sprite.x,
          this.fighter.sprite.y,
          this.fighter.sprite.texture.key
        );
        trail.setScale(this.fighter.sprite.scaleX * 0.7, this.fighter.sprite.scaleY * 0.7);
        trail.setAlpha(0.15);
        trail.setTint(0x4169E1);
        trail.setDepth(0);
        this.trails.push(trail);

        this.scene.tweens.add({
          targets: trail,
          alpha: 0,
          duration: 150,
          onComplete: () => {
            if (trail && !trail.destroyed) {
              trail.destroy();
              const index = this.trails.indexOf(trail);
              if (index > -1) this.trails.splice(index, 1);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error in createTrail:', error);
    }
  }

  cleanup() {
    if (!this.isActive) return;

    try {
      if (this.currentElements) {
        // Stop moon sound
        if (this.currentElements.skill2Sound) {
          this.currentElements.skill2Sound.stop();
        }

        // Remove moon power
        this.fighter.hasMoonPower = false;
        this.fighter.addLogMessage('Moon power fades away', '#ffff00');

        // Fade out and destroy effects
        const elementsToFade = [this.currentElements.darkOverlay, this.currentElements.moon];
        this.scene.tweens.add({
          targets: elementsToFade,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            // Clean up elements
            elementsToFade.forEach(element => {
              if (element && !element.destroyed) {
                if (element.preFX) element.preFX.clear();
                element.destroy();
              }
            });

            // Clean up trails
            this.trails.forEach(trail => {
              if (trail && !trail.destroyed) {
                trail.destroy();
              }
            });
            this.trails.length = 0;

            // Reset sprite effects
            if (this.fighter.sprite && this.fighter.sprite.preFX) {
              this.fighter.sprite.clearTint();
              this.fighter.sprite.preFX.clear();
              this.fighter.sprite.preFX.addGlow(this.fighter.stats.color || 0xff0000, 0.5, 0, false, 0.1, 16);
            }

            this.currentElements = null;
            this.isActive = false;
            this.cleanupScheduled = false;
          }
        });
      }
    } catch (error) {
      console.error('Error in ToTheMoonSkill cleanup:', error);
      this.isActive = false;
      this.cleanupScheduled = false;
    }
  }
}

// Export to global scope
window.ToTheMoonSkill = ToTheMoonSkill; 
