import React, { useEffect } from 'react';
import { GameState, GameConfig } from '../types/game';
import { GameBoard } from './GameBoard';
import { NominationScreen } from './NominationScreen';
import { VotingScreen } from './VotingScreen';
import { LegislativeScreen } from './LegislativeScreen';
import { DiscussionScreen } from './DiscussionScreen';
import { SpecialPowerScreen } from './SpecialPowerScreen';
import { GameOverScreen } from './GameOverScreen';
import { PolicyBoardsScreen } from './PolicyBoardsScreen';
import { simulateAIVote, updateAIMemory } from '../utils/aiUtils';

interface GameScreenProps {
  gameState: GameState;
  config: GameConfig;
  onNominateChancellor: (chancellorId: string) => void;
  onCastVote: (playerId: string, vote: 'ja' | 'nein') => void;
  onPresidentialAction: (discardedPolicy: string) => void;
  onChancellorAction: (enactedPolicy: string) => void;
  onDrawPolicies: () => void;
  onUseSpecialPower: (targetId?: string, result?: any) => void;
  onNextPhase: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function GameScreen({
  gameState,
  config,
  onNominateChancellor,
  onCastVote,
  onPresidentialAction,
  onChancellorAction,
  onDrawPolicies,
  onUseSpecialPower,
  onNextPhase,
  onRestart,
  onMainMenu
}: GameScreenProps) {

  // Auto-simulate AI actions
  useEffect(() => {
    const simulateAIActions = async () => {
      if (gameState.phase === 'voting') {
        // Simulate AI votes - only for alive players
        const aiPlayers = gameState.players.filter(p => !p.isHuman && p.isAlive);
        const missingVotes = aiPlayers.filter(p => !gameState.votes[p.id]);
        
        if (missingVotes.length > 0) {
          const delays = missingVotes.map((_, index) => (index + 1) * 1000 + Math.random() * 2000);
          
          missingVotes.forEach((player, index) => {
            setTimeout(() => {
              // Double-check the player is still alive before voting
              if (player.isAlive && !gameState.votes[player.id]) {
                const vote = simulateAIVote(player, gameState);
                onCastVote(player.id, vote);
              }
            }, delays[index]);
          });
        }
      } else if (gameState.phase === 'legislative' && gameState.presidentialDraw.length === 0) {
        // Auto-draw policies if needed
        onDrawPolicies();
      }
    };

    simulateAIActions();
  }, [gameState.phase, gameState.votes, gameState.presidentialDraw.length, gameState.players, onCastVote, onDrawPolicies]);

  // Render appropriate screen based on game phase
  switch (gameState.phase) {
    case 'nomination':
      return (
        <NominationScreen
          gameState={gameState}
          onNominate={onNominateChancellor}
          onContinue={onNextPhase}
        />
      );

    case 'voting':
      return (
        <VotingScreen
          gameState={gameState}
          onVote={onCastVote}
          onContinue={onNextPhase}
        />
      );

    case 'legislative':
      return (
        <LegislativeScreen
          gameState={gameState}
          onPresidentialAction={onPresidentialAction}
          onChancellorAction={onChancellorAction}
          onContinue={onNextPhase}
        />
      );

    case 'policy-boards':
      return (
        <PolicyBoardsScreen
          gameState={gameState}
          onContinue={onNextPhase}
        />
      );

    case 'discussion':
      return (
        <DiscussionScreen
          gameState={gameState}
          config={config}
          onContinue={onNextPhase}
        />
      );

    case 'special-power':
      return (
        <SpecialPowerScreen
          gameState={gameState}
          config={config}
          onUsePower={onUseSpecialPower}
          onContinue={onNextPhase}
        />
      );

    case 'game-over':
      return (
        <GameOverScreen
          gameState={gameState}
          onRestart={onRestart}
          onMainMenu={onMainMenu}
        />
      );

    default:
      return (
        <GameBoard
          gameState={gameState}
          showRoles={false}
        />
      );
  }
}