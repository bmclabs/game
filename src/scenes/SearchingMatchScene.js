class SearchingMatchScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SearchingMatchScene' });
    this.retryCount = 0;
    this.maxRetries = 3;
    this.dotCount = 0;
  }

  preload() {
    try {
      this.load.image('prep_bg', 'assets/preparation/background.png');
    } catch (error) {
      console.error('Error in preload:', error);
    }
  }

  create() {
    // Add background
    this.background = this.add.image(400, 300, 'prep_bg');
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    this.background.setDepth(-1);

    // Add searching text
    this.searchingText = this.add.text(400, 300, 'SEARCHING FOR MATCH', {
      fontSize: '36px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5);

     // Add animated dots text
     this.dotsText = this.add.text(400, 340, '', {
      fontSize: '36px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5);
    
    this.animateDots();

    // Start searching for match
    this.searchForMatch();
  }

  searchForMatch() {
    console.log(`Searching for match (Attempt ${this.retryCount + 1}/${this.maxRetries})`);
    
    try {
      // Make sure CHARACTERS is defined
      if (typeof CHARACTERS === 'undefined' || !Array.isArray(CHARACTERS) || CHARACTERS.length < 2) {
        console.error('CHARACTERS is not defined or has less than 2 fighters');
        this.handleFailedMatch();
        return;
      }
      
      // Select random fighters
      const availableFighters = [...CHARACTERS];
      
      // Select random fighter 1
      const fighter1Index = Math.floor(Math.random() * availableFighters.length);
      const fighter1 = availableFighters[fighter1Index];
      
      // Remove the first fighter from the array
      availableFighters.splice(fighter1Index, 1);
      
      // Select random fighter 2
      const fighter2Index = Math.floor(Math.random() * availableFighters.length);
      const fighter2 = availableFighters[fighter2Index];
      
      console.log('Selected fighters for next match:', fighter1.name, 'vs', fighter2.name);
      
      // Generate match ID
      const matchId = gameApiClient._generateMatchId();
      
      // Call next-match API with selected fighters
      gameApiClient.sendNextMatchFighters(fighter1, fighter2, matchId)
        .then(response => {
          console.log('Next match response:', response);
          
          // If successful, move to preparation scene
          if (response && response.success === true) {
            // Make sure we have fighter stats from the response
            if (response.fighter1Stats && response.fighter2Stats) {
              console.log(`Moving to PreparationScene with fighters: ${response.fighter1Stats.name} vs ${response.fighter2Stats.name}`);
              console.log(`Game status: ${response.status}`);
              
              // Start PreparationScene with complete data from API response
              this.scene.start('PreparationScene', {
                roundNumber: 1,
                fighter1Stats: response.fighter1Stats,
                fighter2Stats: response.fighter2Stats,
                arenaNumber: Math.floor(Math.random() * 6) + 1,
                gameMode: response.status, // Use status from API response (should be "preparation")
                matchId: response.matchId
              });
            } else {
              console.error('Received successful response but missing fighter stats');
              this.handleFailedMatch();
            }
          } else {
            // If not successful, retry or go to paused scene
            console.error('API call succeeded but response indicates failure');
            this.handleFailedMatch();
          }
        })
        .catch(error => {
          console.error('Error searching for match:', error);
          this.handleFailedMatch();
        });
    } catch (error) {
      console.error('Error selecting fighters:', error);
      this.handleFailedMatch();
    }
  }

  handleFailedMatch() {
    this.retryCount++;
    
    if (this.retryCount < this.maxRetries) {
      // Retry after delay
      this.time.delayedCall(2000, () => {
        this.searchForMatch();
      });
    } else {
      // Max retries reached, go to paused scene
      console.log('Max retries reached, moving to paused scene');
      this.scene.start('PausedScene');
    }
  }

  animateDots() {
    this.time.addEvent({
      delay: 300, // Setiap 300ms update teks
      loop: true,
      callback: () => {
        this.dotCount = (this.dotCount + 1) % 4;
        let dots = '.'.repeat(this.dotCount);
        this.dotsText.setText(`${dots}`);
      }
    });
  }
} 