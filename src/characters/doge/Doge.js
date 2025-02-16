// Remove all imports and use global scope
class Doge extends Fighter {
  constructor(scene, x, y, stats, isPlayer1) {
    super(scene, x, y, stats, isPlayer1);
    this.initializeDogeSkills();
  }

  initializeDogeSkills() {
    // Initialize Doge-specific skills using global scope classes
    this.skills = {
      muchWow: new MuchWowSkill(this),
      toTheMoon: new ToTheMoonSkill(this)
    };
  }

  useSpecialSkill(skillNumber) {
    // Call base class implementation first
    if (!super.useSpecialSkill(skillNumber)) {
      return false;
    }

    // Execute the appropriate skill
    if (skillNumber === 1) {
      return this.skills.muchWow.execute();
    } else if (skillNumber === 2) {
      return this.skills.toTheMoon.execute();
    }

    return true;
  }
}

// Export to global scope
window.Doge = Doge;
