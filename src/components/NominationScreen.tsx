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

  const handleNominate = () => {
    if (selectedChancellor) {
      onNominate(selectedChancellor);
    }
  };

  // Auto-nominate for AI president
  React.useEffect(() => {
    if (!isHumanPresident && !gameState.chancellor) {
      // AI president makes nomination after a delay
      const delay = 2000 + Math.random() * 3000;
      const timer = setTimeout(() => {
        const eligibleIds = eligiblePlayers.map(p => p.id);
        if (eligibleIds.length > 0) {
          const choice = eligibleIds[Math.floor(Math.random() * eligibleIds.length)];
          onNominate(choice);
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isHumanPresident, gameState.chancellor, eligiblePlayers, onNominate]);

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
            {isHumanPresident ? 'Choose your Chancellor' : `${president?.name} is selecting a Chancellor...`}
          </p>
        </div>

        {/* President Info */}
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center">
            <Crown className="w-6 h-6 text-yellow-400 mr-2" />
            <span className="text-yellow-400 font-bold">PRESIDENT: </span>
            <span className="text-white font-semibold ml-2">{president?.name}</span>
            {president?.isHuman && <span className="ml-2 text-green-400">(You)</span>}
          </div>
        </div>

        {isHumanPresident ? (
          <>
            {/* Eligible Chancellors */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Select Chancellor:</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eligiblePlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedChancellor(player.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedChancellor === player.id
                        ? 'border-purple-500 bg-purple-900 bg-opacity-40 shadow-lg transform scale-105'
                        : 'border-gray-600 bg-gray-800 bg-opacity-40 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-white font-semibold mb-1">{player.name}</div>
                      {!player.isHuman && player.personality && (
                        <div className="text-xs text-gray-400">{player.personality.name}</div>
                      )}
                      {player.isHuman && <div className="text-xs text-green-400">(You)</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ineligible Players Info */}
            {gameState.players.filter(p => !eligiblePlayers.includes(p) && p.id !== gameState.president).length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-400 mb-3">Ineligible:</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {gameState.players
                    .filter(p => !eligiblePlayers.includes(p) && p.id !== gameState.president)
                    .map((player) => (
                      <div key={player.id} className="p-3 bg-gray-800 bg-opacity-20 border border-gray-700 rounded-lg opacity-50">
                        <div className="text-center">
                          <div className="text-gray-400 text-sm">{player.name}</div>
                          <div className="text-xs text-gray-500">
                            {!player.isAlive ? 'Dead' : 
                             player.id === gameState.previousChancellor ? 'Prev. Chancellor' :
                             player.id === gameState.previousPresident ? 'Prev. President' : 'Ineligible'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Confirm Button */}
            <div className="text-center">
              <button
                onClick={handleNominate}
                disabled={!selectedChancellor}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold text-lg rounded-lg shadow-xl hover:from-purple-500 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Nominate Chancellor
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-8">
              <div className="animate-pulse mb-6">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
                <div className="w-48 h-4 bg-gray-700 rounded mx-auto mb-2"></div>
                <div className="w-32 h-3 bg-gray-700 rounded mx-auto"></div>
              </div>
              <p className="text-gray-300">Waiting for {president?.name} to choose...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}