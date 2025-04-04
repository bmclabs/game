class PausedScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PausedScene' });
    this.programPauseSet = false;
    this.gamePauseSet = false;
    this.programPauseAttempted = false;
    this.gamePauseAttempted = false;
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
    
    // Start pause sequence
    this.setProgramPauseState();
  }
  
  // Set the program pause state first
  setProgramPauseState() {
    // Don't attempt again if already attempted
    if (this.programPauseAttempted) {
      return;
    }

    this.programPauseAttempted = true;
    
    // Call the API to set the program to paused
    gameApiClient.setProgramPauseState(true)
      .then(response => {
        console.log('Program pause state set successfully:', response);
        this.programPauseSet = true;
      })
      .catch(error => {
        console.error('Failed to set program pause state:', error);
      })
      .finally(() => {
        // Move to setting game pause state regardless of success/failure
        this.time.delayedCall(1000, () => {
          this.setGamePauseState();
        });
      });
  }
  
  // Set the game pause state after program pause
  setGamePauseState() {
    // Don't attempt again if already attempted
    if (this.gamePauseAttempted) {
      return;
    }
    
    this.gamePauseAttempted = true;
    
    // Call the API to set the game to paused
    gameApiClient.setGamePauseState(true)
      .then(response => {
        console.log('Game pause state set successfully:', response);
        this.gamePauseSet = true;
      })
      .catch(error => {
        console.error('Failed to set game pause state:', error);
        
      })
  }
}

// Register the scene globally
window.PausedScene = PausedScene; 