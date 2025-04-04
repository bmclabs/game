class PausedScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PausedScene' });
    this.pauseStateSet = false;
    this.retryCount = 0;
    this.maxRetries = 1;
  }

  create() {
    // Add background
    this.background = this.add.image(400, 300, 'issue_connecting_bg');
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    this.background.setDepth(-1);

    // Add message text
    this.add.text(400, 510, 'Please contact support for assistance', {
      fontSize: '16px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
    
    // Set the game pause state
    this.setPauseState();
  }
  
  // Set the game pause state
  setPauseState() {
    // Don't attempt to set pause state again if already done
    if (this.pauseStateSet) {
      return;
    }
    
    // Call the API to set the game to paused
    gameApiClient.setGamePauseState(true)
      .then(response => {
        console.log('Game pause state set successfully:', response);
        this.pauseStateSet = true;
      })
      .catch(error => {
        console.error('Failed to set game pause state:', error);
        
        this.retryCount++;
        
        // Only retry if we haven't reached max retries
        if (this.retryCount < this.maxRetries) {
          console.log(`Retry attempt ${this.retryCount}/${this.maxRetries}`);
          // Retry after 5 seconds
          this.time.delayedCall(5000, () => {
            this.pauseStateSet = false;
            this.setPauseState();
          });
        } else {
          console.log('Max retries reached, not attempting to set pause state again');
        }
      });
  }
}

// Register the scene globally
window.PausedScene = PausedScene; 