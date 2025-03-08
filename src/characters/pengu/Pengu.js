class Pengu extends Fighter {
  constructor(scene, x, y, stats, isPlayer1) {
    super(scene, x, y, stats, isPlayer1);
    
    if (this.scene.textures.exists('pengu_atlas')) {
      this.setupPenguSprite(x, y, isPlayer1);
    } else {
      this.scene.load.once('complete', () => {
        this.setupPenguSprite(x, y, isPlayer1);
      });
    }
  }

  setupPenguSprite(x, y, isPlayer1) {
    if (this.sprite) {
      this.sprite.destroy();
    }

    this.sprite = this.scene.add.sprite(x, y, 'pengu_atlas', '{pengu} #iddle 0.aseprite');
    const desiredHeight = 200;
    const scale = desiredHeight / this.sprite.height;
    this.sprite.setScale(scale);
    this.sprite.setFlipX(!isPlayer1);

    this.createAnimations();
    this.sprite.play('pengu_idle');

    if (this.hitbox) {
      this.hitbox.destroy();
    }
    const width = this.sprite.displayWidth;
    const height = this.sprite.displayHeight;
    this.hitbox = this.scene.add.rectangle(x, y, width * 0.8, height * 0.9);
    this.hitbox.setVisible(false);
  }

  createAnimations() {
    const existingAnims = ['pengu_idle', 'pengu_walk_forward', 'pengu_walk_backward',
      'pengu_attack', 'pengu_jump', 'pengu_skill1', 'pengu_skill2',
      'pengu_hit', 'pengu_death', 'pengu_skill_effect', 'pengu_ulti_effect',
      'pengu_kick', 'pengu_defense', 'pengu_dramatic', 'pengu_win'];

    existingAnims.forEach(key => {
      if (this.scene.anims.exists(key)) {
        this.scene.anims.remove(key);
      }
    });

    // Create animations
    this.scene.anims.create({
      key: 'pengu_idle',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #iddle ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 8,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'pengu_walk_forward',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #way ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'pengu_walk_backward',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #wayback ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'pengu_attack',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #jap ',
        start: 0,
        end: 4,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_jump',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #jump ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_skill1',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #skill ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_skill2',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #ulti ',
        start: 0,
        end: 4,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_hit',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #hit ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_death',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #KO ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_skill_effect',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #effectskill ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_ulti_effect',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #effectulti ',
        start: 0,
        end: 6,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_kick',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #kick ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_defense',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #def ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_win',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #win ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pengu_dramatic',
      frames: this.scene.anims.generateFrameNames('pengu_atlas', {
        prefix: '{pengu} #backgroundulti ',
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
        this.sprite.play('pengu_idle', true);
      } else {
        const isFacingRight = this.facing === 1;
        const isMovingForward = (isFacingRight && direction > 0) || (!isFacingRight && direction < 0);
        
        if (isMovingForward) {
          this.sprite.play('pengu_walk_forward', true);
        } else {
          this.sprite.play('pengu_walk_backward', true);
        }
      }
    }
  }

  stopMoving() {
    super.stopMoving();
    
    if (this.sprite && this.sprite.play) {
      this.sprite.play('pengu_idle', true);
    }
  }

  attack(target) {
    if (this.isHit || this.isAttacking) {
      return false;
    }

    this.isAttacking = true;

    if (this.sprite && this.sprite.play) {
      this.sprite.play('pengu_attack');
      
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
        this.sprite.play('pengu_idle');
      });
    }
    
    return true;
  }

  jump() {
    if (this.sprite && this.sprite.play) {
      this.sprite.play('pengu_jump');
      
      this.sprite.once('animationcomplete', () => {
        this.sprite.play('pengu_idle');
      });
    }
    
    super.jump();
  }

  useSpecialSkill(skillNumber) {
    if (!this.skills) {
      this.initializePenguSkills();
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
      this.sprite.play('pengu_hit');
      
      this.sprite.once('animationcomplete', () => {
        this.sprite.play('pengu_idle');
      });
    }
    
    return super.takeDamage(amount);
  }

  die() {
    if (this.sprite && this.sprite.play) {
      this.sprite.play('pengu_death');
    }
    
    super.die();
  }

  update(time, delta) {
    super.update(time, delta);
    
    if (this.sprite && this.hitbox) {
      this.hitbox.setPosition(this.sprite.x, this.sprite.y);
    }
  }

  initializePenguSkills() {
    this.skills = {
      skill1: new PenguSkill1(this),
      skill2: new PenguSkill2(this)
    };
  }
} 