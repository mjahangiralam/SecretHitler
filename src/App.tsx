import React, { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { RoleRevealScreen } from './components/RoleRevealScreen';
import { GameScreen } from './components/GameScreen';
import { useGameLogic } from './hooks/useGameLogic';

type AppScreen = 'start' | 'lobby' | 'how-to-play' | 'role-reveal' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('start');
  const {
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
  } = useGameLogic();

  const handleStartGame = (gameConfig: any) => {
    initializeGame(gameConfig);
    setCurrentScreen('role-reveal');
  };

  const handleContinueFromRoleReveal = () => {
    setCurrentScreen('game');
  };

  const handleRestart = () => {
    setCurrentScreen('lobby');
  };

  const handleMainMenu = () => {
    setCurrentScreen('start');
  };

  const humanPlayer = gameState.players.find(p => p.isHuman);

  switch (currentScreen) {
    case 'start':
      return (
        <StartScreen
          onPlay={() => setCurrentScreen('lobby')}
          onHowToPlay={() => setCurrentScreen('how-to-play')}
        />
      );

    case 'lobby':
      return (
        <LobbyScreen
          onStartGame={handleStartGame}
          onBack={() => setCurrentScreen('start')}
        />
      );

    case 'how-to-play':
      return (
        <HowToPlayScreen
          onBack={() => setCurrentScreen('start')}
        />
      );

    case 'role-reveal':
      return humanPlayer ? (
        <RoleRevealScreen
          humanPlayer={humanPlayer}
          allPlayers={gameState.players}
          playerCount={config?.playerCount || 5}
          onContinue={handleContinueFromRoleReveal}
        />
      ) : null;

    case 'game':
      return config ? (
        <GameScreen
          gameState={gameState}
          config={config}
          onNominateChancellor={nominateChancellor}
          onCastVote={castVote}
          onPresidentialAction={presidentialAction}
          onChancellorAction={chancellorAction}
          onDrawPolicies={drawPolicies}
          onUseSpecialPower={useSpecialPower}
          onNextPhase={nextPhase}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      ) : null;

    default:
      return null;
  }
}

export default App;