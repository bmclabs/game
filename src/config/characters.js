const CHARACTERS = [
  {
    name: 'Pepe',
    hp: 260,
    maxHp: 260,
    mana: 0,
    maxMana: 160,
    baseAttack: 16,
    critical: 20,
    defend: 8,
    kickProbability: 15,
    specialSkill1Cost: 45,
    specialSkill2Cost: 80,
    specialSkill1Name: 'Poison Strike',
    specialSkill2Name: 'Pepe Rage',
    specialSkill1Damage: 30,
    specialSkill2Damage: 60,
    color: 0x00ff00,
    description: 'High risk, high reward fighter with powerful special attacks',
    aiStyle: 'aggressive', // AI behavior style
    attackRange: 120, // Range at which fighter can attack
    actionDelay: 600,
    // Personality traits (0-100 scale)
    aggressiveness: 80,
    defensiveness: 20,
    jumpiness: 60,
    // Movement preferences
    preferredDistance: 120,
    retreatHealthThreshold: 0.2,
  },
  {
    name: 'Trump',
    hp: 295,
    maxHp: 295,
    mana: 0,
    maxMana: 110,
    baseAttack: 15,
    critical: 12,
    defend: 11,
    kickProbability: 20,
    specialSkill1Cost: 35,
    specialSkill2Cost: 68,
    specialSkill1Name: 'Trump Rush',
    specialSkill2Name: 'Pack Hunt',
    specialSkill1Damage: 25,
    specialSkill2Damage: 50,
    color: 0xFFA500,
    description: 'Balanced fighter with good defense and offense',
    aiStyle: 'balanced', // AI behavior style
    attackRange: 100, // Range at which fighter can attack
    actionDelay: 700,
    // Personality traits (0-100 scale)
    aggressiveness: 65,
    defensiveness: 45,
    jumpiness: 40,
    // Movement preferences
    preferredDistance: 100,
    retreatHealthThreshold: 0.3,
  }
]; 
