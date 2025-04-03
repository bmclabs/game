class ClaimDistributionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ClaimDistributionScene' });
    this.resultSent = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  init(data) {
    console.log('Initializing ClaimDistributionScene with data:', data);
    this.winner = data.winner;
    this.isKO = data.isKO || false;
    this.matchId = data.matchId;
  }

  create() {
    // Add background
    this.background = this.add.image(400, 300, 'prep_bg');
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    this.background.setDepth(-1);

    // Add title text
    this.titleText = this.add.text(400, 150, 'CLAIMING REWARDS', {
      fontSize: '42px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5);

    // Add winner text
    this.winnerText = this.add.text(400, 250, `${this.winner.stats.name.toUpperCase()} WINS!`, {
      fontSize: '36px',
      fill: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5);

    // Add processing text
    this.processingText = this.add.text(400, 350, 'Processing results...', {
      fontSize: '24px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);

    // Add loading spinner animation or pulsing effect
    this.tweens.add({
      targets: this.processingText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Only send match result if it hasn't been sent before
    if (!this.resultSent) {
      this.sendMatchResult();
    } else {
      console.log('Match result already sent, skipping duplicate send');
      this.processingText.setText('Rewards already claimed!');
      
      // Go to next match after a short delay
      this.time.delayedCall(2000, () => {
        this.scene.start('SearchingMatchScene');
      });
    }
  }

  sendMatchResult() {
    // Prevent duplicate API calls
    if (this.resultSent) {
      console.log('Match result already sent, skipping duplicate send');
      return;
    }
    
    console.log(`Sending match result (Attempt ${this.retryCount + 1}/${this.maxRetries})`);
    
    // Update processing text
    this.processingText.setText(`Processing results (Attempt ${this.retryCount + 1}/${this.maxRetries})...`);
    
    // Send match result to backend
    gameApiClient.sendMatchResult(
      this.winner.stats,
      this.isKO
    )
      .then(response => {
        console.log('Match result response:', response);
        
        // If successful (response.success is true), move to SearchingMatchScene
        if (response && response.success === true) {
          // Set flag that result has been sent
          this.resultSent = true;
          
          // Show success message briefly
          this.processingText.setText('Rewards claimed successfully!');
          
          // Delay before moving to next scene
          this.time.delayedCall(2000, () => {
            this.scene.start('SearchingMatchScene');
          });
        } else {
          // If not successful, retry or go to paused scene
          console.error('API call succeeded but response indicates failure');
          this.handleFailedResult();
        }
      })
      .catch(error => {
        console.error('Error sending match result:', error);
        this.handleFailedResult();
      });
  }

  handleFailedResult() {
    this.retryCount++;
    
    if (this.retryCount < this.maxRetries) {
      // Update processing text
      this.processingText.setText(`Processing failed. Retrying (${this.retryCount + 1}/${this.maxRetries})...`);
      
      // Retry after delay
      this.time.delayedCall(2000, () => {
        this.sendMatchResult();
      });
    } else {
      // Set flag that we're done trying (to prevent further retries)
      this.resultSent = true;
      
      // Max retries reached, go to paused scene
      console.log('Max retries reached, moving to paused scene');
      this.processingText.setText('Failed to process results. Please try again later.');
      
      // Delay before moving to paused scene
      this.time.delayedCall(3000, () => {
        this.scene.start('PausedScene');
      });
    }
  }
} 