class EmergencyFundScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EmergencyFundScene' });
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  init(data) {
    // Store scene data
    this.fighter1Stats = data?.fighter1Stats;
    this.fighter2Stats = data?.fighter2Stats;
    this.arenaNumber = data?.arenaNumber;
    this.roundNumber = data?.roundNumber;
    this.fighter1Score = data?.fighter1Score;
    this.fighter2Score = data?.fighter2Score;
  }

  create() {
    // Add background
    this.background = this.add.image(400, 300, 'prep_bg');
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    this.background.setDepth(-1);

    // Add emergency fund text
    this.add.text(400, 250, 'EMERGENCY FUND', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5);

    // Add retry count text
    this.retryText = this.add.text(400, 350, `Attempt ${this.retryCount + 1}/${this.maxRetries}`, {
      fontSize: '24px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);

    // Start emergency fund process
    this.processEmergencyFund();
  }

  processEmergencyFund() {
    console.log(`Processing emergency fund (Attempt ${this.retryCount + 1}/${this.maxRetries})`);
    
    // Call emergency fund API
    gameApiClient.sendEmergencyFund()
      .then(response => {
        console.log('Emergency fund response:', response);
        
        // If successful, go back to searching match
        if (response.status === 200) {
          this.scene.start('SearchingMatchScene');
        } else {
          // If not successful, retry or go to paused scene
          this.handleFailedEmergencyFund();
        }
      })
      .catch(error => {
        console.error('Error processing emergency fund:', error);
        this.handleFailedEmergencyFund();
      });
  }

  handleFailedEmergencyFund() {
    this.retryCount++;
    
    if (this.retryCount < this.maxRetries) {
      // Update retry text
      this.retryText.setText(`Attempt ${this.retryCount + 1}/${this.maxRetries}`);
      
      // Retry after delay
      this.time.delayedCall(2000, () => {
        this.processEmergencyFund();
      });
    } else {
      // Max retries reached, go to paused scene
      console.log('Max retries reached for emergency fund, moving to paused scene');
      this.scene.start('PausedScene');
    }
  }
} 