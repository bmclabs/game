class Trump extends Fighter {
  constructor(scene, x, y, stats, isPlayer1) {
    super(scene, x, y, stats, isPlayer1);
    this.setupTrumpSprite(x, y, isPlayer1);
  }

  setupTrumpSprite(x, y, isPlayer1) {
    if (this.sprite) {
      this.sprite.destroy();
    }

    this.sprite = this.scene.add.sprite(x, y, 'trump_atlas', '{trump} #iddle 0.aseprite');
    const desiredHeight = 200;
    const scale = desiredHeight / this.sprite.height;
    this.sprite.setScale(scale);
    this.sprite.setFlipX(!isPlayer1);

    this.createAnimations();
    this.sprite.play('trump_idle');

    if (this.hitbox) {
      this.hitbox.destroy();
    }
    const width = this.sprite.displayWidth;
    const height = this.sprite.displayHeight;
    this.hitbox = this.scene.add.rectangle(x, y, width * 0.8, height * 0.9);
    this.hitbox.setVisible(false);
  }

  createAnimations() {
    const existingAnims = ['trump_idle', 'trump_walk_forward', 'trump_walk_backward',
      'trump_attack', 'trump_jump', 'trump_skill1', 'trump_skill2',
      'trump_hit', 'trump_death', 'trump_skill_effect', 'trump_ulti_effect',
      'trump_kick', 'trump_defense', 'trump_dramatic', 'trump_win'];

    existingAnims.forEach(key => {
      if (this.scene.anims.exists(key)) {
        this.scene.anims.remove(key);
      }
    });

    // Create animations
    this.scene.anims.create({
      key: 'trump_idle',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #iddle ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 8,
      repeat: -1
    });

    // Attack animation
    this.scene.anims.create({
      key: 'trump_attack',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #jap ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    // Hit animation
    this.scene.anims.create({
      key: 'trump_hit',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #hit ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    // Skill 1 animation
    this.scene.anims.create({
      key: 'trump_skill1',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #skill ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    // Skill 1 effect
    this.scene.anims.create({
      key: 'trump_skill_effect',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #effectskill ',
        start: 0,
        end: 4,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    // Ultimate animation
    this.scene.anims.create({
      key: 'trump_skill2',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #ulti ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    // Ultimate effect
    this.scene.anims.create({
      key: 'trump_ulti_effect',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #effectulti ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    // Dramatic animation
    this.scene.anims.create({
      key: 'trump_dramatic',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #backgroundulti ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    // Kick animation
    this.scene.anims.create({
      key: 'trump_kick',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #kick ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 12,
      repeat: 0
    });

    // Defense animation
    this.scene.anims.create({
      key: 'trump_defense',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #def ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    // Win animation
    this.scene.anims.create({
      key: 'trump_win',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #win ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 10,
      repeat: 0
    });

    // Death/KO animation
    this.scene.anims.create({
      key: 'trump_death',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #KO ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 8,
      repeat: 0
    });

    // Walk Forward animation
    this.scene.anims.create({
      key: 'trump_walk_forward',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #way ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 8,
      repeat: -1
    });

    // Walk Backward animation
    this.scene.anims.create({
      key: 'trump_walk_backward',
      frames: this.scene.anims.generateFrameNames('trump_atlas', {
        prefix: '{trump} #wayback ',
        start: 0,
        end: 3,
        suffix: '.aseprite'
      }),
      frameRate: 8,
      repeat: -1
    });
  }

  // Override attack to use Trump animations
  attack(target) {
    if (this.isHit || this.isAttacking) {
      return false;
    }

    this.isAttacking = true;

    if (this.sprite && this.sprite.play) {
      this.sprite.play('trump_attack');

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
        this.sprite.play('trump_idle');
      });
    }

    return true;
  }

  initializeTrumpSkills() {
    this.skill1 = new TrumpSkill1(this);
    this.skill2 = new TrumpSkill2(this);
  }

  useSpecialSkill(skillNumber) {
    if (skillNumber === 1 && this.skill1) {
      return this.skill1.execute();
    } else if (skillNumber === 2 && this.skill2) {
      return this.skill2.execute();
    }
    return false;
  }

  kick(target) {
    if (this.isHit || this.isAttacking) {
      return false;
    }

    this.isAttacking = true;

    this.sprite.play('trump_kick');

    this.scene.time.delayedCall(200, () => {
      if (target) {
        const isCritical = Math.random() * 100 < this.stats.critical;
        const baseDamage = this.stats.baseAttack * 1.2;
        const damage = Math.floor(baseDamage * (isCritical ? 1.5 : 1));

        target.takeDamage(damage);

        this.gainMana(damage * 1.5);
        this.updateBars();

        if (isCritical) {
          this.addLogMessage(`Critical kick! ${damage} damage!`, '#ff0000');
        }
      }
    });

    this.sprite.once('animationcomplete', () => {
      this.isAttacking = false;
      this.sprite.play('trump_idle');
    });

    return true;
  }

  takeDamage(amount) {
    const damage = super.takeDamage(amount);
    
    if (this.sprite && this.sprite.play) {
      this.isHit = true;
      this.sprite.play('trump_hit');
      
      this.sprite.once('animationcomplete', () => {
        this.isHit = false;
        this.sprite.play('trump_idle');
      });
    }
    
    return damage;
  }

  walkForward() {
    if (this.isHit || this.isAttacking) return false;
    
    if (this.sprite && this.sprite.play) {
      this.sprite.play('trump_walk_forward');
    }
    return true;
  }

  walkBackward() {
    if (this.isHit || this.isAttacking) return false;
    
    if (this.sprite && this.sprite.play) {
      this.sprite.play('trump_walk_backward'); 
    }
    return true;
  }
}

window.Trump = Trump; 
