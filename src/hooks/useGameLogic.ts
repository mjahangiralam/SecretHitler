import { useState, useCallback, useEffect } from 'react';
import { GameState, GameConfig, Player, Policy, Vote, SpecialPower, Role, AI_PERSONALITIES, ROLE_DISTRIBUTION, FASCIST_POWERS, ChatMessage } from '../types/game';
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
  discussionTimer: 0,
  usedPowers: [],
  policyPeekCards: null,
  drawPile: [],
  failedVotes: 0
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

  // Check if a power is available at the current fascist policy count
  const checkSpecialPower = useCallback((fascistPolicies: number) => {
    const playerCount = gameState.players.length as 5 | 7 | 9;
    const powerSlot = fascistPolicies as keyof typeof FASCIST_POWERS[typeof playerCount];
    const power = FASCIST_POWERS[playerCount]?.[powerSlot];
    
    // Only make power available if it hasn't been used yet
    if (power && !gameState.usedPowers.includes(power)) {
      setGameState(prev => ({
        ...prev,
        phase: 'special-power',
        availablePower: power
      }));
      return true;
    }
    return false;
  }, [gameState.players.length, gameState.usedPowers]);

  const nextPhase = useCallback(() => {
    setGameState(prev => {
      switch (prev.phase) {
        case 'role-reveal':
          return { ...prev, phase: 'nomination' };
        case 'nomination':
          return { ...prev, phase: 'voting', votes: {} };
        case 'voting':
          const votePassed = Object.values(prev.votes).filter(v => v === 'ja').length > prev.players.filter(p => p.isAlive).length / 2;
          
          if (votePassed) {
            // Government approved - update previous roles and proceed to legislative
            return { 
              ...prev, 
              phase: 'legislative', 
              electionTracker: 0,
              previousPresident: prev.president,
              previousChancellor: prev.chancellor
            };
          }
          
          // Government rejected - move to next president and update previous roles
          const alivePlayers = prev.players.filter(p => p.isAlive);
          const currentPresIndex = alivePlayers.findIndex(p => p.id === prev.president);
          const nextPresIndex = (currentPresIndex + 1) % alivePlayers.length;
          const newElectionTracker = prev.electionTracker + 1;
            
          if (newElectionTracker >= 3) {
            // Chaos - enact top policy
            const [topPolicy, ...remainingDeck] = prev.policyDeck;
            const newState = topPolicy === 'liberal' 
              ? { liberalPolicies: prev.liberalPolicies + 1 }
              : { fascistPolicies: prev.fascistPolicies + 1 };
              
            // Add a chat message about the chaos
            const chaosMessage: ChatMessage = {
              id: `chaos-${Date.now()}`,
              playerId: 'system',
              playerName: 'System',
              message: `Due to 3 failed elections, the top policy card (${topPolicy.toUpperCase()}) was automatically enacted!`,
              timestamp: Date.now(),
              isAI: false
            };
              
            return {
              ...prev,
              ...newState,
              policyDeck: remainingDeck,
              president: alivePlayers[nextPresIndex].id,
              chancellor: null,
              electionTracker: 0,
              phase: 'policy-boards',
              chatMessages: [...prev.chatMessages, chaosMessage],
              previousPresident: prev.president,
              previousChancellor: prev.chancellor
            };
          }
            
          return {
            ...prev,
            president: alivePlayers[nextPresIndex].id,
            chancellor: null,
            electionTracker: newElectionTracker,
            phase: 'nomination',
            previousPresident: prev.president,
            previousChancellor: prev.chancellor
          };
        case 'legislative':
          return { ...prev, phase: 'policy-boards' };
        case 'policy-boards':
          // Check if a special power is available
          if (checkSpecialPower(prev.fascistPolicies)) {
            return { ...prev };
          }
          return { ...prev, phase: 'discussion' };
        case 'discussion':
          // Move to next president after discussion
          const alivePlayers = prev.players.filter(p => p.isAlive);
          const currentPresIndex = alivePlayers.findIndex(p => p.id === prev.president);
          const nextPresIndex = (currentPresIndex + 1) % alivePlayers.length;
          
          return { 
            ...prev, 
            phase: 'nomination',
            president: alivePlayers[nextPresIndex].id,
            chancellor: null,
            round: prev.round + 1,
            votes: {},
            previousPresident: prev.president,
            previousChancellor: prev.chancellor
          };
      }
        case 'special-power':
          return { ...prev, phase: 'discussion', availablePower: null };
        default:
          return prev;
      }
    });
  }, [checkSpecialPower]);

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
      if (!prev.availablePower) return prev;

      // Initialize the new state with common updates
      let newState = {
        ...prev,
        usedPowers: [...prev.usedPowers, prev.availablePower],
        availablePower: null
      };

      switch (prev.availablePower) {
        case 'investigate-loyalty':
          if (targetId) {
            const targetPlayer = prev.players.find(p => p.id === targetId);
            if (targetPlayer) {
              newState = {
                ...newState,
                investigationResults: {
                  ...prev.investigationResults,
                  [targetId]: targetPlayer.role
                }
              };
            }
          }
          break;

        case 'execution':
          if (targetId) {
            const updatedPlayers = prev.players.map(p =>
              p.id === targetId ? { ...p, isAlive: false, isEligible: false } : p
            );

            const killedPlayer = prev.players.find(p => p.id === targetId);
            if (killedPlayer?.role === 'hitler') {
              newState = {
                ...newState,
                players: updatedPlayers,
                phase: 'game-over',
                winner: 'liberal',
                winReason: 'Hitler was assassinated'
              };
            } else {
              newState = {
                ...newState,
                players: updatedPlayers
              };
            }
          }
          break;

        case 'policy-peek':
          const topThree = prev.policyDeck.slice(0, 3);
          newState = {
            ...newState,
            policyPeekCards: topThree
          };
          break;

        case 'special-election':
          if (targetId) {
            newState = {
              ...newState,
              previousPresident: prev.president,
              president: targetId,
              chancellor: null
            };
          }
          break;

        default:
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
        if (chancellor?.role === 'hitler' && Object.values(prev.votes).filter(v => v === 'ja').length > prev.players.filter(p => p.isAlive).length / 2) {
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
    useSpecialPower,
    checkSpecialPower
  };
}