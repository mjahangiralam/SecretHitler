import React, { useState } from 'react';
import { GameState, SpecialPower, GameConfig } from '../types/game';
import { Eye, Vote, Zap, Skull, AlertTriangle, Info } from 'lucide-react';
import { playElevenLabsAudio, isElevenLabsEnabled } from '../utils/audioUtils';

interface SpecialPowerScreenProps {
  gameState: GameState;
  config: GameConfig;
  onUsePower: (targetId?: string, result?: unknown) => void;
  onContinue: () => void;
}

export function SpecialPowerScreen({ gameState, config, onUsePower, onContinue }: SpecialPowerScreenProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [powerUsed, setPowerUsed] = useState(false);
  const [investigationResult, setInvestigationResult] = useState<string | null>(null);
  const [policyPeekResult, setPolicyPeekResult] = useState<string[] | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const president = gameState.players.find(p => p.id === gameState.president);
  const isHumanPresident = president?.isHuman;
  const power = gameState.availablePower;

  // Check for recent execution in chat messages
  const recentExecution = gameState.chatMessages
    .filter(msg => msg.message.includes('executed') && msg.timestamp > Date.now() - 10000) // Last 10 seconds
    .pop();

  const executedPlayerName = recentExecution?.message.match(/executed (.+)/)?.[1];

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

  const getPowerWarning = (power: SpecialPower) => {
    switch (power) {
      case 'execution':
        return 'Executing Hitler results in immediate Liberal victory.';
      case 'investigate-loyalty':
        return 'You may choose whether to reveal this information to other players.';
      case 'policy-peek':
        return 'Use this knowledge strategically — others cannot verify your claim.';
      case 'special-election':
        return 'The chosen player will become the next President, then normal order resumes.';
      default:
        return null;
    }
  };

  const getEligibleTargets = () => {
    switch (power) {
      case 'investigate-loyalty':
        return gameState.players.filter(p => 
          p.id !== gameState.president && // Can't investigate self
          p.isAlive && // Must be alive
          !gameState.investigationResults[p.id] // Haven't been investigated before
        );
      case 'execution':
        return gameState.players.filter(p => 
          p.id !== gameState.president && // Can't kill self
          p.isAlive // Must be alive
        );
      case 'special-election':
        return gameState.players.filter(p => 
          p.id !== gameState.president && // Can't elect self
          p.isAlive // Must be alive
        );
      default:
        return [];
    }
  };

  // const deadPlayers = gameState.players.filter(p => !p.isAlive);
  // const investigatedPlayers = Object.entries(gameState.investigationResults).map(([id, role]) => ({
  //   player: gameState.players.find(p => p.id === id)!,
  //   role
  // }));

  const playPowerAnnouncement = async (powerName: string) => {
    if (config.voiceChatEnabled && isElevenLabsEnabled(config.elevenLabsKey)) {
      setIsPlayingAudio(true);
      try {
        const announcement = `Presidential power activated: ${powerName}`;
        await playElevenLabsAudio(config.elevenLabsKey!, announcement, 'pNInz6obpgDQGcFmaJgB');
      } catch (error) {
        console.error('Failed to play power announcement:', error);
      } finally {
        setIsPlayingAudio(false);
      }
    }
  };

  const handleUsePower = async () => {
    if (!power) return;
    console.log('Using power:', power, 'on target:', selectedTarget);

    // Play announcement
    const powerNames = {
      'investigate-loyalty': 'Investigate Loyalty',
      'special-election': 'Special Election',
      'policy-peek': 'Policy Peek',
      'execution': 'Execution'
    };
    
    await playPowerAnnouncement(powerNames[power]);

    if (power === 'policy-peek') {
      // For policy peek, show the cards first, then mark as used when done
      const nextPolicies = gameState.policyDeck.slice(0, 3);
      setPolicyPeekResult(nextPolicies);
      setPowerUsed(true);
      // Don't call onUsePower yet - wait for user to click continue
    } else if (selectedTarget) {
      if (power === 'investigate-loyalty') {
        const target = gameState.players.find(p => p.id === selectedTarget);
        if (target) {
          const result = target.role === 'liberal' ? 'Liberal' : 'Fascist';
          setInvestigationResult(result);
        }
      }
      
      setPowerUsed(true);
      // Call onUsePower to actually execute the power
      onUsePower(selectedTarget);
      
      // For AI, continue after showing the result briefly
      if (!isHumanPresident) {
        setTimeout(() => onContinue(), 2000);
      }
    }
  };

  const handleContinue = () => {
    if (power === 'policy-peek' && policyPeekResult) {
      // For policy peek, call onUsePower when user clicks continue
      onUsePower();
    }
    onContinue();
  };

  // Auto-use power for AI president
  React.useEffect(() => {
    if (!isHumanPresident && !powerUsed && power) {
      console.log('AI President using special power:', power);
      
      const timer = setTimeout(() => {
        if (power === 'policy-peek') {
          console.log('AI using policy peek power');
          handleUsePower();
          // For policy peek, AI will continue after a delay
          setTimeout(() => {
            console.log('AI continuing after policy peek');
            handleContinue();
          }, 3000);
        } else {
          const targets = getEligibleTargets() || [];
          console.log('Eligible targets for power:', targets.map(p => p.name));
          
          if (targets.length > 0) {
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            console.log('AI selected target:', randomTarget.name);
            setSelectedTarget(randomTarget.id);
            
            // Add a delay before using the power
            setTimeout(() => {
              console.log('AI executing power on target');
              handleUsePower();
              // Add a delay before continuing
              setTimeout(() => {
                console.log('AI continuing after power use');
                onContinue();
              }, 1000);
            }, 1000);
          } else {
            console.log('No eligible targets for power, continuing');
            onContinue();
          }
        }
      }, 2000);
      
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
  const targets = getEligibleTargets() || [];
  const warning = getPowerWarning(power);

  // Show results
  if (powerUsed) {
    // Special execution announcement screen
    if (power === 'execution' && selectedTarget) {
      const executedPlayer = gameState.players.find(p => p.id === selectedTarget);
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            <div className="bg-black bg-opacity-60 border border-red-700 rounded-xl p-8">
              <Skull className="w-20 h-20 text-red-500 mx-auto mb-6" />
              
              <h1 className="text-4xl font-bold text-red-400 mb-4">EXECUTION</h1>
              
              <div className="bg-red-900 bg-opacity-30 border-2 border-red-600 rounded-lg p-6 mb-6">
                <div className="text-white font-bold text-2xl mb-2">
                  {executedPlayer?.name}
                </div>
                <div className="text-red-300 text-lg mb-4">
                  has been eliminated
                </div>
                <div className="flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="text-sm">This player is permanently removed from the game</span>
                </div>
              </div>
              
              {executedPlayer?.role === 'hitler' && (
                <div className="bg-green-900 bg-opacity-30 border-2 border-green-600 rounded-lg p-4 mb-6">
                  <div className="text-green-400 font-bold text-xl mb-2">
                    🎉 LIBERAL VICTORY! 🎉
                  </div>
                  <div className="text-green-300">
                    Hitler was executed! The Liberals have won the game!
                  </div>
                </div>
              )}
              
              <button
                onClick={handleContinue}
                disabled={isPlayingAudio}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 disabled:opacity-50"
              >
                {isPlayingAudio ? 'Playing Audio...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      );
    }

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
                <div className="mt-4 flex items-center justify-center text-yellow-400">
                  <Info className="w-4 h-4 mr-2" />
                  <span className="text-sm">You may choose whether to reveal this information</span>
                </div>
              </div>
            )}
            
            {policyPeekResult && isHumanPresident && (
              <div className="mb-6">
                <div className="text-white font-bold text-lg mb-4">Next 3 Policies</div>
                <div className="flex justify-center space-x-4 mb-4">
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
                <div className="flex items-center justify-center text-yellow-400">
                  <Info className="w-4 h-4 mr-2" />
                  <span className="text-sm">Use this knowledge strategically — others cannot verify your claim</span>
                </div>
              </div>
            )}
            
            {policyPeekResult && !isHumanPresident && (
              <div className="mb-6">
                <div className="text-white font-bold text-lg mb-4">Policy Peek Used</div>
                <div className="text-gray-300 mb-4">
                  {president?.name} looked at the top 3 policy cards
                </div>
                <div className="flex items-center justify-center text-yellow-400">
                  <Info className="w-4 h-4 mr-2" />
                  <span className="text-sm">Only the President can see the actual policy cards</span>
                </div>
              </div>
            )}
            
            {power === 'special-election' && selectedTarget && (
              <div className="mb-6">
                <div className="text-white font-bold text-lg mb-2">Special Election</div>
                <div className="text-purple-400 text-xl mb-4">
                  {gameState.players.find(p => p.id === selectedTarget)?.name} is the new President
                </div>
                <div className="flex items-center justify-center text-yellow-400">
                  <Info className="w-4 h-4 mr-2" />
                  <span className="text-sm">Normal presidential order resumes after this special presidency</span>
                </div>
              </div>
            )}
            
            <button
              onClick={handleContinue}
              disabled={isPlayingAudio}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-500 hover:to-green-600 transition-all duration-300 disabled:opacity-50"
            >
              {isPlayingAudio ? 'Playing Audio...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show execution announcement for all players when someone is executed
  if (recentExecution && executedPlayerName) {
    const executedPlayer = gameState.players.find(p => p.name === executedPlayerName);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-black bg-opacity-60 border border-red-700 rounded-xl p-8">
            <Skull className="w-20 h-20 text-red-500 mx-auto mb-6" />
            
            <h1 className="text-4xl font-bold text-red-400 mb-4">EXECUTION</h1>
            
            <div className="bg-red-900 bg-opacity-30 border-2 border-red-600 rounded-lg p-6 mb-6">
              <div className="text-white font-bold text-2xl mb-2">
                {executedPlayerName}
              </div>
              <div className="text-red-300 text-lg mb-4">
                has been eliminated
              </div>
              <div className="flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="text-sm">This player is permanently removed from the game</span>
              </div>
            </div>
            
            {executedPlayer?.role === 'hitler' && (
              <div className="bg-green-900 bg-opacity-30 border-2 border-green-600 rounded-lg p-4 mb-6">
                <div className="text-green-400 font-bold text-xl mb-2">
                  🎉 LIBERAL VICTORY! 🎉
                </div>
                <div className="text-green-300">
                  Hitler was executed! The Liberals have won the game!
                </div>
              </div>
            )}
            
            <button
              onClick={onContinue}
              disabled={isPlayingAudio}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 disabled:opacity-50"
            >
              {isPlayingAudio ? 'Playing Audio...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default special power screen for other powers
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <PowerIcon className={`w-12 h-12 text-${powerColor}-500 mx-auto mb-4`} />
          <h1 className="text-3xl font-bold text-white mb-2">Presidential Power</h1>
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
        <div className={`bg-${powerColor}-900 bg-opacity-20 border border-${powerColor}-700 rounded-xl p-6 mb-6`}>
          <div className="flex items-center mb-4">
            <PowerIcon className={`w-8 h-8 text-${powerColor}-400 mr-3`} />
            <h3 className={`text-xl font-bold text-${powerColor}-400`}>
              {power.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h3>
          </div>
          <p className="text-gray-300 mb-4">{getPowerDescription(power)}</p>
          
          {warning && (
            <div className={`flex items-start p-3 rounded-lg ${
              power === 'execution' ? 'bg-red-900 bg-opacity-20 border border-red-700' : 'bg-yellow-900 bg-opacity-20 border border-yellow-700'
            }`}>
              {power === 'execution' ? (
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <span className={`text-sm ${power === 'execution' ? 'text-red-300' : 'text-yellow-300'}`}>
                {warning}
              </span>
            </div>
          )}
        </div>

        {isHumanPresident ? (
          <>
            {/* Target Selection */}
            {targets.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Select Target:
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {targets.map((player) => (
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
                disabled={(targets.length > 0 && !selectedTarget) || isPlayingAudio}
                className={`px-8 py-3 bg-gradient-to-r from-${powerColor}-600 to-${powerColor}-700 text-white font-bold text-lg rounded-lg shadow-xl hover:from-${powerColor}-500 hover:to-${powerColor}-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isPlayingAudio ? 'Playing Audio...' : 'Use Power'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-8">
              {power === 'policy-peek' ? (
                <>
                  <div className="animate-pulse mb-6">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
                    <div className="w-48 h-4 bg-gray-700 rounded mx-auto mb-2"></div>
                    <div className="w-32 h-3 bg-gray-700 rounded mx-auto"></div>
                  </div>
                  <p className="text-gray-300 mb-4">
                    {president?.name} is looking at the top 3 policy cards...
                  </p>
                  <div className="flex items-center justify-center text-yellow-400">
                    <Info className="w-4 h-4 mr-2" />
                    <span className="text-sm">Only the President can see the actual policy cards</span>
                  </div>
                </>
              ) : power === 'execution' ? (
                <>
                  <div className="animate-pulse mb-6">
                    <div className="w-16 h-16 bg-red-700 rounded-full mx-auto mb-4"></div>
                    <div className="w-48 h-4 bg-red-700 rounded mx-auto mb-2"></div>
                    <div className="w-32 h-3 bg-red-700 rounded mx-auto"></div>
                  </div>
                  <p className="text-gray-300 mb-4">
                    {president?.name} is choosing someone to eliminate...
                  </p>
                  <div className="flex items-center justify-center text-red-400">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="text-sm">The chosen player will be permanently removed from the game</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="animate-pulse mb-6">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
                    <div className="w-48 h-4 bg-gray-700 rounded mx-auto mb-2"></div>
                    <div className="w-32 h-3 bg-gray-700 rounded mx-auto"></div>
                  </div>
                  <p className="text-gray-300">
                    {president?.name} is deciding how to use their power...
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}