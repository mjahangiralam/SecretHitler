import React from 'react';
import { GameState } from '../types/game';
import { Scroll, Skull, Crown, Eye, Vote } from 'lucide-react';

interface PolicyBoardsScreenProps {
  gameState: GameState;
  onContinue: () => void;
}

export function PolicyBoardsScreen({ gameState, onContinue }: PolicyBoardsScreenProps) {
  const playerCount = gameState.players.length;

  // Define special powers based on player count
  const specialPowers = {
    5: [
      null, null,
      { icon: Eye, name: 'Policy Peek', color: 'yellow' },
      { icon: Skull, name: 'Execution', color: 'red' },
      { icon: Skull, name: 'Execution', color: 'red' },
      { icon: null, name: 'Victory!', color: 'red' }
    ],
    7: [
      null,
      { icon: Eye, name: 'Investigate Loyalty', color: 'blue' },
      { icon: Vote, name: 'Special Election', color: 'purple' },
      { icon: Skull, name: 'Execution', color: 'red' },
      { icon: Skull, name: 'Execution', color: 'red' },
      { icon: null, name: 'Victory!', color: 'red' }
    ],
    9: [
      { icon: Eye, name: 'Investigate Loyalty', color: 'blue' },
      { icon: Eye, name: 'Investigate Loyalty', color: 'blue' },
      { icon: Vote, name: 'Special Election', color: 'purple' },
      { icon: Skull, name: 'Execution', color: 'red' },
      { icon: Skull, name: 'Execution', color: 'red' },
      { icon: null, name: 'Victory!', color: 'red' }
    ]
  };

  const powers = specialPowers[playerCount as 5 | 7 | 9] || specialPowers[5];

  const renderPolicySlot = (isFilled: boolean, isFascist: boolean, power: typeof powers[0] | null = null) => (
    <div className="text-center">
      <div 
        className={`w-20 h-28 border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
          isFilled
            ? isFascist
              ? 'bg-red-900 border-red-700 shadow-red-900/50'
              : 'bg-blue-900 border-blue-700 shadow-blue-900/50'
            : 'bg-gray-900 border-gray-700'
        } ${isFilled ? 'shadow-lg' : ''}`}
      >
        {isFilled && (
          <div className="transform scale-110">
            {isFascist ? (
              <Skull className="w-8 h-8 text-red-500" />
            ) : (
              <Scroll className="w-8 h-8 text-blue-500" />
            )}
          </div>
        )}
      </div>
      {power && (
        <div className="mt-1">
          {power.icon && (
            <div className={`text-${power.color}-500 mb-0.5`}>
              <power.icon className="w-4 h-4 mx-auto" />
            </div>
          )}
          <div className="text-xs text-gray-400 leading-tight">{power.name}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Policy Boards</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Liberal Board */}
          <div className="bg-blue-900/20 border-2 border-blue-700 rounded-xl p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-blue-400 mb-2">Liberal Policies</h2>
              <p className="text-gray-400">5 policies needed to win</p>
            </div>

            <div className="flex justify-center gap-3 mb-4">
              {[...Array(5)].map((_, i) => renderPolicySlot(i < gameState.liberalPolicies, false))}
            </div>

            <div className="text-center text-sm text-gray-400">
              When 5 Liberal policies are enacted, the Liberals win!
            </div>
          </div>

          {/* Fascist Board */}
          <div className="bg-red-900/20 border-2 border-red-700 rounded-xl p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-red-400 mb-2">Fascist Policies</h2>
              <p className="text-gray-400">6 policies needed for Fascist victory</p>
            </div>
            
            <div className="flex justify-center gap-3 mb-4">
              {powers.map((power, i) => renderPolicySlot(i < gameState.fascistPolicies, true, power))}
            </div>

            <div className="text-center text-sm text-gray-400 mt-4">
              {playerCount === 5 && "5-6 Players: Powers start at 3rd policy"}
              {playerCount === 7 && "7-8 Players: Powers start at 2nd policy"}
              {playerCount === 9 && "9-10 Players: Powers start at 1st policy"}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center mt-8">
          <button
            onClick={onContinue}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
} 