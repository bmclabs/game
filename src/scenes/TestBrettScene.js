class TestBrettScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TestBrettScene' });
    this.fighterName = 'Brett';
  }

  preload() {
    // Load Brett assets
    this.load.atlas(
      'brett_atlas',
      'assets/fighters/sprites/brett/BRETT.png',
      'assets/fighters/sprites/brett/BRETT.json'
    );
    
    // Load dummy fighter assets (using Trump as dummy)
    this.load.atlas(
      'trump_atlas',
      'assets/fighters/sprites/trump/TRUMP.png',
      'assets/fighters/sprites/trump/TRUMP.json'
    );
    
    // Load sound effects
    this.load.audio('hit', 'assets/sounds/effects/hit.wav');
    this.load.audio('jump', 'assets/sounds/effects/jump.wav');
    
    // Load background
    this.load.image('arena1', 'assets/arena/arena1.png');
  }

  create() {
    // Add background
    this.add.image(400, 300, 'arena1');

    // Create Brett
    const brettStats = CHARACTERS.find(char => char.name === 'Brett');
    this.fighter = new Brett(this, 300, 400, brettStats, true);

    // Create dummy opponent (Trump)
    const trumpStats = CHARACTERS.find(char => char.name === 'Trump');
    this.dummy = new Trump(this, 500, 400, trumpStats, false);

    // Set target for fighter
    this.fighter.target = this.dummy;

    // Add test buttons
    this.createTestButtons();

    // Add animation status text
    this.animationStatus = this.add.text(400, 150, '', {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: '#222',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  createTestButtons() {
    const buttonStyle = {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#444',
      padding: { x: 10, y: 5 }
    };

    // Attack button
    const attackButton = this.add.text(50, 50, 'Attack', buttonStyle)
      .setInteractive()
      .on('pointerdown', () => {
        this.fighter.attack(this.dummy);
        this.updateAnimationStatus('Attack');
      });

    // Jump button
    const jumpButton = this.add.text(50, 100, 'Jump', buttonStyle)
      .setInteractive()
      .on('pointerdown', () => {
        this.fighter.jump();
        this.updateAnimationStatus('Jump');
      });

    // Skill 1 button
    const skill1Button = this.add.text(50, 150, 'Skill 1', buttonStyle)
      .setInteractive()
      .on('pointerdown', () => {
        this.fighter.useSpecialSkill(1);
        this.updateAnimationStatus('Skill 1');
      });

    // Skill 2 button
    const skill2Button = this.add.text(50, 200, 'Skill 2', buttonStyle)
      .setInteractive()
      .on('pointerdown', () => {
        this.fighter.useSpecialSkill(2);
        this.updateAnimationStatus('Skill 2');
      });

    // Hit button (to test hit animation)
    const hitButton = this.add.text(50, 250, 'Take Hit', buttonStyle)
      .setInteractive()
      .on('pointerdown', () => {
        this.fighter.takeDamage(10);
        this.updateAnimationStatus('Hit');
      });

    // Add mana button
    const addManaButton = this.add.text(50, 300, 'Add Mana', buttonStyle)
      .setInteractive()
      .on('pointerdown', () => {
        this.fighter.stats.mana = Math.min(this.fighter.stats.maxMana, this.fighter.stats.mana + 50);
        this.fighter.updateBars();
      });
  }

  updateAnimationStatus(action) {
    this.animationStatus.setText(`Last Action: ${action}`);
  }

  update() {
    if (this.fighter) {
      this.fighter.update();
    }
    if (this.dummy) {
      this.dummy.update();
    }
  }
} 