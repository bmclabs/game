class ShibaSlashSkill {
  constructor(fighter) {
    this.fighter = fighter;
    this.scene = fighter.scene;
    this.isActive = false;
    this.currentElements = null;
    this.cleanupScheduled = false;
    this.isOnCooldown = false;
    this.cooldownDuration = 2000; // 2 seconds cooldown
  }

  execute() {
    if (this.isActive || this.isOnCooldown) {
      return false;
    }

    try {
      this.isActive = true;
      this.isOnCooldown = true;

      // Play slash sound effect
      const slashSound = this.scene.sound.add('shiba_slash', { volume: 0.3 });
      slashSound.play();

      // Create slash effect container
      const slashContainer = this.scene.add.container(this.fighter.sprite.x, this.fighter.sprite.y);
      slashContainer.setDepth(5);

      // Create red slash graphics
      const slashGraphics = this.scene.add.graphics();
      slashGraphics.lineStyle(4, 0xff0000, 1);
      
      // Create multiple slash lines
      const slashLines = [];
      for (let i = 0; i < 3; i++) {
        const slash = this.scene.add.graphics();
        slash.lineStyle(4, 0xff0000, 1);
        slash.setAlpha(0.8);
        slashLines.push(slash);
        slashContainer.add(slash);
      }

      // Store current elements for cleanup
      this.currentElements = {
        slashSound,
        slashContainer,
        slashLines
      };

      // Animate slashes
      this.animateSlashes(slashLines);

      // Schedule cleanup
      if (!this.cleanupScheduled) {
        this.cleanupScheduled = true;
        this.scene.time.delayedCall(1000, () => {
          this.cleanup();
          // Start cooldown timer after cleanup
          this.scene.time.delayedCall(this.cooldownDuration, () => {
            this.isOnCooldown = false;
          });
        });
      }

      return true;
    } catch (error) {
      console.error('Error in ShibaSlashSkill execute:', error);
      this.cleanup();
      return false;
    }
  }

  animateSlashes(slashLines) {
    const directions = [
      { startX: -50, startY: -30, endX: 50, endY: 30 },
      { startX: -40, startY: 0, endX: 40, endY: 0 },
      { startX: -50, startY: 30, endX: 50, endY: -30 }
    ];

    slashLines.forEach((slash, index) => {
      const direction = directions[index];
      
      // Clear previous lines
      slash.clear();
      
      // Draw initial line
      slash.lineStyle(4, 0xff0000, 1);
      slash.beginPath();
      slash.moveTo(direction.startX, direction.startY);
      slash.lineTo(direction.endX, direction.endY);
      slash.strokePath();

      // Add animation
      this.scene.tweens.add({
        targets: slash,
        alpha: { from: 0.8, to: 0 },
        scaleX: { from: 1, to: 1.5 },
        scaleY: { from: 1, to: 1.5 },
        duration: 500,
        ease: 'Power2',
        delay: index * 100
      });
    });
  }

  cleanup() {
    if (!this.isActive) return;

    try {
      if (this.currentElements) {
        // Stop sound
        if (this.currentElements.slashSound) {
          this.currentElements.slashSound.stop();
        }

        // Clean up slash effects
        if (this.currentElements.slashContainer) {
          this.currentElements.slashLines.forEach(slash => {
            slash.destroy();
          });
          this.currentElements.slashContainer.destroy();
        }

        this.currentElements = null;
      }

      this.isActive = false;
      this.cleanupScheduled = false;
    } catch (error) {
      console.error('Error in ShibaSlashSkill cleanup:', error);
      this.isActive = false;
      this.cleanupScheduled = false;
    }
  }
}

// Export to global scope
window.ShibaSlashSkill = ShibaSlashSkill; 