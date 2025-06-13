import { GameState, GameConfig, Player, Policy, Role, SpecialPower } from '../types/game';
import { generateAINames } from './aiUtils';

const AI_PERSONALITIES = [
  'cautious',
  'aggressive',
  'deceptive',
  'logical',
  'emotional',
  'paranoid',
  'trusting',
  'strategic'
];

const ROLE_DISTRIBUTION: Record<number, { liberals: number; fascists: number }> = {
  5: { liberals: 3, fascists: 1 },
  6: { liberals: 4, fascists: 1 },
  7: { liberals: 4, fascists: 2 },
  8: { liberals: 5, fascists: 2 },
  9: { liberals: 5, fascists: 3 },
  10: { liberals: 6, fascists: 3 }
};

export function initializeGameState(gameConfig: GameConfig): GameState {
  // Create players
  const players: Player[] = [];
  const aiNames = generateAINames(gameConfig.playerCount - 1);
  
  // Add human player
  players.push({
    id: 'human',
    name: gameConfig.humanPlayerName,
    role: 'liberal', // Will be reassigned
    isHuman: true,
    isAlive: true,
    isEligible: true,
    suspicionLevel: 0,
    memory: []
  });

  // Add AI players with personalities
  const shuffledPersonalities = [...AI_PERSONALITIES].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < gameConfig.playerCount - 1; i++) {
    players.push({
      id: `ai-${i}`,
      name: aiNames[i],
      role: 'liberal', // Will be reassigned
      isHuman: false,
      isAlive: true,
      isEligible: true,
      personality: shuffledPersonalities[i % shuffledPersonalities.length],
      suspicionLevel: 0,
      memory: []
    });
  }

  // Assign roles
  const roles = assignRoles(gameConfig.playerCount);
  players.forEach((player, index) => {
    player.role = roles[index];
  });

  // Create policy deck
  const policyDeck: Policy[] = [
    ...Array(6).fill('liberal'),
    ...Array(11).fill('fascist')
  ].sort(() => Math.random() - 0.5);

  // Find first president (randomly)
  const firstPresident = players[Math.floor(Math.random() * players.length)];

  return {
    phase: 'role-reveal',
    players,
    president: firstPresident.id,
    chancellor: null,
    previousPresident: null,
    previousChancellor: null,
    votes: {},
    liberalPolicies: 0,
    fascistPolicies: 0,
    policyDeck,
    discardPile: [],
    electionTracker: 0,
    chatMessages: [],
    availablePower: null,
    usedPowers: [],
    currentPresidentCards: [],
    currentChancellorCards: [],
    lastEnactedPolicy: null,
    lastEnactedPolicyIndex: null,
    winner: undefined,
    winReason: undefined,
    round: 1,
    playerCount: gameConfig.playerCount
  };
}

function assignRoles(playerCount: 5 | 7 | 9): Role[] {
  const distribution = ROLE_DISTRIBUTION[playerCount];
  const roles: Role[] = [
    ...Array(distribution.liberals).fill('liberal'),
    ...Array(distribution.fascists).fill('fascist'),
    'hitler'
  ];
  
  return roles.sort(() => Math.random() - 0.5);
} 