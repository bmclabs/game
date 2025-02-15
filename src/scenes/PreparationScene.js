class PreparationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreparationScene' });
    }

    init(data) {
        this.roundNumber = data.roundNumber || 1;
        this.fighter1Stats = data.fighter1Stats;
        this.fighter2Stats = data.fighter2Stats;
    }

    create() {
        // Set background
        this.add.rectangle(400, 300, 800, 600, 0x000033);

        // Add battle stage platform
        this.add.rectangle(400, 500, 700, 40, 0x333333);

        // Create fighters with UI hidden
        this.fighter1 = new Fighter(this, 200, 400, this.fighter1Stats, true);
        this.fighter2 = new Fighter(this, 600, 400, this.fighter2Stats, false);

        // Hide UI for both fighters
        this.fighter1.hideUI();
        this.fighter2.hideUI();

        // Add fighter names with larger font and glow effect
        const nameConfig = {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { color: '#000000', blur: 10, fill: true }
        };

        this.add.text(200, 200, this.fighter1Stats.name, nameConfig).setOrigin(0.5);
        this.add.text(600, 200, this.fighter2Stats.name, nameConfig).setOrigin(0.5);

        // Add VS text with enhanced animation
        this.vsText = this.add.text(400, 300, 'VS', {
            fontSize: '72px',
            fill: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { color: '#ffd700', blur: 15, fill: true }
        }).setOrigin(0.5);

        // Add preparation timer with enhanced styling
        this.preparationTimer = 15;
        this.timerText = this.add.text(400, 100, '', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Create VS text animation
        this.tweens.add({
            targets: this.vsText,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.8,
            yoyo: true,
            repeat: -1,
            duration: 1000,
            ease: 'Sine.easeInOut'
        });

        // Add pulsing effect to fighter names
        const fighters = [this.fighter1, this.fighter2];
        fighters.forEach(fighter => {
            this.tweens.add({
                targets: fighter.sprite,
                scaleX: 1.1,
                scaleY: 1.1,
                yoyo: true,
                repeat: -1,
                duration: 1500,
                ease: 'Sine.easeInOut'
            });
        });

        // Start the timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        this.preparationTimer--;
        this.timerText.setText(this.preparationTimer.toString());

        if (this.preparationTimer <= 0) {
            // Stop all tweens before transitioning
            this.tweens.killAll();
            
            this.scene.start('BattleScene', {
                roundNumber: this.roundNumber,
                fighter1Stats: this.fighter1Stats,
                fighter2Stats: this.fighter2Stats
            });
        }
    }
} 