class Brett extends Fighter {
  constructor(scene, x, y, stats, isPlayer1) {
    super(scene, x, y, stats, isPlayer1);
    
    if (this.scene.textures.exists('brett_atlas')) {
      this.setupBrettSprite(x, y, isPlayer1);
    } else {
      this.scene.load.once('complete', () => {
        this.setupBrettSprite(x, y, isPlayer1);
      });
    }
  }

  setupBrettSprite(x, y, isPlayer1) {
    if (this.sprite) {
      this.sprite.destroy();
    }

    this.sprite = this.scene.add.sprite(x, y, 'brett_atlas', '{brett} #iddle 0.aseprite');
    const desiredHeight = 200;
    const scale = desiredHeight / this.sprite.height;
    this.sprite.setScale(scale);
    this.sprite.setFlipX(!isPlayer1);

    this.createAnimations();
    this.sprite.play('brett_idle');

    if (this.hitbox) {
      this.hitbox.destroy();
    }
    const width = this.sprite.displayWidth;
    const height = this.sprite.displayHeight;
    this.hitbox = this.scene.add.rectangle(x, y, width * 0.8, height * 0.9);
    this.hitbox.setVisible(false);
  }

  createAnimations() {
    const existingAnims = ['brett_idle', 'brett_walk_forward', 'brett_walk_backward',
      'brett_attack', 'brett_jump', 'brett_skill1', 'brett_skill2',
      'brett_hit', 'brett_death', 'brett_skill_effect', 'brett_ulti_effect',
      'brett_kick', 'brett_defense', 'brett_dramatic', 'brett_win'];

    existingAnims.forEach(key => {
      if (this.scene.anims.exists(key)) {
        this.scene.anims.remove(key);
      }
    });

    // Create animations
    this.scene.anims.create({
      key: 'brett_idle',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #iddle ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 8,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'brett_walk_forward',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #way ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'brett_walk_backward',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #wayback ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'brett_attack',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #jap ',
        start: 0,
        end: 4,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_jump',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #jump ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_skill1',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #skill ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_skill2',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #ulti ',
        start: 0,
        end: 4,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_hit',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #hit ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_death',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #KO ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_skill_effect',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #effectskill ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_ulti_effect',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #effectulti ',
        start: 0,
        end: 6,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_kick',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #kick ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_defense',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #def ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_win',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #win ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'brett_dramatic',
      frames: this.scene.anims.generateFrameNames('brett_atlas', {
        prefix: '{brett} #backgroundulti ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });
  }

  move(direction) {
    super.move(direction);
    
    if (this.sprite && this.sprite.play) {
      if (direction === 0) {
        this.sprite.play('brett_idle', true);
      } else {
        const isFacingRight = this.facing === 1;
        const isMovingForward = (isFacingRight && direction > 0) || (!isFacingRight && direction < 0);
        
        if (isMovingForward) {
          this.sprite.play('brett_walk_forward', true);
        } else {
          this.sprite.play('brett_walk_backward', true);
        }
      }
    }
  }

  stopMoving() {
    super.stopMoving();
    
    if (this.sprite && this.sprite.play) {
      this.sprite.play('brett_idle', true);
    }
  }

  attack(target) {
    if (this.isHit || this.isAttacking) {
      return false;
    }

    this.isAttacking = true;

    if (this.sprite && this.sprite.play) {
      this.sprite.play('brett_attack');
      
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
      
      this.sprite.once('animationcomplete', () => {
        this.isAttacking = false;
        this.sprite.play('brett_idle');
      });
    }
    
    return true;
  }

  jump() {
    if (this.sprite && this.sprite.play) {
      this.sprite.play('brett_jump');
      
      this.sprite.once('animationcomplete', () => {
        this.sprite.play('brett_idle');
      });
    }
    
    super.jump();
  }

  useSpecialSkill(skillNumber) {
    if (!this.skills) {
      this.initializeBrettSkills();
    }
    
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

  takeDamage(amount) {
    if (this.sprite && this.sprite.play) {
      this.sprite.play('brett_hit');
      
      this.sprite.once('animationcomplete', () => {
        this.sprite.play('brett_idle');
      });
    }
    
    return super.takeDamage(amount);
  }

  die() {
    if (this.sprite && this.sprite.play) {
      this.sprite.play('brett_death');
    }
    
    super.die();
  }

  update(time, delta) {
    super.update(time, delta);
    
    if (this.sprite && this.hitbox) {
      this.hitbox.setPosition(this.sprite.x, this.sprite.y);
    }
  }

  initializeBrettSkills() {
    this.skills = {
      skill1: new BrettSkill1(this),
      skill2: new BrettSkill2(this)
    };
  }
} 