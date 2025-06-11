import { useState, useCallback, useEffect } from 'react';
import { GameState, GameConfig, Player, Policy, Vote, SpecialPower, Role, AI_PERSONALITIES, ROLE_DISTRIBUTION, FASCIST_POWERS } from '../types/game';
import { generateAINames } from '../utils/aiUtils';

const INITIAL_GAME_STATE: GameState = {
  phase: 'lobby',
  round: 1,
  players: [],
  humanPlayerId: '',
  president: null,
  chancellor: null,
  previousPresident: null,
  previousChancellor: null,
  liberalPolicies: 0,
  fascistPolicies: 0,
  policyDeck: [],
  discardPile: [],
  votes: {},
  electionTracker: 0,
  presidentialDraw: [],
  chancellorChoice: [],
  availablePower: null,
  investigationResults: {},
  winner: null,
  winReason: null,
  chatMessages: [],
  discussionTimer: 0
};

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [config, setConfig] = useState<GameConfig | null>(null);

  const initializeGame = useCallback((gameConfig: GameConfig) => {
    setConfig(gameConfig);
    
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

    setGameState({
      ...INITIAL_GAME_STATE,
      players,
      humanPlayerId: 'human',
      policyDeck,
      president: firstPresident.id,
      phase: 'role-reveal'
    });
  }, []);

  const assignRoles = (playerCount: 5 | 7 | 9): Role[] => {
    const distribution = ROLE_DISTRIBUTION[playerCount];
    const roles: Role[] = [
      ...Array(distribution.liberals).fill('liberal'),
      ...Array(distribution.fascists).fill('fascist'),
      'hitler'
    ];
    
    return roles.sort(() => Math.random() - 0.5);
  };

  const nextPhase = useCallback(() => {
    setGameState(prev => {
      switch (prev.phase) {
        case 'role-reveal':
          return { ...prev, phase: 'nomination' };
        case 'nomination':
          return { ...prev, phase: 'voting', votes: {} };
        case 'voting':
          const votePassed = Object.values(prev.votes).filter(v => v === 'ja').length > prev.players.length / 2;
          if (votePassed) {
            return { ...prev, phase: 'legislative', electionTracker: 0 };
          } else {
            // Move to next president
            const currentPresIndex = prev.players.findIndex(p => p.id === prev.president);
            const nextPresIndex = (currentPresIndex + 1) % prev.players.length;
            const newElectionTracker = prev.electionTracker + 1;
            
            if (newElectionTracker >= 3) {
              // Chaos - enact top policy
              const topPolicy = prev.policyDeck[0];
              const newDeck = prev.policyDeck.slice(1);
              const newState = topPolicy === 'liberal' 
                ? { liberalPolicies: prev.liberalPolicies + 1 }
                : { fascistPolicies: prev.fascistPolicies + 1 };
              
              return {
                ...prev,
                ...newState,
                policyDeck: newDeck,
                president: prev.players[nextPresIndex].id,
                chancellor: null,
                electionTracker: 0,
                phase: 'discussion'
              };
            }
            
            return {
              ...prev,
              president: prev.players[nextPresIndex].id,
              chancellor: null,
              electionTracker: newElectionTracker,
              phase: 'nomination'
            };
          }
        case 'legislative':
          // Check for special power
          const power = FASCIST_POWERS[config?.playerCount || 5]?.[prev.fascistPolicies as keyof typeof FASCIST_POWERS[5]];
          if (power && prev.fascistPolicies > 0) {
            return { ...prev, availablePower: power, phase: 'special-power' };
          }
          return { ...prev, phase: 'discussion' };
        case 'special-power':
          return { ...prev, phase: 'discussion', availablePower: null };
        case 'policy-boards':
          // Check if there's a special power to use
          const fascistPowerSlots = [3, 4, 5];
          if (fascistPowerSlots.includes(prev.fascistPolicies)) {
            const playerCount = prev.players.length as 5 | 7 | 9; // Type assertion since we know it's valid
            const powerSlot = prev.fascistPolicies as 1 | 2 | 3 | 4 | 5; // Type assertion for valid slots
            const power = FASCIST_POWERS[playerCount]?.[powerSlot];
            
            if (power) {
              return {
                ...prev,
                phase: 'special-power',
                availablePower: power
              };
            }
          }
          // If no special power, go to discussion
          return {
            ...prev,
            phase: 'discussion'
          };
        case 'discussion':
          // Move to next round
          const currentPresIndex2 = prev.players.findIndex(p => p.id === prev.president);
          const nextPresIndex2 = (currentPresIndex2 + 1) % prev.players.length;
          return {
            ...prev,
            phase: 'nomination',
            round: prev.round + 1,
            president: prev.players[nextPresIndex2].id,
            previousPresident: prev.president,
            previousChancellor: prev.chancellor,
            chancellor: null
          };
        default:
          return prev;
      }
    });
  }, [config]);

  const nominateChancellor = useCallback((chancellorId: string) => {
    setGameState(prev => ({
      ...prev,
      chancellor: chancellorId
    }));
  }, []);

  const castVote = useCallback((playerId: string, vote: Vote) => {
    setGameState(prev => ({
      ...prev,
      votes: { ...prev.votes, [playerId]: vote }
    }));
  }, []);

  const presidentialAction = useCallback((discardedPolicy: Policy) => {
    setGameState(prev => {
      // Find the first occurrence of the discarded policy
      const discardIndex = prev.presidentialDraw.indexOf(discardedPolicy);
      
      // Create the chancellor's choices by removing only the first occurrence of the discarded policy
      const chancellorChoice = prev.presidentialDraw.filter((p, index) => index !== discardIndex);
      
      console.log('Presidential action:', {
        originalDraw: prev.presidentialDraw,
        discarded: discardedPolicy,
        remainingForChancellor: chancellorChoice
      });

      return {
        ...prev,
        chancellorChoice,
        discardPile: [...prev.discardPile, discardedPolicy]
      };
    });
  }, []);

  const chancellorAction = useCallback((enactedPolicy: Policy) => {
    setGameState(prev => {
      const discarded = prev.chancellorChoice.find(p => p !== enactedPolicy) || 'liberal';
      const newState = enactedPolicy === 'liberal' 
        ? { liberalPolicies: prev.liberalPolicies + 1 }
        : { fascistPolicies: prev.fascistPolicies + 1 };
      
      return {
        ...prev,
        ...newState,
        discardPile: [...prev.discardPile, discarded],
        presidentialDraw: [],
        chancellorChoice: [],
        phase: 'policy-boards'
      };
    });
  }, []);

  const drawPolicies = useCallback(() => {
    setGameState(prev => {
      let deck = [...prev.policyDeck];
      
      // Reshuffle if needed
      if (deck.length < 3) {
        deck = [...deck, ...prev.discardPile].sort(() => Math.random() - 0.5);
      }
      
      const draw = deck.slice(0, 3);
      const remainingDeck = deck.slice(3);
      
      return {
        ...prev,
        presidentialDraw: draw,
        policyDeck: remainingDeck,
        discardPile: deck === prev.policyDeck ? prev.discardPile : []
      };
    });
  }, []);

  const useSpecialPower = useCallback((targetId?: string, result?: any) => {
    setGameState(prev => {
      const newState = { ...prev };
      
      switch (prev.availablePower) {
        case 'investigate-loyalty':
          if (targetId) {
            const target = prev.players.find(p => p.id === targetId);
            if (target) {
              newState.investigationResults[targetId] = target.role === 'liberal' ? 'liberal' : 'fascist';
            }
          }
          break;
        case 'execution':
          if (targetId) {
            newState.players = prev.players.map(p => 
              p.id === targetId ? { ...p, isAlive: false, isEligible: false } : p
            );
            // Check if Hitler was killed
            const target = prev.players.find(p => p.id === targetId);
            if (target?.role === 'hitler') {
              newState.winner = 'liberal';
              newState.winReason = 'Hitler was executed';
              newState.phase = 'game-over';
            }
          }
          break;
        case 'special-election':
          if (targetId) {
            newState.president = targetId;
          }
          break;
      }
      
      return newState;
    });
  }, []);

  // Check win conditions
  useEffect(() => {
    setGameState(prev => {
      if (prev.winner) return prev;
      
      // Liberal wins
      if (prev.liberalPolicies >= 5) {
        return { ...prev, winner: 'liberal', winReason: '5 Liberal policies enacted', phase: 'game-over' };
      }
      
      // Fascist wins
      if (prev.fascistPolicies >= 6) {
        return { ...prev, winner: 'fascist', winReason: '6 Fascist policies enacted', phase: 'game-over' };
      }
      
      // Hitler elected as Chancellor after 3 fascist policies
      if (prev.fascistPolicies >= 3 && prev.chancellor) {
        const chancellor = prev.players.find(p => p.id === prev.chancellor);
        if (chancellor?.role === 'hitler' && Object.values(prev.votes).filter(v => v === 'ja').length > prev.players.length / 2) {
          return { ...prev, winner: 'fascist', winReason: 'Hitler elected Chancellor', phase: 'game-over' };
        }
      }
      
      return prev;
    });
  }, [gameState.liberalPolicies, gameState.fascistPolicies, gameState.chancellor, gameState.votes]);

  return {
    gameState,
    config,
    initializeGame,
    nextPhase,
    nominateChancellor,
    castVote,
    presidentialAction,
    chancellorAction,
    drawPolicies,
    useSpecialPower
  };
}