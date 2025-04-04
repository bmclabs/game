class EmergencyRefundScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EmergencyRefundScene' });
    this.retryCount = 0;
    this.maxRetries = 3;
    this.refundProcessed = false;
  }

  init(data) {
    // Store scene data
    this.fighter1Stats = data?.fighter1Stats;
    this.fighter2Stats = data?.fighter2Stats;
    this.arenaNumber = data?.arenaNumber;
    this.roundNumber = data?.roundNumber;
    this.fighter1Score = data?.fighter1Score;
    this.fighter2Score = data?.fighter2Score;
    this.matchId = data?.matchId;
    
    console.log('EmergencyRefundScene initialized with matchId:', this.matchId);
  }

  create() {
    // Add background
    this.background = this.add.image(400, 300, 'prep_bg');
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    this.background.setDepth(-1);
    

    // Add emergency refund text
    this.add.text(400, 200, 'EMERGENCY REFUND', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5);
    
    // Add explanation text
    this.add.text(400, 270, 'Processing refund for all players...', {
      fontSize: '24px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
    
    // Add status text
    this.statusText = this.add.text(400, 350, 'Initiating refund process...', {
      fontSize: '20px',
      fill: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);
    
    // Add match ID text if available
    if (this.matchId) {
      this.add.text(400, 390, `Match ID: ${this.matchId}`, {
        fontSize: '16px',
        fill: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 2,
        align: 'center'
      }).setOrigin(0.5);
    }

    // Start emergency refund process
    this.processEmergencyFund();
  }

  processEmergencyFund() {
    // Don't retry if already processed successfully
    if (this.refundProcessed) {
      return;
    }
    
    console.log(`Processing emergency refund (Attempt ${this.retryCount + 1}/${this.maxRetries})`);
    this.statusText.setText(`Processing refund (Attempt ${this.retryCount + 1}/${this.maxRetries})...`);
    
    // Call emergency refund API
    gameApiClient.sendEmergencyRefund()
      .then(response => {
        console.log('Emergency refund response:', response);
        
        // If successful, mark as processed and go back to searching match
        if (response && response.success === true) {
          this.refundProcessed = true;
          this.statusText.setText('Refund processed successfully!');
          
          // Show transaction info if available
          if (response.transaction) {
            const txText = this.add.text(400, 430, `Transaction: ${response.transaction.substring(0, 16)}...`, {
              fontSize: '14px',
              fill: '#aaffaa',
              fontStyle: 'bold',
              stroke: '#000',
              strokeThickness: 1
            }).setOrigin(0.5);
          }
          
          // Return to searching match scene after a delay
          this.time.delayedCall(3000, () => {
            this.scene.start('SearchingMatchScene');
          });
        } else {
          // If not successful, retry or go to paused scene
          this.handleFailedEmergencyFund();
        }
      })
      .catch(error => {
        console.error('Error processing emergency refund:', error);
        this.statusText.setText(`Error: ${error.message || 'Failed to process refund'}`);
        this.handleFailedEmergencyFund();
      });
  }

  handleFailedEmergencyFund() {
    this.retryCount++;
    
    if (this.retryCount < this.maxRetries) {
      // Retry after delay
      this.statusText.setText(`Refund failed. Retrying in 2 seconds... (${this.retryCount}/${this.maxRetries})`);
      this.time.delayedCall(2000, () => {
        this.processEmergencyFund();
      });
    } else {
      // Max retries reached, go to paused scene
      console.log('Max retries reached for emergency refund, moving to paused scene');
      this.statusText.setText('Max retries reached. Moving to paused scene...');
      this.time.delayedCall(2000, () => {
        this.scene.start('PausedScene');
      });
    }
  }
}

// Register the scene globally
window.EmergencyRefundScene = EmergencyRefundScene; 