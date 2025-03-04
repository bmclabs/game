class Shiba extends Fighter {
  constructor(scene, x, y, stats, isPlayer1) {
    // Panggil parent constructor
    super(scene, x, y, stats, isPlayer1);
    
    // Tunggu sampai scene selesai loading
    if (this.scene.textures.exists('shiba_atlas')) {
      this.setupShibaSprite(x, y, isPlayer1);
    } else {
      this.scene.load.once('complete', () => {
        this.setupShibaSprite(x, y, isPlayer1);
      });
    }
    
    // Inisialisasi skill
    this.initializeShibaSkills();
  }
  
  initializeShibaSkills() {
    console.log('Initializing Shiba skills...');
    console.log('ShibaSkill1 exists:', !!window.ShibaSkill1);
    console.log('ShibaSkill2 exists:', !!window.ShibaSkill2);
  
    if (window.ShibaSkill1 && window.ShibaSkill2) {
      this.skills = {
        skill1: new window.ShibaSkill1(this),
        skill2: new window.ShibaSkill2(this)
      };
      console.log('Skills initialized:', this.skills);
    } else {
      console.error('ShibaSkill1 or ShibaSkill2 not found in window object');
      this.skills = {
        skill1: null,
        skill2: null
      };
    }
  }
  
  setupShibaSprite(x, y, isPlayer1) {
    // Hapus sprite lama jika ada
    if (this.sprite) {
      this.sprite.destroy();
    }
    
    // Buat sprite baru
    this.sprite = this.scene.add.sprite(x, y, 'shiba_atlas', '{shiba} #iddle 0.aseprite');
    const desiredHeight = 200;
    const scale = desiredHeight / this.sprite.height;
    this.sprite.setScale(scale);
    this.sprite.setFlipX(!isPlayer1);
    
    // Buat animasi
    this.createAnimations();
    
    // Buat hitbox
    if (this.hitbox) {
      this.hitbox.destroy();
    }
    this.hitbox = this.scene.add.rectangle(x, y, this.sprite.displayWidth * 0.8, this.sprite.displayHeight * 0.9);
    this.hitbox.setVisible(false);
    
    // Play idle animation
    this.sprite.play('shiba_idle', true);
    
    // Set fighter name
    this.fighterName = 'shiba';
  }
  
  createAnimations() {
    try {
      const frameRate = 10;
      const atlasKey = 'shiba_atlas';
      
      // Define animation tags
      const animationTags = [
        { key: 'idle', tag: 'iddle' },
        { key: 'walk', tag: 'walk' },
        { key: 'attack', tag: 'attack' },
        { key: 'kick', tag: 'kick' },
        { key: 'hit', tag: 'hit' },
        { key: 'death', tag: 'death' },
        { key: 'jump', tag: 'jump' },
        { key: 'defense', tag: 'defense' },
        { key: 'skill1', tag: 'skill1' },
        { key: 'skill2', tag: 'skill2' },
        { key: 'win', tag: 'win' }
      ];
      
      // Create animations for each tag
      animationTags.forEach(({ key, tag }) => {
        const animKey = `shiba_${key}`;
        
        // Skip if animation already exists
        if (this.scene.anims.exists(animKey)) {
          return;
        }
        
        // Get frames for this tag
        const frames = this.scene.textures.get(atlasKey).getFrameNames().filter(frame => frame.includes(`#${tag}`));
        
        if (frames.length > 0) {
          // Create animation
          this.scene.anims.create({
            key: animKey,
            frames: frames.map(frame => ({ key: atlasKey, frame })),
            frameRate: frameRate,
            repeat: key === 'idle' || key === 'walk' || key === 'defense' ? -1 : 0
          });
          
          console.log(`Created animation ${animKey} with ${frames.length} frames`);
        } else {
          console.warn(`No frames found for animation ${animKey} (${tag})`);
        }
      });
      
      // Create skill effect animation
      const effectKey = 'shiba_skill_effect';
      if (!this.scene.anims.exists(effectKey)) {
        const effectFrames = this.scene.textures.get(atlasKey).getFrameNames().filter(frame => frame.includes('#effect'));
        
        if (effectFrames.length > 0) {
          this.scene.anims.create({
            key: effectKey,
            frames: effectFrames.map(frame => ({ key: atlasKey, frame })),
            frameRate: frameRate,
            repeat: 0
          });
          
          console.log(`Created effect animation ${effectKey} with ${effectFrames.length} frames`);
        }
      }
    } catch (error) {
      console.error('Error creating Shiba animations:', error);
    }
  }
  
  move(direction) {
    if (this.isAttacking || this.isDefending || this.isUsingSkill) return;
    
    this.isMoving = true;
    this.moveDirection = direction;
    
    // Play walk animation
    this.sprite.play('shiba_walk', true);
    
    // Update facing direction
    if (this.sprite.setFlipX) {
      this.sprite.setFlipX(direction < 0 ? true : false);
    }
  }
  
  stopMoving() {
    this.isMoving = false;
    this.moveDirection = 0;
    
    // Return to idle animation if not in another state
    if (!this.isAttacking && !this.isDefending && !this.isJumping && !this.isUsingSkill) {
      this.sprite.play('shiba_idle', true);
    }
  }
  
  attack(target) {
    if (this.isAttacking || this.isDefending || this.isUsingSkill) return false;
    
    this.isAttacking = true;
    
    // Play attack animation
    this.sprite.play('shiba_attack', true);
    
    // Set a safety timeout to reset attack state if animation doesn't complete
    this.scene.time.delayedCall(1000, () => {
      if (this.isAttacking) {
        console.log(`${this.stats.name} attack animation timed out, resetting state`);
        this.isAttacking = false;
        this.sprite.play('shiba_idle', true);
      }
    });
    
    // Handle attack completion
    this.sprite.once('animationcomplete', () => {
      this.isAttacking = false;
      
      // Calculate damage
      const isCritical = Math.random() * 100 < this.stats.critical;
      const damage = this.stats.baseAttack * (isCritical ? 2 : 1);
      
      // Apply damage to target if in range
      if (target && this.isTargetInRange(target)) {
        const actualDamage = target.takeDamage(damage);
        
        // Add log message
        this.addLogMessage(
          `Attack${isCritical ? ' CRITICAL' : ''} for ${actualDamage}!`,
          isCritical ? '#ff0000' : '#ffffff'
        );
        
        // Gain mana
        this.gainMana(actualDamage * 0.5);
      } else {
        this.addLogMessage('Attack missed!', '#ffffff');
      }
      
      // Return to idle animation
      this.sprite.play('shiba_idle', true);
    });
    
    return true;
  }
  
  isTargetInRange(target) {
    if (!target || !target.sprite) return false;
    
    // Calculate distance between fighters
    const distance = Math.abs(this.sprite.x - target.sprite.x);
    
    // Define attack range
    const attackRange = 150;
    
    return distance <= attackRange;
  }
  
  jump() {
    if (this.isJumping || this.isAttacking || this.isDefending || this.isUsingSkill) return false;
    
    this.isJumping = true;
    this.jumpVelocity = -15; // Negative value for upward movement
    
    // Play jump animation
    this.sprite.play('shiba_jump', true);
    
    return true;
  }
  
  useSpecialSkill(skillNumber) {
    if (this.isAttacking || this.isDefending || this.isUsingSkill) return false;
    
    this.isUsingSkill = true;
    
    // Set a safety timeout to reset skill state if it doesn't complete
    this.scene.time.delayedCall(2000, () => {
      if (this.isUsingSkill) {
        console.log(`${this.stats.name} skill ${skillNumber} timed out, resetting state`);
        this.isUsingSkill = false;
        this.sprite.play('shiba_idle', true);
      }
    });
    
    // Check if we have the skill
    if (!this.skills || !this.skills[`skill${skillNumber}`]) {
      console.error(`Skill ${skillNumber} not found for ${this.stats.name}`);
      this.isUsingSkill = false;
      return false;
    }
    
    // Use the skill
    return this.skills[`skill${skillNumber}`].execute();
  }
  
  takeDamage(amount) {
    // Call parent method
    const damage = super.takeDamage(amount);
    
    // Play hit animation if not dead
    if (this.stats.hp > 0) {
      this.sprite.play('shiba_hit', true);
      
      // Return to idle after hit animation completes
      this.sprite.once('animationcomplete', () => {
        if (!this.isAttacking && !this.isDefending && !this.isUsingSkill) {
          this.sprite.play('shiba_idle', true);
        }
      });
    } else {
      // Play death animation
      this.die();
    }
    
    return damage;
  }
  
  die() {
    // Play death animation
    this.sprite.play('shiba_death', true);
    
    // Add log message
    this.addLogMessage('KO!', '#ff0000');
  }
  
  update(time, delta) {
    // Call parent update method
    super.update(time, delta);
    
    // Additional Shiba-specific update logic can be added here
  }
  
  kick(target) {
    if (this.isAttacking || this.isDefending || this.isUsingSkill) return false;
    
    this.isAttacking = true;
    
    // Play kick animation
    this.sprite.play('shiba_kick', true);
    
    // Set a safety timeout to reset kick state if animation doesn't complete
    this.scene.time.delayedCall(1000, () => {
      if (this.isAttacking) {
        console.log(`${this.stats.name} kick animation timed out, resetting state`);
        this.isAttacking = false;
        this.sprite.play('shiba_idle', true);
      }
    });
    
    // Handle kick completion
    this.sprite.once('animationcomplete', () => {
      this.isAttacking = false;
      
      // Calculate damage (kicks do more damage)
      const isCritical = Math.random() * 100 < this.stats.critical;
      const damage = this.stats.baseAttack * (isCritical ? 2.5 : 1.5);
      
      // Apply damage to target if in range
      if (target && this.isTargetInRange(target)) {
        const actualDamage = target.takeDamage(damage);
        
        // Add log message
        this.addLogMessage(
          `Kick${isCritical ? ' CRITICAL' : ''} for ${actualDamage}!`,
          isCritical ? '#ff0000' : '#ffffff'
        );
        
        // Gain mana
        this.gainMana(actualDamage * 0.7);
      } else {
        this.addLogMessage('Kick missed!', '#ffffff');
      }
      
      // Return to idle animation
      this.sprite.play('shiba_idle', true);
    });
    
    return true;
  }
}

// Export to global scope
window.Shiba = Shiba; 