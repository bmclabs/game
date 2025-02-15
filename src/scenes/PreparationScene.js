class PreparationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreparationScene' });
  }

  preload() {
    try {
      // Preload fighter sprites
      const fighters = ['doge', 'shiba', 'pepe', 'mochi', 'floki', 'trump', 'bonk', 'kishu'];
      fighters.forEach(name => {
        try {
          this.load.image(name, `assets/fighters/${name}.png`);
        } catch (error) {
          console.warn(`Failed to load fighter asset: ${name}`);
        }
      });

      // Load VS image
      this.load.image('vs', 'assets/preparation/vs.png');
      
      // Load preparation background
      this.load.image('prep_bg', 'assets/preparation/bg.png');

      // Load arena backgrounds
      for (let i = 1; i <= 5; i++) {
        this.load.image(`arena${i}`, `assets/arena/arena${i}.png`);
      }
    } catch (error) {
      console.error('Error in preload:', error);
    }
  }

  init(data) {
    this.roundNumber = data.roundNumber || 1;
    this.fighter1Stats = data.fighter1Stats;
    this.fighter2Stats = data.fighter2Stats;
    this.currentArena = data.arenaNumber || Math.floor(Math.random() * 5) + 1;
  }

  create() {
    try {
      // Set preparation background
      this.background = this.add.image(400, 300, 'prep_bg');
      this.background.setDisplaySize(800, 600);
      
      // Make sure background is behind everything
      this.background.setDepth(-1);

      // Add semi-transparent overlay for better text visibility
      this.overlay = this.add.rectangle(400, 300, 800, 600, 0x000033, 0.3);
      this.overlay.setDepth(-0.5);

      // Add battle stage platform with transparency
      this.platform = this.add.rectangle(400, 500, 700, 40, 0x333333, 0.7);
      this.platform.setDepth(0);

      // Add preparation timer with enhanced styling (moved up)
      this.preparationTimer = 15;
      this.timerText = this.add.text(400, 50, '', {
        fontSize: '48px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      // Create fighters with UI hidden
      this.fighter1 = new Fighter(this, 200, 350, this.fighter1Stats, true);
      this.fighter2 = new Fighter(this, 600, 350, this.fighter2Stats, false);

      // Set initial facing directions
      this.fighter1.updateFacing(1); // Face right
      this.fighter2.updateFacing(-1); // Face left

      // Hide UI for both fighters
      this.fighter1.hideUI();
      this.fighter2.hideUI();

      // Add fighter names with larger font and glow effect (moved up)
      const nameConfig = {
        fontSize: '48px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: { color: '#000000', blur: 10, fill: true }
      };

      this.add.text(200, 100, this.fighter1Stats.name, nameConfig).setOrigin(0.5);
      this.add.text(600, 100, this.fighter2Stats.name, nameConfig).setOrigin(0.5);

      // Add VS image with enhanced animation (aligned with fighters)
      this.vsSprite = this.add.sprite(400, 350, 'vs');
      this.vsSprite.setOrigin(0.5);
      
      // Scale VS sprite to appropriate size
      const desiredWidth = 200;
      const scale = desiredWidth / this.vsSprite.width;
      this.vsSprite.setScale(scale);

      // Add glow effect to VS sprite
      if (this.vsSprite.preFX) {
        this.vsSprite.preFX.addGlow(0xffd700, 0.5, 0, false, 0.1, 16);
      }

      // Create VS sprite animation
      this.tweens.add({
        targets: this.vsSprite,
        scaleX: scale * 1.2,
        scaleY: scale * 1.2,
        alpha: 0.8,
        yoyo: true,
        repeat: -1,
        duration: 1000,
        ease: 'Sine.easeInOut'
      });

      // Add pulsing effect to fighter sprites
      const fighters = [this.fighter1, this.fighter2];
      fighters.forEach(fighter => {
        if (fighter.sprite.texture.key !== '__DEFAULT') {
          // Add floating animation
          this.tweens.add({
            targets: fighter.sprite,
            y: fighter.sprite.y - 20,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });

          // Add subtle scale animation
          this.tweens.add({
            targets: fighter.sprite,
            scaleX: fighter.sprite.scaleX * 1.1,
            scaleY: fighter.sprite.scaleY * 1.1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      });

      // Pass arena number to battle scene
      this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
      });
    } catch (error) {
      console.error('Error in create:', error);
    }
  }

  updateTimer() {
    try {
      this.preparationTimer--;
      this.timerText.setText(this.preparationTimer.toString());

      if (this.preparationTimer <= 0) {
        // Stop all tweens before transitioning
        this.tweens.killAll();

        // Reset fighter positions and scales
        [this.fighter1, this.fighter2].forEach(fighter => {
          if (fighter.sprite.texture.key !== '__DEFAULT') {
            fighter.sprite.setScale(fighter.sprite.scaleX / 1.1);
            fighter.sprite.y = 400;
          }
        });

        this.scene.start('BattleScene', {
          roundNumber: this.roundNumber,
          fighter1Stats: this.fighter1Stats,
          fighter2Stats: this.fighter2Stats,
          arenaNumber: this.currentArena
        });
      }
    } catch (error) {
      console.error('Error in updateTimer:', error);
    }
  }
} 
