import React, { useState } from 'react';
import { GameState, SpecialPower } from '../types/game';
import { Eye, Vote, Zap, Skull } from 'lucide-react';

interface SpecialPowerScreenProps {
  gameState: GameState;
  onUsePower: (targetId?: string, result?: any) => void;
  onContinue: () => void;
}

export function SpecialPowerScreen({ gameState, onUsePower, onContinue }: SpecialPowerScreenProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [powerUsed, setPowerUsed] = useState(false);
  const [investigationResult, setInvestigationResult] = useState<string | null>(null);
  const [policyPeekResult, setPolicyPeekResult] = useState<string[] | null>(null);

  const president = gameState.players.find(p => p.id === gameState.president);
  const isHumanPresident = president?.isHuman;
  const power = gameState.availablePower;

  const getPowerIcon = (power: SpecialPower) => {
    switch (power) {
      case 'investigate-loyalty': return Eye;
      case 'special-election': return Vote;
      case 'policy-peek': return Zap;
      case 'execution': return Skull;
    }
  };

  const getPowerColor = (power: SpecialPower) => {
    switch (power) {
      case 'investigate-loyalty': return 'blue';
      case 'special-election': return 'purple';
      case 'policy-peek': return 'yellow';
      case 'execution': return 'red';
    }
  };

  const getPowerDescription = (power: SpecialPower) => {
    switch (power) {
      case 'investigate-loyalty':
        return 'Secretly learn another player\'s party affiliation (Liberal or Fascist)';
      case 'special-election':
        return 'Choose the next President (skipping normal rotation)';
      case 'policy-peek':
        return 'Look at the next 3 policies in the deck';
      case 'execution':
        return 'Eliminate a player from the game permanently';
    }
  };

  const getEligibleTargets = () => {
    switch (power) {
      case 'investigate-loyalty':
        return gameState.players.filter(p => 
          p.id !== gameState.president && 
          p.isAlive && 
          !gameState.investigationResults[p.id]
        );
      case 'special-election':
        return gameState.players.filter(p => 
          p.id !== gameState.president && 
          p.isAlive
        );
      case 'execution':
        return gameState.players.filter(p => 
          p.id !== gameState.president && 
          p.isAlive
        );
      case 'policy-peek':
        return []; // No target needed
    }
  };

  const handleUsePower = () => {
    if (!power) return;

    if (power === 'policy-peek') {
      // Simulate policy peek
      const nextPolicies = gameState.policyDeck.slice(0, 3);
      setPolicyPeekResult(nextPolicies);
      setPowerUsed(true);
      onUsePower();
    } else if (selectedTarget) {
      if (power === 'investigate-loyalty') {
        const target = gameState.players.find(p => p.id === selectedTarget);
        if (target) {
          const result = target.role === 'liberal' ? 'Liberal' : 'Fascist';
          setInvestigationResult(result);
        }
      }
      
      setPowerUsed(true);
      onUsePower(selectedTarget);
    }
  };

  // Auto-use power for AI president
  React.useEffect(() => {
    if (!isHumanPresident && !powerUsed && power) {
      const timer = setTimeout(() => {
        if (power === 'policy-peek') {
          handleUsePower();
        } else {
          const eligibleTargets = getEligibleTargets();
          if (eligibleTargets.length > 0) {
            const randomTarget = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
            setSelectedTarget(randomTarget.id);
            setTimeout(() => handleUsePower(), 1000);
          }
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isHumanPresident, powerUsed, power]);

  if (!power) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-lg">No special power available</p>
          <button
            onClick={onContinue}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const PowerIcon = getPowerIcon(power);
  const powerColor = getPowerColor(power);
  const eligibleTargets = getEligibleTargets();

  // Show results
  if (powerUsed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-8">
            <PowerIcon className={`w-16 h-16 text-${powerColor}-500 mx-auto mb-6`} />
            
            <h1 className="text-3xl font-bold text-white mb-4">Power Used</h1>
            
            {investigationResult && (
              <div className={`p-6 rounded-lg border-2 mb-6 ${
                investigationResult === 'Liberal' 
                  ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
                  : 'border-red-500 bg-red-900 bg-opacity-20'
              }`}>
                <div className="text-white font-bold text-lg mb-2">Investigation Result</div>
                <div className={`text-2xl font-bold ${
                  investigationResult === 'Liberal' ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {gameState.players.find(p => p.id === selectedTarget)?.name} is {investigationResult}
                </div>
              </div>
            )}
            
            {policyPeekResult && (
              <div className="mb-6">
                <div className="text-white font-bold text-lg mb-4">Next 3 Policies</div>
                <div className="flex justify-center space-x-4">
                  {policyPeekResult.map((policy, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        policy === 'liberal' 
                          ? 'border-blue-500 bg-blue-900 bg-opacity-20 text-blue-400' 
                          : 'border-red-500 bg-red-900 bg-opacity-20 text-red-400'
                      }`}
                    >
                      <div className="font-bold">{policy.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {power === 'special-election' && selectedTarget && (
              <div className="mb-6">
                <div className="text-white font-bold text-lg mb-2">Special Election</div>
                <div className="text-purple-400 text-xl">
                  {gameState.players.find(p => p.id === selectedTarget)?.name} is the new President
                </div>
              </div>
            )}
            
            {power === 'execution' && selectedTarget && (
              <div className="mb-6">
                <div className="text-white font-bold text-lg mb-2">Execution</div>
                <div className="text-red-400 text-xl">
                  {gameState.players.find(p => p.id === selectedTarget)?.name} has been eliminated
                </div>
              </div>
            )}
            
            <button
              onClick={onContinue}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-500 hover:to-green-600 transition-all duration-300"
            >
              Continue
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
          <PowerIcon className={`w-12 h-12 text-${powerColor}-500 mx-auto mb-4`} />
          <h1 className="text-3xl font-bold text-white mb-2">Special Power</h1>
          <p className="text-gray-400">
            {isHumanPresident ? 'Use your presidential power' : `${president?.name} is using their power...`}
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

        {/* Power Description */}
        <div className={`bg-${powerColor}-900 bg-opacity-20 border border-${powerColor}-700 rounded-xl p-6 mb-8`}>
          <div className="flex items-center mb-4">
            <PowerIcon className={`w-8 h-8 text-${powerColor}-400 mr-3`} />
            <h3 className={`text-xl font-bold text-${powerColor}-400`}>
              {power.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h3>
          </div>
          <p className="text-gray-300">{getPowerDescription(power)}</p>
        </div>

        {isHumanPresident ? (
          <>
            {/* Target Selection */}
            {eligibleTargets.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Select Target:
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eligibleTargets.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedTarget(player.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        selectedTarget === player.id
                          ? `border-${powerColor}-500 bg-${powerColor}-900 bg-opacity-40 shadow-lg transform scale-105`
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
            )}

            {/* Use Power Button */}
            <div className="text-center">
              <button
                onClick={handleUsePower}
                disabled={eligibleTargets.length > 0 && !selectedTarget}
                className={`px-8 py-3 bg-gradient-to-r from-${powerColor}-600 to-${powerColor}-700 text-white font-bold text-lg rounded-lg shadow-xl hover:from-${powerColor}-500 hover:to-${powerColor}-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                Use Power
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
              <p className="text-gray-300">
                {president?.name} is deciding how to use their power...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}