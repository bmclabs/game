class InuImpactSkill {
  constructor(fighter) {
    this.fighter = fighter;
    this.scene = fighter.scene;
    this.isActive = false;
    this.currentElements = null;
    this.cleanupScheduled = false;
    this.isOnCooldown = false;
    this.cooldownDuration = 3000; // 3 seconds cooldown
    this.skillDuration = 5000; // 5 seconds duration
    this.damagePerSecond = 15;
    this.damageInterval = null;
    this.cleanupInProgress = false;
  }

  execute() {
    if (this.isActive || this.isOnCooldown) {
      return false;
    }

    try {
      this.isActive = true;
      this.isOnCooldown = true;
      this.cleanupInProgress = false;

      // Play impact sound effect
      const impactSound = this.scene.sound.add('inu_impact', { volume: 0.5 });
      impactSound.play();

      // Create hell background overlay
      const hellOverlay = this.scene.add.image(400, 300, 'hell_background');
      hellOverlay.setDisplaySize(800, 600);
      hellOverlay.setDepth(-1);
      hellOverlay.setAlpha(0);

      // Add red tint to the scene
      const redTint = this.scene.add.rectangle(400, 300, 800, 600, 0xff0000, 0.2);
      redTint.setDepth(-0.5);
      redTint.setAlpha(0);

      // Store current elements for cleanup
      this.currentElements = {
        impactSound,
        hellOverlay,
        redTint
      };

      // Fade in effects
      this.scene.tweens.add({
        targets: [hellOverlay, redTint],
        alpha: { from: 0, to: 1 },
        duration: 500,
        ease: 'Power2'
      });

      // Start continuous damage
      this.startContinuousDamage();

      // Schedule cleanup
      if (!this.cleanupScheduled) {
        this.cleanupScheduled = true;
        this.scene.time.delayedCall(this.skillDuration, () => {
          this.cleanup();
          // Start cooldown timer after cleanup
          this.scene.time.delayedCall(this.cooldownDuration, () => {
            this.isOnCooldown = false;
          });
        });
      }

      return true;
    } catch (error) {
      console.error('Error in InuImpactSkill execute:', error);
      this.cleanup();
      return false;
    }
  }

  startContinuousDamage() {
    // Apply damage every second
    this.damageInterval = this.scene.time.addEvent({
      delay: 1000, // 1 second
      callback: () => {
        if (this.isActive && this.fighter.scene.fighter1 && this.fighter.scene.fighter2) {
          const target = this.fighter === this.fighter.scene.fighter1
            ? this.fighter.scene.fighter2
            : this.fighter.scene.fighter1;

          target.takeDamage(this.damagePerSecond);
          target.addLogMessage(`Took ${this.damagePerSecond} damage from Inu Impact!`, '#ff0000');
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  cleanup() {
    if (!this.isActive || this.cleanupInProgress) return;

    try {
      this.cleanupInProgress = true;

      // Stop damage interval first
      if (this.damageInterval) {
        this.damageInterval.destroy();
        this.damageInterval = null;
      }

      if (this.currentElements) {
        // Stop sound
        if (this.currentElements.impactSound) {
          this.currentElements.impactSound.stop();
        }

        // Create local references to elements that need to be cleaned up
        const elementsToFade = [];

        if (this.currentElements.hellOverlay && !this.currentElements.hellOverlay.destroyed) {
          elementsToFade.push(this.currentElements.hellOverlay);
        }

        if (this.currentElements.redTint && !this.currentElements.redTint.destroyed) {
          elementsToFade.push(this.currentElements.redTint);
        }

        // Only proceed with fade if we have elements to fade
        if (elementsToFade.length > 0) {
          this.scene.tweens.add({
            targets: elementsToFade,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
              // Destroy elements after fade out
              elementsToFade.forEach(element => {
                if (element && !element.destroyed) {
                  element.destroy();
                }
              });

              // Clear references
              this.currentElements = null;
              this.isActive = false;
              this.cleanupScheduled = false;
              this.cleanupInProgress = false;
            }
          });
        } else {
          // If no elements to fade, clean up immediately
          this.currentElements = null;
          this.isActive = false;
          this.cleanupScheduled = false;
          this.cleanupInProgress = false;
        }
      }
    } catch (error) {
      console.error('Error in InuImpactSkill cleanup:', error);
      // Ensure we reset state even if there's an error
      this.currentElements = null;
      this.isActive = false;
      this.cleanupScheduled = false;
      this.cleanupInProgress = false;
    }
  }
}

// Export to global scope
window.InuImpactSkill = InuImpactSkill; 
