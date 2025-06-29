import { Player, ChatMessage, GameState, AIPersonality, Vote } from '../types/game';

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
  
  // Get all possible templates for this context
  const allTemplates = getMessageTemplates(context, traits, isLiberal);
  
  // Filter out recently used messages for this player
  const recentMessages = player.memory
    .slice(-3)
    .flatMap(m => m.messages || []);
  
  const availableTemplates = allTemplates.filter(
    template => !recentMessages.includes(template)
  );
  
  // If all templates were recently used, reset and use all templates
  const templates = availableTemplates.length > 0 ? availableTemplates : allTemplates;
  
  // Select a template with some randomization
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Add player-specific context
  const suspiciousPlayers = gameState.players
    .filter(p => p.id !== player.id && p.isAlive && player.memory.some(m => m.suspicions[p.id] > 0.6))
    .map(p => p.name);
  
  const trustedPlayers = gameState.players
    .filter(p => p.id !== player.id && p.isAlive && player.memory.some(m => m.alliances[p.id] > 0.6))
    .map(p => p.name);
  
  const message = template
    .replace('{suspicious}', suspiciousPlayers[0] || 'someone')
    .replace('{trusted}', trustedPlayers[0] || 'someone')
    .replace('{president}', gameState.players.find(p => p.id === gameState.president && p.isAlive)?.name || 'the president')
    .replace('{chancellor}', gameState.players.find(p => p.id === gameState.chancellor && p.isAlive)?.name || 'the chancellor');
  
  // Update player's memory with the used message
  const lastMemory = player.memory[player.memory.length - 1];
  if (lastMemory) {
    lastMemory.messages = [...(lastMemory.messages || []), template];
  }
  
  return message;
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
  
  const baseTemplates = {
    nomination: [
      "Let's think carefully about this nomination.",
      "The choice of Chancellor is crucial right now.",
      "We need someone we can trust in this position.",
      "This decision could change everything.",
      "Choose wisely, the fate of our nation depends on it.",
      "We can't afford any mistakes with this nomination.",
      "The next Chancellor must be someone reliable.",
      "This is a pivotal moment for our government."
    ],
    voting: [
      "I've made my decision on this vote.",
      "Let's see how everyone votes on this.",
      "Every vote matters here.",
      "Think carefully before casting your votes.",
      "The voting pattern will tell us a lot.",
      "Choose wisely, this vote is important.",
      "Let's make this vote count.",
      "Your vote reveals your allegiance."
    ],
    'post-vote': [
      "Interesting voting results...",
      "The votes tell an interesting story.",
      "Let's analyze these voting patterns.",
      "Some surprising choices in that vote.",
      "The voting results are quite revealing.",
      "We can learn from how people voted.",
      "Those votes might expose some allegiances.",
      "The voting patterns are becoming clearer."
    ],
    'post-policy': [
      "That policy changes things.",
      "Let's consider what this policy means.",
      "The board state is evolving.",
      "This policy has interesting implications.",
      "We need to adapt our strategy now.",
      "That policy reveals something about our government.",
      "Things are getting more intense with this policy.",
      "The situation is becoming clearer with each policy."
    ]
  };

  // Add personality-specific variations
  if (aggressive && suspicious) {
    return [
      ...baseTemplates[context as keyof typeof baseTemplates],
      "I don't trust {suspicious} at all!",
      "Something's very wrong with this situation.",
      "We're being played like fools!",
      "Wake up! Can't you see what's happening?",
      "This is exactly what the fascists want!",
      "We need to act more aggressively!",
      "{suspicious} is definitely hiding something.",
      "Stop being so naive about what's happening!"
    ];
  } 
  
  if (cautious && trusting) {
    return [
      ...baseTemplates[context as keyof typeof baseTemplates],
      "Let's not jump to conclusions.",
      "I believe in {trusted}'s judgment.",
      "We should consider all possibilities.",
      "Maybe there's another explanation.",
      "Let's work together to figure this out.",
      "I think we're making progress.",
      "We need to stay calm and think this through.",
      "Trust is important, but verify everything."
    ];
  }

  if (isLiberal) {
    return [
      ...baseTemplates[context as keyof typeof baseTemplates],
      "We must protect our democracy.",
      "The liberals need to stay united.",
      "Don't let the fascists divide us.",
      "We're fighting for freedom here.",
      "The truth will come out eventually.",
      "Liberty must prevail over fascism.",
      "We can't let fear control us.",
      "Democracy is worth fighting for."
    ];
  }

  // Default templates plus some neutral additions
  return [
    ...baseTemplates[context as keyof typeof baseTemplates],
    "We need to think strategically.",
    "The situation is getting interesting.",
    "Let's see how this plays out.",
    "Every action has consequences.",
    "Time will reveal the truth.",
    "We must adapt to survive.",
    "The game is changing.",
    "Interesting developments..."
  ];
}

export function updateAIMemory(player: Player, gameState: GameState, event: string): Player {
  if (!player.personality) return player;
  
  const suspicions: Record<string, number> = {};
  const alliances: Record<string, number> = {};
  
  // Update suspicions based on voting patterns, policy results, etc.
  gameState.players.forEach(otherPlayer => {
    if (otherPlayer.id === player.id || !otherPlayer.isAlive) return;
    
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
    alliances,
    messages: [] // Add messages array to track used templates
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

  // Get recent chat messages for context
  const recentMessages = gameState.chatMessages.slice(-5);
  const messageHistory = recentMessages.map(msg => 
    `${msg.playerName}: ${msg.message}`
  ).join('\n');

  // Build context for GPT
  const roleContext = player.role === 'liberal' 
    ? "You are a liberal trying to enact liberal policies and stop the fascists. You should be suspicious of others but not too aggressive."
    : player.role === 'fascist'
    ? "You are a fascist trying to enact fascist policies and help Hitler become Chancellor. You should try to appear trustworthy while subtly pushing for fascist policies."
    : "You are Hitler trying to become Chancellor after 3 fascist policies are enacted. You must appear completely trustworthy while secretly working with the fascists.";

  const personalityContext = `
    Your personality type is: ${player.personality?.type}
    You are ${player.name}
    Your traits:
    - Aggression: ${player.personality?.traits.aggression}
    - Trust Level: ${player.personality?.traits.trustLevel}
    - Deception Skill: ${player.personality?.traits.deceptionSkill}
    - Memory Reliability: ${player.personality?.traits.memoryReliability}
  `;

  const gameContext = `
    Current round: ${gameState.round}
    Liberal policies: ${gameState.liberalPolicies}/5
    Fascist policies: ${gameState.fascistPolicies}/6
    Current president: ${gameState.players.find(p => p.id === gameState.president)?.name}
    Current chancellor: ${gameState.players.find(p => p.id === gameState.chancellor)?.name}
    Election tracker: ${gameState.electionTracker}
    Failed votes: ${gameState.failedVotes}
  `;

  const prompt = `
    ${roleContext}
    ${personalityContext}
    
    Current game state:
    ${gameContext}
    
    Recent chat history:
    ${messageHistory}
    
    Instructions:
    1. Respond naturally as your character would in a real discussion
    2. Reference specific things other players have said
    3. Express your thoughts about the current situation
    4. Keep responses concise (1-2 sentences)
    5. Show your personality traits in your response
    6. If you're suspicious of someone, express it subtly
    7. If you trust someone, explain why
    8. If you're a fascist, try to appear trustworthy while subtly pushing your agenda
    9. If you're Hitler, be especially careful to appear completely trustworthy
    
    Your response should be natural and conversational, like a real person discussing the game.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI API error:', error);
    return generateAIMessage(player, gameState, context as any);
  }
}

export function simulateAIVote(player: Player, gameState: GameState): Vote {
  // Only alive players can vote
  if (!player.isAlive) {
    return 'nein'; // Dead players can't vote, but return a default
  }

  // Vote 'ja' with high probability in the first 2 rounds
  if (gameState.round <= 2) {
    return Math.random() < 0.85 ? 'ja' : 'nein';
  }

  // After round 2, use suspicion and randomness
  // If the president or chancellor is highly suspected, more likely to vote 'nein'
  const president = gameState.players.find(p => p.id === gameState.president && p.isAlive);
  const chancellor = gameState.players.find(p => p.id === gameState.chancellor && p.isAlive);

  let suspicion = 0;
  if (president) suspicion += president.suspicionLevel || 0;
  if (chancellor) suspicion += chancellor.suspicionLevel || 0;

  // Normalize suspicion (assuming 0-1 scale, or adjust as needed)
  suspicion = Math.min(Math.max(suspicion, 0), 1);

  // Base chance to vote yes
  let yesChance = 0.5;
  // If suspicion is high, lower the chance
  if (suspicion > 0.7) yesChance = 0.2;
  else if (suspicion > 0.4) yesChance = 0.35;
  else if (suspicion > 0.2) yesChance = 0.45;
  else yesChance = 0.6;

  // Add a little randomness
  yesChance += (Math.random() - 0.5) * 0.1;
  yesChance = Math.min(Math.max(yesChance, 0.1), 0.9);

  return Math.random() < yesChance ? 'ja' : 'nein';
}