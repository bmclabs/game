class PausedScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PausedScene' });
  }

  create() {
    // Add background
    this.background = this.add.image(400, 300, 'prep_bg');
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    this.background.setDepth(-1);

    // Add paused text
    this.add.text(400, 250, 'GAME PAUSED', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5);

    // Add message text
    this.add.text(400, 350, 'Please contact support for assistance', {
      fontSize: '24px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
  }
} 