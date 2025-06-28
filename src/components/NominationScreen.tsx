import React, { useState } from 'react';
import { GameState } from '../types/game';
import { Crown, Users, CheckCircle } from 'lucide-react';

interface NominationScreenProps {
  gameState: GameState;
  onNominate: (chancellorId: string) => void;
  onContinue: () => void;
}

export function NominationScreen({ gameState, onNominate, onContinue }: NominationScreenProps) {
  const [selectedChancellor, setSelectedChancellor] = useState<string | null>(null);
  
  const president = gameState.players.find(p => p.id === gameState.president);
  const isHumanPresident = president?.isHuman;
  
  // Determine eligible chancellors
  const eligiblePlayers = gameState.players.filter(player => 
    player.id !== gameState.president && // Can't nominate self
    player.id !== gameState.previousChancellor && // Can't re-elect previous chancellor
    player.id !== gameState.previousPresident && // Can't elect previous president in small games
    player.isAlive && // Must be alive
    player.isEligible // Must be eligible
  );

  const deadPlayers = gameState.players.filter(player => !player.isAlive);

  const handleNominate = () => {
    if (selectedChancellor) {
      onNominate(selectedChancellor);
    }
  };

  // Auto-nominate for AI president
  React.useEffect(() => {
    if (!isHumanPresident && !gameState.chancellor) {
      console.log('AI President is selecting a chancellor...');
      
      // Verify we have eligible players
      if (eligiblePlayers.length === 0) {
        console.error('No eligible players for chancellor nomination!');
        return;
      }

      // AI president makes nomination after a delay
      const delay = 2000 + Math.random() * 2000;
      const timer = setTimeout(() => {
        try {
          const eligibleIds = eligiblePlayers.map(p => p.id);
          const choice = eligibleIds[Math.floor(Math.random() * eligibleIds.length)];
          const chosenPlayer = gameState.players.find(p => p.id === choice);
          console.log(`AI President ${president?.name} nominating chancellor: ${chosenPlayer?.name} (${choice})`);
          
          // Verify the choice is still valid
          if (!eligiblePlayers.find(p => p.id === choice)) {
            console.error('Selected player is no longer eligible:', choice);
            return;
          }
          
          onNominate(choice);
        } catch (error) {
          console.error('Error during AI chancellor nomination:', error);
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isHumanPresident, gameState.chancellor, eligiblePlayers, onNominate, gameState.players, president]);

  // Separate effect to handle continuing after chancellor is nominated (for AI president)
  React.useEffect(() => {
    if (!isHumanPresident && gameState.chancellor) {
      console.log('Chancellor nominated, continuing to vote...');
      const continueTimer = setTimeout(() => {
        onContinue();
      }, 1500);
      
      return () => clearTimeout(continueTimer);
    }
  }, [isHumanPresident, gameState.chancellor, onContinue]);

  // If chancellor is already nominated, show confirmation
  if (gameState.chancellor) {
    const chancellor = gameState.players.find(p => p.id === gameState.chancellor);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center">
          <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-white mb-4">Government Nominated</h1>
            
            <div className="space-y-6 mb-8">
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="bg-yellow-900 bg-opacity-40 border border-yellow-700 rounded-lg p-4 mb-2">
                    <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-yellow-400 font-bold text-sm">PRESIDENT</div>
                  </div>
                  <div className="text-white font-semibold">{president?.name}</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-900 bg-opacity-40 border border-purple-700 rounded-lg p-4 mb-2">
                    <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-purple-400 font-bold text-sm">CHANCELLOR</div>
                  </div>
                  <div className="text-white font-semibold">{chancellor?.name}</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onContinue}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
            >
              Proceed to Vote
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Chancellor Nomination</h1>
          <p className="text-gray-400">
            {isHumanPresident ? 'Choose your Chancellor' : `${president?.name} is choosing a Chancellor...`}
          </p>
        </div>

        {/* President Info */}
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center">
            <span className="text-yellow-400 font-bold">PRESIDENT: </span>
            <span className="text-white font-semibold ml-2">{president?.name}</span>
            {president?.isHuman && <span className="ml-2 text-green-400">(You)</span>}
          </div>
        </div>

        {isHumanPresident && (
          <>
            {/* All Players */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Players:</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameState.players.map((player) => {
                  const isEligible = eligiblePlayers.some(p => p.id === player.id);
                  const isDead = !player.isAlive;
                  const isPresident = player.id === gameState.president;
                  const isPreviousChancellor = player.id === gameState.previousChancellor;
                  const isPreviousPresident = player.id === gameState.previousPresident;

                  let reason = '';
                  let reasonColor = 'text-red-400';
                  if (isDead) {
                    reason = 'ELIMINATED';
                    reasonColor = 'text-red-400';
                  } else if (isPresident) {
                    reason = 'Current President';
                    reasonColor = 'text-yellow-400';
                  } else if (isPreviousChancellor) {
                    reason = 'Previous Chancellor';
                    reasonColor = 'text-purple-400';
                  } else if (isPreviousPresident) {
                    reason = 'Previous President';
                    reasonColor = 'text-yellow-400';
                  }

                  return (
                    <button
                      key={player.id}
                      onClick={() => isEligible && setSelectedChancellor(player.id)}
                      disabled={!isEligible}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        isDead
                          ? 'border-red-700 bg-red-900 bg-opacity-30 opacity-60 cursor-not-allowed'
                          : isEligible
                            ? selectedChancellor === player.id
                              ? 'border-purple-500 bg-purple-900 bg-opacity-40 shadow-lg transform scale-105'
                              : 'border-gray-600 bg-gray-800 bg-opacity-40 hover:border-gray-500'
                            : 'border-gray-700 bg-gray-800 bg-opacity-30 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`font-semibold mb-1 ${
                          isDead ? 'text-gray-400 line-through' : 'text-white'
                        }`}>
                          {player.name}
                        </div>
                        {!player.isHuman && player.personality && (
                          <div className="text-xs text-gray-400">{player.personality.name}</div>
                        )}
                        {player.isHuman && <div className="text-xs text-green-400">(You)</div>}
                        {!isEligible && reason && (
                          <div className={`text-xs font-semibold mt-2 ${reasonColor}`}>
                            {reason}
                          </div>
                        )}
                        {isEligible && (
                          <div className="text-xs text-green-400 mt-2 font-semibold">
                            ELIGIBLE
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Eligibility Summary */}
            <div className="mb-6 p-4 bg-blue-900 bg-opacity-20 rounded-lg border border-blue-700">
              <div className="text-center">
                <div className="text-blue-400 font-bold mb-2">Nomination Rules</div>
                <div className="text-gray-300 text-sm">
                  {eligiblePlayers.length} player{eligiblePlayers.length !== 1 ? 's' : ''} eligible for chancellor
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Cannot nominate: Current President, Previous Chancellor, Previous President, or Eliminated players
                </div>
              </div>
            </div>

            {/* Nomination Button */}
            {selectedChancellor && (
              <div className="text-center">
                <button
                  onClick={handleNominate}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all duration-300"
                >
                  Nominate {gameState.players.find(p => p.id === selectedChancellor)?.name} as Chancellor
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}