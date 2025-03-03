class Pepe extends Fighter {
  constructor(scene, x, y, stats, isPlayer1) {
    // Panggil parent constructor
    super(scene, x, y, stats, isPlayer1);
    
    // Tunggu sampai scene selesai loading
    if (this.scene.textures.exists('pepe_atlas')) {
      this.setupPepeSprite(x, y, isPlayer1);
    } else {
      this.scene.load.once('complete', () => {
        this.setupPepeSprite(x, y, isPlayer1);
      });
    }
  }
  
  initializePepeSkills() {
    console.log('Initializing Pepe skills...');
    console.log('PepeSkill1 exists:', !!window.PepeSkill1);
    console.log('PepeSkill2 exists:', !!window.PepeSkill2);
  
    if (window.PepeSkill1 && window.PepeSkill2) {
      this.skills = {
        skill1: new window.PepeSkill1(this),
        skill2: new window.PepeSkill2(this)
      };
      console.log('Skills initialized:', this.skills);
    } else {
      console.error('PepeSkill1 or PepeSkill2 not found in window object');
      this.skills = {
        skill1: null,
        skill2: null
      };
    }
  }
  
  setupPepeSprite(x, y, isPlayer1) {
    // Hapus sprite lama jika ada
    if (this.sprite) {
      this.sprite.destroy();
    }
    
    // Buat sprite baru
    this.sprite = this.scene.add.sprite(x, y, 'pepe_atlas', '{pepe} #iddle 0.aseprite');
    const desiredHeight = 200;
    const scale = desiredHeight / this.sprite.height;
    this.sprite.setScale(scale);
    this.sprite.setFlipX(!isPlayer1);
    
    // Buat animasi
    this.createAnimations();
    
    // Mulai dengan idle animation
    this.sprite.play('pepe_idle');
    
    // Update hitbox
    if (this.hitbox) {
      this.hitbox.destroy();
    }
    const width = this.sprite.displayWidth;
    const height = this.sprite.displayHeight;
    this.hitbox = this.scene.add.rectangle(x, y, width * 0.8, height * 0.9);
    this.hitbox.setVisible(false);
  }
  
  createAnimations() {
    // Hapus animasi yang sudah ada
    const existingAnims = ['pepe_idle', 'pepe_walk_forward', 'pepe_walk_backward', 
                          'pepe_attack', 'pepe_jump', 'pepe_skill1', 'pepe_skill2',
                          'pepe_hit', 'pepe_death', 'pepe_skill_effect', 'pepe_ulti_effect',
                          'pepe_kick', 'pepe_defense'];
                          
    existingAnims.forEach(key => {
      if (this.scene.anims.exists(key)) {
        this.scene.anims.remove(key);
      }
    });

    // Buat ulang semua animasi
    this.scene.anims.create({
      key: 'pepe_idle',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #iddle ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 8,
      repeat: -1
    });
    
    // Walk forward animation
    this.scene.anims.create({
      key: 'pepe_walk_forward',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #way ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: -1
    });
    
    // Walk backward animation
    this.scene.anims.create({
      key: 'pepe_walk_backward',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #wayback ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: -1
    });
    
    // Attack animation
    this.scene.anims.create({
      key: 'pepe_attack',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #jap ',
        start: 0,
        end: 4,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });
    
    // Jump animation
    this.scene.anims.create({
      key: 'pepe_jump',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #jump ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });
    
    // Skill 1 animation
    this.scene.anims.create({
      key: 'pepe_skill1',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #skill ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });
    
    // Skill 2 animation
    this.scene.anims.create({
      key: 'pepe_skill2',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #ulti ',
        start: 0,
        end: 4,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });
    
    // Hit animation
    this.scene.anims.create({
      key: 'pepe_hit',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #hit ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });
    
    // Death animation
    this.scene.anims.create({
      key: 'pepe_death',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #KO ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });
    
    // Skill effect animation
    this.scene.anims.create({
      key: 'pepe_skill_effect',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #effectskill ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    // Ulti effect animation
    this.scene.anims.create({
      key: 'pepe_ulti_effect',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #effectulti ',
        start: 0,
        end: 6,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    // Kick animation
    this.scene.anims.create({
      key: 'pepe_kick',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #kick ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    // Defense animation
    this.scene.anims.create({
      key: 'pepe_defense',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #def ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    // Win animation
    this.scene.anims.create({
      key: 'pepe_win',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #win ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    // Dramatic Portrait animation
    this.scene.anims.create({
      key: 'pepe_dramatic',
      frames: this.scene.anims.generateFrameNames('pepe_atlas', {
        prefix: '{pepe} #backgroundulti ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });
  }
  
  // Override move method to play walking animations
  move(direction) {
    super.move(direction);
    
    if (this.sprite && this.sprite.play) {
      if (direction === 0) {
        this.sprite.play('pepe_idle', true);
      } else {
        const isFacingRight = this.facing === 1;
        const isMovingForward = (isFacingRight && direction > 0) || (!isFacingRight && direction < 0);
        
        if (isMovingForward) {
          this.sprite.play('pepe_walk_forward', true);
        } else {
          this.sprite.play('pepe_walk_backward', true);
        }
      }
    }
  }
  
  // Override stopMoving to return to idle
  stopMoving() {
    super.stopMoving();
    
    if (this.sprite && this.sprite.play) {
      this.sprite.play('pepe_idle', true);
    }
  }
  
  // Override attack to use the correct animation
  attack(target) {
    if (this.isHit || this.isAttacking) {
      return false;
    }

    this.isAttacking = true;

    if (this.sprite && this.sprite.play) {
      this.sprite.play('pepe_attack');
      
      // Apply damage after animation delay
      this.scene.time.delayedCall(200, () => {
        if (target) {
          const isCritical = Math.random() * 100 < this.stats.critical;
          const baseDamage = this.stats.baseAttack;
          const damage = Math.floor(baseDamage * (isCritical ? 1.5 : 1));
          
          target.takeDamage(damage);
          
          if (isCritical) {
            this.addLogMessage(`Critical hit! ${damage} damage!`, '#ff0000');
          }
        }
      });
      
      // Return to idle when animation completes
      this.sprite.once('animationcomplete', () => {
        this.isAttacking = false;
        this.sprite.play('pepe_idle');
      });
    }
    
    return true;
  }
  
  // Override jump to use the correct animation
  jump() {
    if (this.sprite && this.sprite.play) {
      this.sprite.play('pepe_jump');
      
      // Return to idle when animation completes
      this.sprite.once('animationcomplete', () => {
        this.sprite.play('pepe_idle');
      });
    }
    
    super.jump();
  }
  
  // Override useSpecialSkill to use the correct animations
  useSpecialSkill(skillNumber) {
    // Lazy initialization of skills if not done yet
    if (!this.skills) {
      this.initializePepeSkills();
    }
    
    // Call base class implementation first
    if (!super.useSpecialSkill(skillNumber)) {
      return false;
    }

    if (skillNumber === 1 && this.skills.skill1) {
      return this.skills.skill1.execute();
    } else if (skillNumber === 2 && this.skills.skill2) {
      return this.skills.skill2.execute();
    }

    return true;
  }
  
  // Override takeDamage to play hit animation
  takeDamage(amount) {
    if (this.sprite && this.sprite.play) {
      this.sprite.play('pepe_hit');
      
      // Return to idle when animation completes
      this.sprite.once('animationcomplete', () => {
        this.sprite.play('pepe_idle');
      });
    }
    
    return super.takeDamage(amount);
  }
  
  // Override die to play death animation
  die() {
    if (this.sprite && this.sprite.play) {
      this.sprite.play('pepe_death');
    }
    
    super.die();
  }
  
  // Override update to ensure animations work properly
  update(time, delta) {
    super.update(time, delta);
    
    // Make sure the hitbox follows the sprite
    if (this.sprite && this.hitbox) {
      this.hitbox.setPosition(this.sprite.x, this.sprite.y);
    }
  }

  // Tambahkan method kick di class Fighter
  kick(target) {
    if (this.isHit || this.isAttacking) {
      return false;
    }

    this.isAttacking = true;
    
    // Play kick animation
    this.sprite.play('pepe_kick');
    
    // Terapkan damage setelah delay
    this.scene.time.delayedCall(200, () => {
      if (target) {
        const isCritical = Math.random() * 100 < this.stats.critical;
        const baseDamage = this.stats.baseAttack * 1.2; // Kick sedikit lebih kuat
        const damage = Math.floor(baseDamage * (isCritical ? 1.5 : 1));
        
        target.takeDamage(damage);
        
        // Tambah mana saat berhasil kick
        this.gainMana(damage * 1.5);
        this.updateBars();
        
        if (isCritical) {
          this.addLogMessage(`Critical kick! ${damage} damage!`, '#ff0000');
        }
      }
    });
    
    // Reset state setelah animasi selesai
    this.sprite.once('animationcomplete', () => {
      this.isAttacking = false;
      this.sprite.play('pepe_idle');
    });
    
    return true;
  }
}

window.Pepe = Pepe; 