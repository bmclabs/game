class Shiba extends Fighter {
  constructor(scene, x, y, stats, isPlayer1) {
    super(scene, x, y, stats, isPlayer1);
    this.initializeShibaSkills();
  }

  initializeShibaSkills() {
    // Initialize Shiba-specific skills using global scope classes
    this.skills = {
      shibaSlash: new ShibaSlashSkill(this),
      inuImpact: new InuImpactSkill(this)
    };
  }

  useSpecialSkill(skillNumber) {
    // Call base class implementation first
    if (!super.useSpecialSkill(skillNumber)) {
      return false;
    }

    // Execute the appropriate skill
    if (skillNumber === 1) {
      return this.skills.shibaSlash.execute();
    } else if (skillNumber === 2) {
      return this.skills.inuImpact.execute();
    }

    return true;
  }
}

// Export to global scope
window.Shiba = Shiba; 