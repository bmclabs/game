// Game Integration Helper Functions
// This module provides utility functions for integrating with the Battle Memecoin Club backend

/**
 * Updates fighter stats based on cryptocurrency market data
 * @param {Object} fighter - The fighter object
 * @param {Object} marketData - Market data from the backend
 * @returns {Object} - Updated fighter stats
 */
function updateFighterStats(fighter, marketData) {
  if (!fighter || !marketData) {
    console.error('Invalid fighter or market data');
    return fighter;
  }
  
  try {
    console.log(`Updating stats for ${fighter.name} with market data:`, marketData);
    
    // Extract market data
    const { priceChange, marketCapChange, volumeChange } = marketData;
    
    // Apply formulas as described in the documentation
    const updatedStats = {
      ...fighter,
      hp: Math.max(100, fighter.hp * (1 + priceChange)),
      maxHp: Math.max(100, fighter.maxHp * (1 + priceChange)),
      maxMana: Math.max(50, fighter.maxMana * (1 + priceChange)),
      baseAttack: Math.max(5, fighter.baseAttack * (1 + priceChange)),
      critical: Math.max(5, fighter.critical * (1 + priceChange)),
      defend: Math.max(2, fighter.defend * (1 - priceChange)),
      kickProbability: Math.max(5, fighter.kickProbability * (1 + priceChange)),
      specialSkill1Cost: Math.max(20, fighter.specialSkill1Cost * (1 + volumeChange)),
      specialSkill2Cost: Math.max(30, fighter.specialSkill2Cost * (1 + volumeChange)),
      aggressiveness: Math.max(20, fighter.aggressiveness * (1 + marketCapChange)),
      defensiveness: Math.max(20, fighter.defensiveness * (1 - marketCapChange)),
      jumpiness: Math.max(20, fighter.jumpiness * (1 + marketCapChange))
    };
    
    console.log(`Updated stats for ${fighter.name}:`, updatedStats);
    return updatedStats;
  } catch (error) {
    console.error(`Error updating fighter stats for ${fighter.name}:`, error);
    return fighter;
  }
}

/**
 * Generates a UUID for match IDs
 * @returns {string} - A UUID string
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Calculates fighter power based on stats
 * @param {Object} stats - Fighter stats
 * @returns {number} - Fighter power value
 */
function calculateFighterPower(stats) {
  if (!stats) return 0;
  
  // Simple power calculation based on stats
  return stats.hp + 
         stats.baseAttack * 2 + 
         stats.critical * 1.5 - 
         stats.defend * 0.5;
}

/**
 * Simulates a battle between two fighters
 * @param {Object} fighter1 - First fighter
 * @param {Object} fighter2 - Second fighter
 * @param {Object} stats1 - First fighter stats
 * @param {Object} stats2 - Second fighter stats
 * @returns {Object} - Battle result with winner and isKO
 */
function simulateBattle(fighter1, fighter2, stats1, stats2) {
  // Calculate fighter powers
  const fighter1Power = calculateFighterPower(stats1);
  const fighter2Power = calculateFighterPower(stats2);
  
  // Determine winner based on power
  const winner = fighter1Power > fighter2Power ? fighter1 : fighter2;
  
  // 50% chance of KO
  const isKO = Math.random() > 0.5;
  
  return { winner, isKO };
}

// Export functions
// module.exports = {
//   updateFighterStats,
//   generateUUID,
//   calculateFighterPower,
//   simulateBattle
// }; 