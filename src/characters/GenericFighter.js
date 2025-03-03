class GenericFighter extends Fighter {
  constructor(scene, x, y, stats, isPlayer1) {
    // Call parent constructor
    super(scene, x, y, stats, isPlayer1);
    
    // Store fighter name
    this.fighterName = stats.name.toLowerCase();
    
    // Check if atlas is already loaded
    if (scene.textures.exists(`${this.fighterName}_atlas`)) {
      this.setupSprite(x, y, isPlayer1);
    } else {
      // Load the atlas if not already loaded
      scene.load.atlas(
        `${this.fighterName}_atlas`,
        `assets/fighters/sprites/${this.fighterName}/${this.fighterName.toUpperCase()}.png`,
        `assets/fighters/sprites/${this.fighterName}/${this.fighterName.toUpperCase()}.json`
      );
      
      // Setup sprite once loading is complete
      scene.load.once('complete', () => {
        console.log(`Loading complete for ${this.fighterName}`);
        this.setupSprite(x, y, isPlayer1);
      });
      
      scene.load.start();
    }
    
    // Initialize skills
    this.initializeSkills();
  }
  
  setupSprite(x, y, isPlayer1) {
    try {
      console.log(`Setting up sprite for ${this.fighterName} at position (${x}, ${y}), isPlayer1: ${isPlayer1}`);
      
      // Remove old sprite if it exists
      if (this.sprite) {
        this.sprite.destroy();
      }
      
      // Create new sprite
      const atlasKey = `${this.fighterName}_atlas`;
      
      // Check if the texture exists
      if (!this.scene.textures.exists(atlasKey)) {
        console.error(`Texture ${atlasKey} does not exist`);
        this.createFallbackSprite(x, y, isPlayer1);
        return;
      }
      
      // Get the texture frames
      const frames = this.scene.textures.get(atlasKey).getFrameNames();
      
      if (frames.length === 0) {
        console.error(`No frames found for ${atlasKey}`);
        this.createFallbackSprite(x, y, isPlayer1);
        return;
      }
      
      // Log available frames for debugging
      console.log(`Available frames for ${this.fighterName}:`, frames.slice(0, 5), `... (${frames.length} total)`);
      
      // Find a suitable first frame (prefer idle frames)
      let firstFrame = frames.find(frame => frame.includes('#iddle')) || frames[0];
      console.log(`Using first frame: ${firstFrame} for ${this.fighterName}`);
      
      // Create the sprite
      this.sprite = this.scene.add.sprite(x, y, atlasKey, firstFrame);
      
      // Set scale
      const desiredHeight = 200;
      const scale = desiredHeight / this.sprite.height;
      this.sprite.setScale(scale);
      this.sprite.setFlipX(!isPlayer1);
      
      // Create animations
      this.createAnimations();
      
      // Create hitbox
      if (this.hitbox) {
        this.hitbox.destroy();
      }
      
      const width = this.sprite.displayWidth;
      const height = this.sprite.displayHeight;
      this.hitbox = this.scene.add.rectangle(x, y, width * 0.8, height * 0.9);
      this.hitbox.setVisible(false);
      
      // Set sprite origin to match hitbox
      this.sprite.setOrigin(0.5);
      
      // Play idle animation
      this.sprite.play(`${this.fighterName}_idle`);
      
      console.log(`Sprite setup complete for ${this.fighterName}`);
    } catch (error) {
      console.error(`Error setting up sprite for ${this.fighterName}:`, error);
      this.createFallbackSprite(x, y, isPlayer1);
    }
  }
  
  createFallbackSprite(x, y, isPlayer1) {
    console.log(`Creating fallback sprite for ${this.fighterName}`);
    
    // Create a colored rectangle as fallback
    const width = 75;
    const height = 150;
    const color = this.stats.color || 0xff0000;
    
    this.sprite = this.scene.add.rectangle(x, y, width, height, color);
    this.sprite.setOrigin(0.5);
    
    // Create hitbox
    if (this.hitbox) {
      this.hitbox.destroy();
    }
    
    this.hitbox = this.scene.add.rectangle(x, y, width * 0.8, height * 0.9);
    this.hitbox.setVisible(false);
    
    // Add fake animations to prevent errors
    this.createFallbackAnimations();
  }
  
  createFallbackAnimations() {
    // Create dummy animation methods
    this.sprite.play = (key) => {
      console.log(`Attempted to play animation ${key} on fallback sprite`);
      return this.sprite;
    };
    
    this.sprite.on = (event, callback) => {
      if (event === 'animationcomplete') {
        // Auto-trigger animation complete after a delay
        this.scene.time.delayedCall(500, callback);
      }
      return this.sprite;
    };
    
    this.sprite.once = this.sprite.on;
    
    console.log(`Created fallback animations for ${this.fighterName}`);
  }
  
  createAnimations() {
    try {
      // Get the atlas texture
      const atlasKey = `${this.fighterName}_atlas`;
      const texture = this.scene.textures.get(atlasKey);
      
      if (!texture) {
        console.error(`Texture ${atlasKey} not found`);
        return;
      }
      
      // Get all frames from the texture
      const frames = texture.getFrameNames();
      
      if (frames.length === 0) {
        console.error(`No frames found for ${atlasKey}`);
        return;
      }
      
      console.log(`Found ${frames.length} frames for ${this.fighterName}`);
      
      // Map animation names to frame patterns
      const animationMap = {
        'idle': 'iddle',
        'walk_forward': 'way',
        'walk_backward': 'wayback',
        'attack': 'jap',
        'jump': 'jump',
        'skill1': 'skill',
        'skill2': 'ulti',
        'hit': 'hit',
        'death': 'KO',
        'skill_effect': 'effectskill',
        'ulti_effect': 'effectulti',
        'kick': 'kick',
        'defense': 'def',
        'win': 'win'
      };
      
      // Create animations based on frame patterns
      Object.entries(animationMap).forEach(([animKey, tagName]) => {
        // Find all frames that match the pattern
        const animFrames = frames.filter(frame => frame.includes(`#${tagName}`));
        
        if (animFrames.length > 0) {
          // Sort frames by number
          animFrames.sort((a, b) => {
            const numA = parseInt(a.match(/(\d+)\.aseprite$/)?.[1] || '0');
            const numB = parseInt(b.match(/(\d+)\.aseprite$/)?.[1] || '0');
            return numA - numB;
          });
          
          // Create the animation
          const animationKey = `${this.fighterName}_${animKey}`;
          
          // Remove existing animation if it exists
          if (this.scene.anims.exists(animationKey)) {
            this.scene.anims.remove(animationKey);
          }
          
          this.scene.anims.create({
            key: animationKey,
            frames: animFrames.map(frame => ({ key: atlasKey, frame })),
            frameRate: 10,
            repeat: animKey === 'idle' ? -1 : 0
          });
          
          console.log(`Created animation ${animationKey} with ${animFrames.length} frames`);
        } else {
          // If no specific frames found, create fallback animations for essential animations
          if (['idle', 'attack', 'hit'].includes(animKey)) {
            // Create a fallback animation using any available frames
            const fallbackFrames = frames.slice(0, Math.min(5, frames.length));
            
            if (fallbackFrames.length > 0) {
              const animationKey = `${this.fighterName}_${animKey}`;
              
              // Remove existing animation if it exists
              if (this.scene.anims.exists(animationKey)) {
                this.scene.anims.remove(animationKey);
              }
              
              this.scene.anims.create({
                key: animationKey,
                frames: fallbackFrames.map(frame => ({ key: atlasKey, frame })),
                frameRate: 10,
                repeat: animKey === 'idle' ? -1 : 0
              });
              
              console.log(`Created fallback animation ${animationKey} with ${fallbackFrames.length} frames`);
            }
          } else {
            console.log(`No frames found for animation ${animKey} (${tagName})`);
          }
        }
      });
      
      // Play idle animation
      this.sprite.play(`${this.fighterName}_idle`);
    } catch (error) {
      console.error(`Error creating animations for ${this.fighterName}:`, error);
    }
  }
  
  initializeSkills() {
    // Create generic skills
    this.skills = {
      skill1: new GenericSkill(this, 1),
      skill2: new GenericSkill(this, 2)
    };
  }
  
  attack(target) {
    if (this.isAttacking || this.isDefending) return;
    
    this.isAttacking = true;
    
    // Random chance to perform a kick instead of a regular attack
    const kickProbability = this.stats.kickProbability || 0;
    const isKick = Math.random() * 100 < kickProbability;
    
    if (isKick) {
      return this.kick(target);
    }
    
    // Play attack animation
    this.sprite.play(`${this.fighterName}_attack`, true);
    
    // Handle attack completion
    this.sprite.once('animationcomplete', () => {
      this.isAttacking = false;
      
      // Calculate damage
      const damage = this.calculateDamage();
      
      // Check if target is in range for melee attack
      const inRange = this.isTargetInMeleeRange(target);
      
      // Apply damage to target if in range
      if (inRange && target && typeof target.takeDamage === 'function') {
        console.log(`${this.stats.name} hit ${target.stats.name} for ${damage} damage`);
        target.takeDamage(damage);
      } else {
        console.log(`${this.stats.name} missed ${target?.stats?.name || 'target'} - not in range`);
      }
      
      // Gain mana
      this.gainMana(10);
      
      // Play idle animation
      this.sprite.play(`${this.fighterName}_idle`, true);
    });
    
    return true;
  }
  
  kick(target) {
    if (this.isAttacking || this.isDefending) return;
    
    this.isAttacking = true;
    
    // Play kick animation
    this.sprite.play(`${this.fighterName}_kick`, true);
    
    // Handle kick completion
    this.sprite.once('animationcomplete', () => {
      this.isAttacking = false;
      
      // Calculate damage (kicks do more damage)
      const damage = this.calculateDamage() * 1.5;
      
      // Check if target is in range for melee attack
      const inRange = this.isTargetInMeleeRange(target);
      
      // Apply damage to target if in range
      if (inRange && target && typeof target.takeDamage === 'function') {
        console.log(`${this.stats.name} kicked ${target.stats.name} for ${damage} damage`);
        target.takeDamage(damage);
      } else {
        console.log(`${this.stats.name} missed kick on ${target?.stats?.name || 'target'} - not in range`);
      }
      
      // Gain mana
      this.gainMana(15);
      
      // Play idle animation
      this.sprite.play(`${this.fighterName}_idle`, true);
    });
    
    return true;
  }
  
  isTargetInMeleeRange(target) {
    if (!target || !target.sprite || !this.sprite) return false;
    
    // Calculate distance between fighters
    const distance = Math.abs(this.sprite.x - target.sprite.x);
    
    // Define melee range (adjust as needed)
    const meleeRange = 150;
    
    return distance <= meleeRange;
  }
  
  jump() {
    if (this.isJumping || this.isAttacking || this.isDefending || this.isUsingSkill) return false;
    
    this.isJumping = true;
    this.jumpVelocity = -15; // Negative value for upward movement
    
    // Play jump animation
    const jumpAnimKey = `${this.fighterName}_jump`;
    if (this.scene.anims.exists(jumpAnimKey)) {
      this.sprite.play(jumpAnimKey, true);
    }
    
    // Play jump sound
    try {
      const jumpSound = this.scene.sound.add('jump', { volume: 0.3 });
      jumpSound.play();
    } catch (error) {
      console.warn('Jump sound not played:', error);
    }
    
    // Store original y position if not already set
    if (!this.groundY) {
      this.groundY = this.sprite.y;
    }
    
    // Create jump animation
    const jumpTween = this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 100, // Jump height
      duration: 500,
      ease: 'Quad.easeOut',
      yoyo: true,
      onComplete: () => {
        this.isJumping = false;
        
        // Return to idle animation
        this.sprite.play(`${this.fighterName}_idle`, true);
      }
    });
    
    return true;
  }
  
  useSpecialSkill(skillNumber) {
    if (this.isAttacking || this.isDefending || this.isUsingSkill) return false;
    
    // Check if skill exists
    if (!this.skills || !this.skills[`skill${skillNumber}`]) {
      console.error(`Skill ${skillNumber} not found for ${this.fighterName}`);
      return false;
    }
    
    // Use the skill
    return this.skills[`skill${skillNumber}`].use();
  }
  
  takeDamage(amount) {
    // Check if defending
    if (this.isDefending) {
      // Reduce damage when defending
      amount = Math.floor(amount * 0.5);
    }
    
    // Apply damage
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    
    // Update health bar
    this.updateBars();
    
    // Add log message
    this.addLogMessage(`Took ${amount} damage!`, '#ff0000');
    
    // Check if dead
    if (this.stats.hp <= 0) {
      // Play death animation
      const deathAnimKey = `${this.fighterName}_death`;
      if (this.scene.anims.exists(deathAnimKey)) {
        this.sprite.play(deathAnimKey, true);
      }
      
      // Log death
      this.addLogMessage('KO!', '#ff0000');
      
      return true; // Indicates fighter died
    } else {
      // Play hit animation
      const hitAnimKey = `${this.fighterName}_hit`;
      if (this.scene.anims.exists(hitAnimKey)) {
        this.sprite.play(hitAnimKey, true);
        
        // Return to idle after hit animation completes
        this.sprite.once('animationcomplete', () => {
          if (this.isDefending) {
            const defenseAnimKey = `${this.fighterName}_defense`;
            if (this.scene.anims.exists(defenseAnimKey)) {
              this.sprite.play(defenseAnimKey, true);
            }
          } else {
            this.sprite.play(`${this.fighterName}_idle`, true);
          }
        });
      }
      
      // Play hit sound
      try {
        const hitSound = this.scene.sound.add('hit', { volume: 0.5 });
        hitSound.play();
      } catch (error) {
        console.warn('Hit sound not played:', error);
      }
      
      return false; // Indicates fighter survived
    }
  }
  
  move(direction) {
    if (this.isAttacking || this.isDefending || this.isUsingSkill) return;
    
    this.isMoving = true;
    this.moveDirection = direction;
    
    // Play walk animation based on direction
    const animKey = direction > 0 ? 
      `${this.fighterName}_walk_forward` : 
      `${this.fighterName}_walk_backward`;
    
    if (this.scene.anims.exists(animKey)) {
      this.sprite.play(animKey, true);
    }
    
    // Move the sprite
    const moveInterval = setInterval(() => {
      if (!this.isMoving) {
        clearInterval(moveInterval);
        return;
      }
      
      // Move in the specified direction
      this.sprite.x += direction * 5;
      
      // Keep fighter within bounds
      if (this.sprite.x < 100) this.sprite.x = 100;
      if (this.sprite.x > 700) this.sprite.x = 700;
    }, 16);
    
    // Store the interval ID for later cleanup
    this.moveIntervalId = moveInterval;
    
    return true;
  }
  
  stopMoving() {
    if (!this.isMoving) return;
    
    this.isMoving = false;
    
    // Clear the move interval
    if (this.moveIntervalId) {
      clearInterval(this.moveIntervalId);
      this.moveIntervalId = null;
    }
    
    // Play idle animation
    this.sprite.play(`${this.fighterName}_idle`, true);
    
    return true;
  }
  
  defend(isDefending) {
    if (this.isAttacking || this.isUsingSkill) return false;
    
    this.isDefending = isDefending;
    
    if (isDefending) {
      // Play defense animation
      const defenseAnimKey = `${this.fighterName}_defense`;
      if (this.scene.anims.exists(defenseAnimKey)) {
        this.sprite.play(defenseAnimKey, true);
      }
    } else {
      // Return to idle animation
      this.sprite.play(`${this.fighterName}_idle`, true);
    }
    
    return true;
  }
  
  calculateDamage() {
    // Base damage from stats
    let damage = this.stats.baseAttack || 10;
    
    // Add random variation (±20%)
    const variation = damage * 0.4 * (Math.random() - 0.5);
    damage += variation;
    
    // Check for critical hit
    const criticalChance = this.stats.critical || 5;
    const isCritical = Math.random() * 100 < criticalChance;
    
    if (isCritical) {
      damage *= 1.5;
      
      // Log critical hit
      this.addLogMessage('Critical hit!', '#ffff00');
    }
    
    // Round to integer
    return Math.round(damage);
  }
  
  gainMana(amount) {
    // Add mana
    this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + amount);
    
    // Update mana bar
    this.updateBars();
    
    return this.stats.mana;
  }
  
  update(time, opponent) {
    try {
      // Call parent update method if it exists
      if (super.update) {
        super.update(time, opponent);
      }
      
      // Update facing direction based on opponent position
      if (opponent && opponent.sprite) {
        this.updateFacing(opponent);
      }
      
      // Update hitbox position
      if (this.hitbox && this.sprite) {
        this.hitbox.x = this.sprite.x;
        this.hitbox.y = this.sprite.y;
      }
    } catch (error) {
      console.error(`Error in GenericFighter update for ${this.fighterName}:`, error);
    }
  }
  
  updateFacing(opponent) {
    if (!this.sprite || !opponent || !opponent.sprite) return;
    
    // Determine if fighter should face left or right
    const shouldFaceRight = this.sprite.x < opponent.sprite.x;
    
    // Set flip based on player number and facing direction
    if (this.isPlayer1) {
      // Player 1 (left side) should face right (not flipped) when opponent is to the right
      this.sprite.setFlipX(!shouldFaceRight);
    } else {
      // FIXED: Player 2 (right side) should face left (flipped) when opponent is to the left
      // This means we use the same logic as player 1
      this.sprite.setFlipX(!shouldFaceRight);
    }
  }
}