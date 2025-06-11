export type Role = 'liberal' | 'fascist' | 'hitler';
export type Policy = 'liberal' | 'fascist';
export type Vote = 'ja' | 'nein';
export type GamePhase = 
  | 'lobby' 
  | 'role-reveal' 
  | 'nomination' 
  | 'voting' 
  | 'legislative' 
  | 'discussion' 
  | 'special-power' 
  | 'game-over';

export type SpecialPower = 
  | 'investigate-loyalty' 
  | 'special-election' 
  | 'policy-peek' 
  | 'execution';

export interface Player {
  id: string;
  name: string;
  role: Role;
  isHuman: boolean;
  isAlive: boolean;
  isEligible: boolean;
  personality?: AIPersonality;
  suspicionLevel: number;
  memory: GameMemory[];
}

export interface AIPersonality {
  type: 'cautious-analyst' | 'aggressive-accuser' | 'deceptive-joker' | 'trust-builder' | 'flip-flopper' | 'quiet-observer' | 'suspicious-skeptic' | 'overconfident-leader' | 'paranoid-screamer';
  name: string;
  voiceId?: string;
  traits: {
    aggression: number; // 0-1
    trustLevel: number; // 0-1  
    deceptionSkill: number; // 0-1
    memoryReliability: number; // 0-1
  };
}

export interface GameMemory {
  round: number;
  event: string;
  suspicions: Record<string, number>;
  alliances: Record<string, number>;
  messages: string[];
}

export interface GameState {
  phase: GamePhase;
  round: number;
  players: Player[];
  humanPlayerId: string;
  
  // Government tracking
  president: string | null;
  chancellor: string | null;
  previousPresident: string | null;
  previousChancellor: string | null;
  
  // Policy tracking
  liberalPolicies: number;
  fascistPolicies: number;
  policyDeck: Policy[];
  discardPile: Policy[];
  
  // Voting
  votes: Record<string, Vote>;
  electionTracker: number;
  
  // Legislative session
  presidentialDraw: Policy[];
  chancellorChoice: Policy[];
  
  // Special powers
  availablePower: SpecialPower | null;
  investigationResults: Record<string, Role>;
  
  // Game result
  winner: 'liberal' | 'fascist' | null;
  winReason: string | null;
  
  // Chat
  chatMessages: ChatMessage[];
  discussionTimer: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  isAI: boolean;
}

export interface GameConfig {
  playerCount: 5 | 7 | 9;
  humanPlayerName: string;
  aiChatEnabled: boolean;
  voiceChatEnabled: boolean;
  openAIKey?: string;
  elevenLabsKey?: string;
}

export const ROLE_DISTRIBUTION = {
  5: { liberals: 3, fascists: 1, hitler: 1 },
  7: { liberals: 4, fascists: 2, hitler: 1 },
  9: { liberals: 5, fascists: 3, hitler: 1 }
};

export const FASCIST_POWERS = {
  5: { 3: 'policy-peek' as SpecialPower, 4: 'execution' as SpecialPower },
  7: { 
    2: 'investigate-loyalty' as SpecialPower, 
    3: 'special-election' as SpecialPower, 
    4: 'execution' as SpecialPower, 
    5: 'execution' as SpecialPower 
  },
  9: { 
    1: 'investigate-loyalty' as SpecialPower, 
    2: 'investigate-loyalty' as SpecialPower, 
    3: 'special-election' as SpecialPower, 
    4: 'execution' as SpecialPower, 
    5: 'execution' as SpecialPower 
  }
};

export const AI_PERSONALITIES: AIPersonality[] = [
  {
    type: 'cautious-analyst',
    name: 'The Analyst',
    traits: { aggression: 0.3, trustLevel: 0.7, deceptionSkill: 0.4, memoryReliability: 0.9 }
  },
  {
    type: 'aggressive-accuser',
    name: 'The Prosecutor',
    traits: { aggression: 0.9, trustLevel: 0.2, deceptionSkill: 0.6, memoryReliability: 0.7 }
  },
  {
    type: 'deceptive-joker',
    name: 'The Jester',  
    traits: { aggression: 0.5, trustLevel: 0.4, deceptionSkill: 0.9, memoryReliability: 0.5 }
  },
  {
    type: 'trust-builder',
    name: 'The Diplomat',
    traits: { aggression: 0.2, trustLevel: 0.9, deceptionSkill: 0.3, memoryReliability: 0.8 }
  },
  {
    type: 'flip-flopper',
    name: 'The Opportunist',
    traits: { aggression: 0.6, trustLevel: 0.3, deceptionSkill: 0.7, memoryReliability: 0.4 }
  },
  {
    type: 'quiet-observer',
    name: 'The Watcher',
    traits: { aggression: 0.1, trustLevel: 0.6, deceptionSkill: 0.5, memoryReliability: 0.9 }
  },
  {
    type: 'suspicious-skeptic',
    name: 'The Doubter',
    traits: { aggression: 0.4, trustLevel: 0.1, deceptionSkill: 0.4, memoryReliability: 0.8 }
  },
  {
    type: 'overconfident-leader',
    name: 'The Commander',
    traits: { aggression: 0.8, trustLevel: 0.8, deceptionSkill: 0.3, memoryReliability: 0.6 }
  },
  {
    type: 'paranoid-screamer',
    name: 'The Alarmist',
    traits: { aggression: 0.7, trustLevel: 0.1, deceptionSkill: 0.2, memoryReliability: 0.3 }
  }
];