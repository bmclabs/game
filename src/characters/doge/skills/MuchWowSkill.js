class MuchWowSkill {
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

      // Create sparkling particle effect around the character
      const particles = this.scene.add.particles('skill1');
      particles.setDepth(10);
      const emitter = particles.createEmitter({
        x: this.fighter.sprite.x,
        y: this.fighter.sprite.y,
        speed: { min: 30, max: 80 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 0 },
        blendMode: 'ADD',
        lifespan: { min: 600, max: 800 },
        tint: [0xFFD700, 0xFFF000, 0xFFFFFF],
        quantity: 2,
        frequency: 50,
        alpha: { start: 0.6, end: 0 },
        rotate: { min: -180, max: 180 }
      });

      // Add a glow effect to the character
      if (this.fighter.sprite.preFX) {
        this.fighter.sprite.preFX.clear();
        this.fighter.sprite.preFX.addGlow(0xFFD700, 0.8, 0, false, 0.1, 16);
      }

      // Play skill sound effect
      const skill1Sound = this.scene.sound.add('skill1', { volume: 0.3 });
      skill1Sound.play();

      // Store current elements for cleanup
      this.currentElements = {
        particles,
        emitter,
        skill1Sound,
        texts: []
      };

      // Create "WOW" text effects
      this.createWowEffects();

      // Schedule cleanup
      if (!this.cleanupScheduled) {
        this.cleanupScheduled = true;
        this.scene.time.delayedCall(2000, () => {
          this.cleanup();
          // Start cooldown timer after cleanup
          this.scene.time.delayedCall(this.cooldownDuration, () => {
            this.isOnCooldown = false;
          });
        });
      }

      // Update particle position to follow character
      if (this.updateEvent) {
        this.updateEvent.destroy();
      }

      this.updateEvent = this.scene.time.addEvent({
        delay: 16,
        callback: this.updateParticles,
        callbackScope: this,
        loop: true
      });

      return true;
    } catch (error) {
      console.error('Error in MuchWowSkill execute:', error);
      this.cleanup();
      return false;
    }
  }

  updateParticles() {
    if (!this.isActive || !this.currentElements || !this.currentElements.emitter) {
      if (this.updateEvent) {
        this.updateEvent.destroy();
        this.updateEvent = null;
      }
      return;
    }

    try {
      if (!this.currentElements.emitter.destroyed) {
        this.currentElements.emitter.setPosition(this.fighter.sprite.x, this.fighter.sprite.y);
      }
    } catch (error) {
      console.error('Error in updateParticles:', error);
      if (this.updateEvent) {
        this.updateEvent.destroy();
        this.updateEvent = null;
      }
    }
  }

  createWowEffects() {
    const createWowText = () => {
      const x = this.fighter.sprite.x + (Math.random() * 200 - 100);
      const y = this.fighter.sprite.y + (Math.random() * 200 - 100);
      const text = this.scene.add.text(x, y, 'WOW!', {
        fontSize: '32px',
        fill: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      if (this.currentElements) {
        this.currentElements.texts.push(text);
      }

      // Animate the text
      this.scene.tweens.add({
        targets: text,
        y: y - 100,
        alpha: 0,
        scale: 2,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          if (text && !text.destroyed) {
            text.destroy();
            if (this.currentElements) {
              const index = this.currentElements.texts.indexOf(text);
              if (index > -1) this.currentElements.texts.splice(index, 1);
            }
          }
        }
      });
    };

    // Create multiple WOW texts
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 200, createWowText);
    }
  }

  cleanup() {
    if (!this.isActive) return;

    try {
      if (this.currentElements) {
        // Stop and cleanup particles
        if (this.currentElements.particles && !this.currentElements.particles.destroyed) {
          this.currentElements.emitter.stop();
          this.currentElements.particles.destroy();
        }

        // Stop sound
        if (this.currentElements.skill1Sound) {
          this.currentElements.skill1Sound.stop();
        }

        // Clean up remaining texts
        this.currentElements.texts.forEach(text => {
          if (text && !text.destroyed) {
            text.destroy();
          }
        });

        // Stop update event
        if (this.updateEvent) {
          this.updateEvent.destroy();
          this.updateEvent = null;
        }

        // Reset character glow
        if (this.fighter.sprite && this.fighter.sprite.preFX) {
          this.fighter.sprite.preFX.clear();
          this.fighter.sprite.preFX.addGlow(this.fighter.stats.color || 0xff0000, 0.5, 0, false, 0.1, 16);
        }

        this.currentElements = null;
      }

      this.isActive = false;
      this.cleanupScheduled = false;
    } catch (error) {
      console.error('Error in MuchWowSkill cleanup:', error);
      this.isActive = false;
      this.cleanupScheduled = false;
    }
  }
}

// Export to global scope
window.MuchWowSkill = MuchWowSkill; 
