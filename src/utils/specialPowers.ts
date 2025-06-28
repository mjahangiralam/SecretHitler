import { GameState, SpecialPower } from '../types/game';

export function handleSpecialPower(
  gameState: GameState,
  power: SpecialPower,
  targetPlayerId?: string
): GameState {
  const newState = { ...gameState };

  switch (power) {
    case 'investigate-loyalty': {
      if (!targetPlayerId) {
        throw new Error('Target player ID is required for investigate-loyalty power');
      }
      const targetPlayer = newState.players.find(p => p.id === targetPlayerId);
      if (!targetPlayer) {
        throw new Error('Target player not found');
      }
      newState.investigationResults = {
        ...newState.investigationResults,
        [targetPlayerId]: targetPlayer.role
      };
      break;
    }

    case 'special-election': {
      if (!targetPlayerId) {
        throw new Error('Target player ID is required for special-election power');
      }
      const newPresident = newState.players.find(p => p.id === targetPlayerId);
      if (!newPresident) {
        throw new Error('Target player not found');
      }
      newState.president = targetPlayerId;
      break;
    }

    case 'policy-peek': {
      // Get top 3 cards from the policy deck
      newState.policyPeekCards = newState.policyDeck.slice(0, 3);
      break;
    }

    case 'execution': {
      if (!targetPlayerId) {
        throw new Error('Target player ID is required for execution power');
      }
      const playerToExecute = newState.players.find(p => p.id === targetPlayerId);
      if (!playerToExecute) {
        throw new Error('Target player not found');
      }
      playerToExecute.isAlive = false;
      playerToExecute.isEligible = false;
      
      // Check if Hitler was executed
      if (playerToExecute.role === 'hitler') {
        newState.winner = 'liberal';
        newState.winReason = 'Hitler was executed';
        newState.phase = 'game-over';
      }
      break;
    }
  }

  // Add the power to used powers
  newState.usedPowers = [...newState.usedPowers, power];
  // Don't clear availablePower here - it will be cleared when moving to the next phase

  return newState;
}

export function getAvailablePower(fascistPolicies: number, playerCount: 5 | 7 | 9): SpecialPower | null {
  const powers = {
    5: { 3: 'policy-peek', 4: 'execution' },
    7: { 
      2: 'investigate-loyalty', 
      3: 'special-election', 
      4: 'execution', 
      5: 'execution' 
    },
    9: { 
      1: 'investigate-loyalty', 
      2: 'investigate-loyalty', 
      3: 'special-election', 
      4: 'execution', 
      5: 'execution' 
    }
  };

  return powers[playerCount][fascistPolicies] || null;
}

export function canUsePower(
  gameState: GameState,
  power: SpecialPower,
  targetPlayerId?: string
): boolean {
  // Check if the power is available
  if (gameState.availablePower !== power) {
    return false;
  }

  // Check if the power has already been used
  if (gameState.usedPowers.includes(power)) {
    return false;
  }

  // Check if the target player is valid
  if (targetPlayerId) {
    const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer || !targetPlayer.isAlive) {
      return false;
    }

    // For execution, can't execute the current president
    if (power === 'execution' && targetPlayerId === gameState.president) {
      return false;
    }
  }

  return true;
} 