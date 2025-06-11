import { Player, ChatMessage, GameState, AIPersonality } from '../types/game';

const AI_NAMES = [
  'Klaus Weber', 'Emma Fischer', 'Hans Mueller', 'Anna Schmidt', 
  'Franz Wagner', 'Maria Bauer', 'Otto Zimmermann', 'Greta Hofmann',
  'Wilhelm Richter', 'Ingrid Neumann', 'Ernst Krueger', 'Liesel Braun'
];

export function generateAINames(count: number): string[] {
  const shuffled = [...AI_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateAIMessage(
  player: Player, 
  gameState: GameState, 
  context: 'nomination' | 'voting' | 'post-vote' | 'post-policy' | 'accusation' | 'defense'
): string {
  if (!player.personality) return "I agree.";
  
  const { traits } = player.personality;
  const isLiberal = player.role === 'liberal';
  const isFascist = player.role === 'fascist' || player.role === 'hitler';
  
  // Base message templates by context
  const templates = getMessageTemplates(context, traits, isLiberal);
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Add player-specific context
  const suspiciousPlayers = gameState.players
    .filter(p => p.id !== player.id && player.memory.some(m => m.suspicions[p.id] > 0.6))
    .map(p => p.name);
  
  const trustedPlayers = gameState.players
    .filter(p => p.id !== player.id && player.memory.some(m => m.alliances[p.id] > 0.6))
    .map(p => p.name);
  
  return template
    .replace('{suspicious}', suspiciousPlayers[0] || 'someone')
    .replace('{trusted}', trustedPlayers[0] || 'someone')
    .replace('{president}', gameState.players.find(p => p.id === gameState.president)?.name || 'the president')
    .replace('{chancellor}', gameState.players.find(p => p.id === gameState.chancellor)?.name || 'the chancellor');
}

function getMessageTemplates(
  context: string, 
  traits: AIPersonality['traits'], 
  isLiberal: boolean
): string[] {
  const aggressive = traits.aggression > 0.7;
  const cautious = traits.aggression < 0.3;
  const trusting = traits.trustLevel > 0.7;
  const suspicious = traits.trustLevel < 0.3;
  
  switch (context) {
    case 'nomination':
      if (aggressive && suspicious) {
        return [
          "We need to be careful who we trust here. {president} better choose wisely.",
          "I don't like how this is going. Someone's playing games.",
          "The fascists are among us - we need to smoke them out!"
        ];
      } else if (cautious && trusting) {
        return [
          "Let's think this through carefully. Who do we trust?",
          "I believe {president} will make the right choice.",
          "We should consider all options before deciding."
        ];
      }
      return [
        "This is a crucial decision.",
        "Who can we trust with this power?",
        "The fate of democracy hangs in the balance."
      ];
      
    case 'voting':
      if (isLiberal) {
        return [
          "I'm voting based on what I think is best for the liberals.",
          "This government seems trustworthy to me.",
          "I have concerns about this pairing.",
          "Let's see what policies they give us."
        ];
      } else {
        return [
          "This could work in our favor.",
          "I trust this government completely.",
          "Something feels off about this choice.",
          "We need to be strategic here."
        ];
      }
      
    case 'post-vote':
      return [
        "Interesting voting pattern there...",
        "I'm watching who voted how.",
        "That tells us something about people's loyalties.",
        "The votes reveal more than the policies sometimes."
      ];
      
    case 'post-policy':
      if (suspicious) {
        return [
          "That policy result is very convenient for someone...",
          "I'm starting to see a pattern here.",
          "The fascists are playing us perfectly.",
          "We're being manipulated and it's working."
        ];
      }
      return [
        "Well, that changes things.",
        "Another piece of the puzzle.",
        "The board is telling a story.",
        "We need to adjust our strategy."
      ];
      
    case 'accusation':
      if (aggressive) {
        return [
          "{suspicious} has been acting very suspiciously!",
          "I think {suspicious} is definitely a fascist!",
          "Look at {suspicious}'s voting pattern - it's obvious!",
          "We need to stop trusting {suspicious} immediately!"
        ];
      }
      return [
        "I have some concerns about {suspicious}...",
        "Something doesn't add up with {suspicious}.",
        "I'm not sure we can trust {suspicious}.",
        "{suspicious} might not be who they seem."
      ];
      
    case 'defense':
      return [
        "I'm a liberal! You have to believe me!",
        "Check my voting record - I've been consistent!",
        "This is exactly what the fascists want - liberals fighting!",
        "I'm trying to help us win, not hurt us!"
      ];
      
    default:
      return ["I need to think about this..."];
  }
}

export function updateAIMemory(player: Player, gameState: GameState, event: string): Player {
  if (!player.personality) return player;
  
  const suspicions: Record<string, number> = {};
  const alliances: Record<string, number> = {};
  
  // Update suspicions based on voting patterns, policy results, etc.
  gameState.players.forEach(otherPlayer => {
    if (otherPlayer.id === player.id) return;
    
    // Base suspicion on voting alignment
    const playerVote = gameState.votes[player.id];
    const otherVote = gameState.votes[otherPlayer.id];
    
    if (playerVote && otherVote) {
      if (playerVote === otherVote) {
        alliances[otherPlayer.id] = (alliances[otherPlayer.id] || 0) + 0.1;
      } else {
        suspicions[otherPlayer.id] = (suspicions[otherPlayer.id] || 0) + 0.1;
      }
    }
    
    // Fascists are suspicious of liberals and vice versa
    if (player.role === 'liberal' && (otherPlayer.role === 'fascist' || otherPlayer.role === 'hitler')) {
      suspicions[otherPlayer.id] = (suspicions[otherPlayer.id] || 0) + 0.05;
    }
  });
  
  const newMemory = {
    round: gameState.round,
    event,
    suspicions,
    alliances
  };
  
  return {
    ...player,
    memory: [...player.memory.slice(-5), newMemory] // Keep last 5 memories
  };
}

export async function getAIResponse(
  player: Player,
  gameState: GameState,
  context: string,
  openAIKey?: string
): Promise<string> {
  // If no OpenAI key provided, use local AI simulation
  if (!openAIKey) {
    return generateAIMessage(player, gameState, context as any);
  }
  
  // Build context for GPT
  const roleContext = player.role === 'liberal' 
    ? "You are a liberal trying to enact liberal policies and stop the fascists."
    : player.role === 'fascist'
    ? "You are a fascist trying to enact fascist policies and help Hitler become Chancellor."
    : "You are Hitler trying to become Chancellor after 3 fascist policies are enacted.";
  
  const gameContext = `
    Current round: ${gameState.round}
    Liberal policies: ${gameState.liberalPolicies}/5
    Fascist policies: ${gameState.fascistPolicies}/6
    Your personality: ${player.personality?.type}
    Recent events: ${player.memory.slice(-2).map(m => m.event).join(', ')}
  `;
  
  try {
    // This would be the actual OpenAI API call
    // For now, return local simulation
    return generateAIMessage(player, gameState, context as any);
  } catch (error) {
    console.error('AI API error:', error);
    return generateAIMessage(player, gameState, context as any);
  }
}

export function simulateAIVote(player: Player, gameState: GameState): 'ja' | 'nein' {
  if (!player.personality) return 'nein';
  
  const { traits } = player.personality;
  const president = gameState.players.find(p => p.id === gameState.president);
  const chancellor = gameState.players.find(p => p.id === gameState.chancellor);
  
  if (!president || !chancellor) return 'nein';
  
  let voteScore = 0.5; // Neutral starting point
  
  // Role-based voting
  if (player.role === 'liberal') {
    // Liberals are cautious about fascist governments
    if (president.role !== 'liberal' || chancellor.role !== 'liberal') {
      voteScore -= 0.3;
    }
    // Extra cautious about Hitler as Chancellor if 3+ fascist policies
    if (chancellor.role === 'hitler' && gameState.fascistPolicies >= 3) {
      voteScore -= 0.8;
    }
  } else if (player.role === 'fascist') {
    // Fascists support other fascists
    if (president.role !== 'liberal' || chancellor.role !== 'liberal') {
      voteScore += 0.4;
    }
    // Help Hitler become Chancellor when ready
    if (chancellor.role === 'hitler' && gameState.fascistPolicies >= 3) {
      voteScore += 0.6;
    }
  } else if (player.role === 'hitler') {
    // Hitler plays carefully
    voteScore += traits.deceptionSkill * 0.2;
  }
  
  // Personality adjustments
  voteScore += (traits.trustLevel - 0.5) * 0.3;
  voteScore += (Math.random() - 0.5) * 0.2; // Some randomness
  
  return voteScore > 0.5 ? 'ja' : 'nein';
}