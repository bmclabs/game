class FighterFactory {
  static createFighter(scene, x, y, stats, isPlayer1) {
    if (!stats || !stats.name) {
      console.error('Invalid fighter stats provided');
      return null;
    }

    const fighterName = stats.name.toLowerCase();
    console.log(`FighterFactory: Creating fighter ${fighterName}`);
    
    // Check if fighter sprites exist
    const spritePath = `assets/fighters/sprites/${fighterName}/${fighterName.toUpperCase()}`;
    
    // Create a new GenericFighter instance
    try {
      // Ensure the texture is loaded before creating the fighter
      if (!scene.textures.exists(`${fighterName}_atlas`)) {
        console.log(`Texture for ${fighterName} not found, loading now...`);
        this.loadFighterAssets(scene, fighterName, spritePath);
      }
      
      const fighter = new GenericFighter(scene, x, y, stats, isPlayer1);
      
      // Set up additional properties
      fighter.name = stats.name;
      fighter.isPlayer1 = isPlayer1;
      
      console.log(`Successfully created fighter: ${stats.name}`);
      return fighter;
    } catch (error) {
      console.error(`Error creating fighter ${stats.name}:`, error);
      return null;
    }
  }
  
  // Helper method to load fighter assets
  static loadFighterAssets(scene, fighterName, spritePath) {
    try {
      // Load the atlas
      scene.load.atlas(
        `${fighterName}_atlas`,
        `${spritePath}.png`,
        `${spritePath}.json`
      );
      
      // Start loading and wait for completion
      scene.load.start();
      
      console.log(`Started loading assets for ${fighterName}`);
      
      // Return a promise that resolves when loading is complete
      return new Promise((resolve, reject) => {
        scene.load.once('complete', () => {
          console.log(`Successfully loaded atlas for ${fighterName}`);
          resolve();
        });
        
        scene.load.once('loaderror', (fileObj) => {
          console.error(`Failed to load asset: ${fileObj.src}`);
          reject(new Error(`Failed to load asset: ${fileObj.src}`));
        });
      });
    } catch (error) {
      console.error(`Failed to load fighter assets for ${fighterName}:`, error);
      throw error;
    }
  }
  
  // Helper method to preload all fighter assets
  static preloadFighterAssets(scene, characters) {
    console.log('Preloading all fighter assets...');
    
    try {
      // Create a list of assets to preload
      const assetsToPreload = [];
      
      characters.forEach(char => {
        if (!char || !char.name) {
          console.warn('Invalid character data found');
          return;
        }
        
        const fighterName = char.name.toLowerCase();
        const spritePath = `assets/fighters/sprites/${fighterName}/${fighterName.toUpperCase()}`;
        
        if (!scene.textures.exists(`${fighterName}_atlas`)) {
          console.log(`Adding ${fighterName} to preload queue`);
          assetsToPreload.push({
            key: `${fighterName}_atlas`,
            type: 'atlas',
            path: spritePath,
            name: fighterName
          });
        }
      });
      
      // Preload all assets
      assetsToPreload.forEach(asset => {
        scene.load.atlas(
          asset.key,
          `${asset.path}.png`,
          `${asset.path}.json`
        );
        console.log(`Queued ${asset.name} for preloading`);
      });
      
      // Log when loading is complete
      if (assetsToPreload.length > 0) {
        scene.load.once('complete', () => {
          console.log('All fighter assets preloaded successfully');
        });
        
        scene.load.start();
      } else {
        console.log('No new fighter assets to preload');
      }
    } catch (error) {
      console.error('Error preloading fighter assets:', error);
    }
  }
} 