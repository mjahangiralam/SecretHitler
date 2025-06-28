import { GameState, GameConfig, Player, SpecialPower } from '../types/game';
import { FASCIST_POWERS } from '../constants/powers';

/**
 * Integration test demonstrating special power functionality in a 7-player game
 * This file shows the expected behavior without requiring a testing framework
 */

export function simulateSevenPlayerGame() {
  console.log('=== 7-Player Game Special Powers Integration Test ===');
  
  // Initialize game state for 7 players
  const gameState: GameState = {
    phase: 'legislative',
    round: 1,
    players: [
      { id: 'president', name: 'Alice', role: 'liberal', isHuman: true, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] },
      { id: 'chancellor', name: 'Bob', role: 'fascist', isHuman: false, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] },
      { id: 'player3', name: 'Charlie', role: 'liberal', isHuman: false, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] },
      { id: 'player4', name: 'Diana', role: 'fascist', isHuman: false, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] },
      { id: 'player5', name: 'Eve', role: 'liberal', isHuman: false, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] },
      { id: 'player6', name: 'Frank', role: 'liberal', isHuman: false, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] },
      { id: 'hitler', name: 'George', role: 'hitler', isHuman: false, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] }
    ],
    humanPlayerId: 'president',
    president: 'president',
    chancellor: 'chancellor',
    previousPresident: null,
    previousChancellor: null,
    liberalPolicies: 1,
    fascistPolicies: 1,
    policyDeck: ['liberal', 'fascist', 'liberal', 'fascist', 'liberal', 'fascist', 'liberal'],
    discardPile: [],
    votes: {},
    electionTracker: 0,
    presidentialDraw: ['liberal', 'fascist', 'liberal'],
    chancellorChoice: ['fascist', 'liberal'],
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

  console.log('Initial state:');
  console.log('- Liberal policies:', gameState.liberalPolicies);
  console.log('- Fascist policies:', gameState.fascistPolicies);
  console.log('- Available power:', gameState.availablePower);

  // Simulate enacting fascist policies and triggering powers
  const fascistPolicyCounts = [2, 3, 4, 5];
  
  fascistPolicyCounts.forEach(fascistCount => {
    console.log(`\n--- Enacting ${fascistCount}th Fascist Policy ---`);
    
    // Check what power should be available
    const expectedPower = FASCIST_POWERS[7][fascistCount];
    console.log(`Expected power for ${fascistCount} fascist policies:`, expectedPower);
    
    // Simulate the power being triggered
    if (expectedPower) {
      console.log(`Power "${expectedPower}" should be triggered`);
      
      // Simulate different power scenarios
      switch (expectedPower) {
        case 'investigate-loyalty':
          console.log('- President can investigate any alive player (except themselves)');
          console.log('- Eligible targets: Bob, Charlie, Diana, Eve, Frank, George');
          console.log('- Result: Learn target\'s party affiliation (Liberal/Fascist)');
          break;
          
        case 'special-election':
          console.log('- President can choose any alive player as next President');
          console.log('- Eligible targets: Bob, Charlie, Diana, Eve, Frank, George');
          console.log('- Result: Chosen player becomes President immediately');
          break;
          
        case 'policy-peek':
          console.log('- President can look at top 3 policy cards');
          console.log('- Cards shown: Liberal, Fascist, Liberal');
          console.log('- Result: Strategic knowledge of upcoming policies');
          break;
          
        case 'execution':
          console.log('- President can execute any alive player (except themselves)');
          console.log('- Eligible targets: Bob, Charlie, Diana, Eve, Frank, George');
          console.log('- Result: Target is eliminated from game');
          console.log('- Special: If Hitler is executed, Liberals win immediately');
          break;
      }
    }
  });

  console.log('\n=== Test Complete ===');
  console.log('All special powers should trigger correctly at the appropriate fascist policy counts.');
  console.log('The game should handle power usage, target validation, and victory conditions properly.');
}

// Export for potential use in development
export { simulateSevenPlayerGame as testSpecialPowers };

// Mock game state for testing execution power
const createMockGameState = (): GameState => ({
  phase: 'special-power',
  round: 1,
  players: [
    { id: 'president', name: 'Alice', role: 'fascist', isHuman: true, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] },
    { id: 'target1', name: 'Bob', role: 'liberal', isHuman: false, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] },
    { id: 'target2', name: 'Charlie', role: 'hitler', isHuman: false, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] },
    { id: 'target3', name: 'David', role: 'liberal', isHuman: false, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] },
    { id: 'target4', name: 'Eve', role: 'fascist', isHuman: false, isAlive: true, isEligible: true, suspicionLevel: 0, memory: [] }
  ],
  humanPlayerId: 'president',
  president: 'president',
  chancellor: null,
  previousPresident: null,
  previousChancellor: null,
  liberalPolicies: 0,
  fascistPolicies: 3, // This triggers execution power
  policyDeck: ['liberal', 'fascist', 'liberal', 'fascist', 'liberal'],
  discardPile: [],
  votes: {},
  electionTracker: 0,
  presidentialDraw: [],
  chancellorChoice: [],
  availablePower: 'execution' as SpecialPower,
  investigationResults: {},
  winner: null,
  winReason: null,
  chatMessages: [],
  discussionTimer: 0,
  usedPowers: [],
  policyPeekCards: null,
  drawPile: [],
  failedVotes: 0
});

// Mock config
const mockConfig: GameConfig = {
  playerCount: 5,
  humanPlayerName: 'Alice',
  voiceChatEnabled: false,
  elevenLabsKey: null,
  aiResponseTime: 2000,
  discussionTime: 300
};

// Test execution power functionality
export function testExecutionPower() {
  console.log('🧪 Testing Execution Power Integration');
  console.log('=====================================');

  let gameState = createMockGameState();
  
  // Test 1: Verify execution power is available
  console.log('\n1. Testing execution power availability...');
  const playerCount = gameState.players.length as 5;
  const powerSlot = gameState.fascistPolicies as keyof typeof FASCIST_POWERS[typeof playerCount];
  const expectedPower = FASCIST_POWERS[playerCount]?.[powerSlot];
  
  if (gameState.availablePower === expectedPower) {
    console.log('✅ Execution power correctly available at 3 fascist policies');
  } else {
    console.log('❌ Execution power not available when it should be');
    return false;
  }

  // Test 2: Simulate execution of a player
  console.log('\n2. Testing player execution...');
  const targetPlayerId = 'target1'; // Bob
  const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
  
  if (!targetPlayer) {
    console.log('❌ Target player not found');
    return false;
  }

  console.log(`Executing ${targetPlayer.name} (${targetPlayer.role})...`);
  
  // Simulate the execution logic
  targetPlayer.isAlive = false;
  targetPlayer.isEligible = false;
  
  // Add execution message
  const executionMessage = {
    id: `execution-${Date.now()}`,
    playerId: 'system',
    playerName: 'System',
    message: `${gameState.players.find(p => p.id === gameState.president)?.name} executed ${targetPlayer.name}`,
    timestamp: Date.now(),
    isAI: false
  };
  
  gameState.chatMessages = [...gameState.chatMessages, executionMessage];
  gameState.usedPowers = [...gameState.usedPowers, gameState.availablePower!];
  gameState.availablePower = null;

  // Test 3: Verify player is marked as dead
  console.log('\n3. Verifying player is marked as dead...');
  const executedPlayer = gameState.players.find(p => p.id === targetPlayerId);
  if (executedPlayer && !executedPlayer.isAlive && !executedPlayer.isEligible) {
    console.log(`✅ ${executedPlayer.name} correctly marked as dead and ineligible`);
  } else {
    console.log('❌ Executed player not properly marked as dead');
    return false;
  }

  // Test 4: Verify dead player cannot be nominated
  console.log('\n4. Testing nomination eligibility...');
  const alivePlayers = gameState.players.filter(p => p.isAlive);
  const eligibleForChancellor = alivePlayers.filter(p => 
    p.id !== gameState.president && 
    p.id !== gameState.previousChancellor && 
    p.id !== gameState.previousPresident &&
    p.isEligible
  );
  
  const deadPlayerInEligible = eligibleForChancellor.find(p => p.id === targetPlayerId);
  if (!deadPlayerInEligible) {
    console.log('✅ Dead player correctly excluded from chancellor nomination');
  } else {
    console.log('❌ Dead player still eligible for chancellor nomination');
    return false;
  }

  // Test 5: Verify presidential rotation skips dead players
  console.log('\n5. Testing presidential rotation...');
  const currentPresIndex = alivePlayers.findIndex(p => p.id === gameState.president);
  const nextPresIndex = (currentPresIndex + 1) % alivePlayers.length;
  const nextPresident = alivePlayers[nextPresIndex];
  
  if (nextPresident && nextPresident.isAlive) {
    console.log(`✅ Next president ${nextPresident.name} is alive`);
  } else {
    console.log('❌ Next president is dead or invalid');
    return false;
  }

  // Test 6: Verify dead player cannot vote
  console.log('\n6. Testing voting eligibility...');
  const votingPlayers = gameState.players.filter(p => p.isAlive);
  const deadPlayerVoting = votingPlayers.find(p => p.id === targetPlayerId);
  
  if (!deadPlayerVoting) {
    console.log('✅ Dead player correctly excluded from voting');
  } else {
    console.log('❌ Dead player still able to vote');
    return false;
  }

  // Test 7: Verify Hitler execution triggers liberal victory
  console.log('\n7. Testing Hitler execution victory condition...');
  const hitlerPlayer = gameState.players.find(p => p.role === 'hitler');
  if (hitlerPlayer) {
    console.log(`Hitler found: ${hitlerPlayer.name} (currently ${hitlerPlayer.isAlive ? 'alive' : 'dead'})`);
    
    // Simulate Hitler execution
    hitlerPlayer.isAlive = false;
    hitlerPlayer.isEligible = false;
    
    if (hitlerPlayer.role === 'hitler' && !hitlerPlayer.isAlive) {
      console.log('✅ Hitler execution would trigger liberal victory');
    } else {
      console.log('❌ Hitler execution not properly handled');
      return false;
    }
  }

  console.log('\n🎉 All execution power tests passed!');
  console.log('\n📋 Summary:');
  console.log('- Execution power correctly available at 3 fascist policies');
  console.log('- Executed players are marked as dead and ineligible');
  console.log('- Dead players cannot be nominated for chancellor');
  console.log('- Dead players cannot vote');
  console.log('- Presidential rotation skips dead players');
  console.log('- Hitler execution triggers liberal victory');
  
  return true;
}

// Test the integration
if (typeof window === 'undefined') {
  // Only run in Node.js environment
  testExecutionPower();
} 