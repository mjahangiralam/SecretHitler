import React from 'react';
import { GameState } from '../types/game';
import { Trophy, RotateCcw, Home, Eye, EyeOff } from 'lucide-react';

interface GameOverScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function GameOverScreen({ gameState, onRestart, onMainMenu }: GameOverScreenProps) {
  const [showRoles, setShowRoles] = React.useState(false);
  
  const isLiberalWin = gameState.winner === 'liberal';
  const humanPlayer = gameState.players.find(p => p.isHuman);
  const humanWon = humanPlayer && (
    (isLiberalWin && humanPlayer.role === 'liberal') ||
    (!isLiberalWin && (humanPlayer.role === 'fascist' || humanPlayer.role === 'hitler'))
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'liberal': return 'text-blue-400';
      case 'fascist': return 'text-red-400';
      case 'hitler': return 'text-gray-300';
      default: return 'text-white';
    }
  };

  const getRoleBg = (role: string) => {
    switch (role) {
      case 'liberal': return 'bg-blue-900 bg-opacity-20 border-blue-700';
      case 'fascist': return 'bg-red-900 bg-opacity-20 border-red-700';
      case 'hitler': return 'bg-gray-800 bg-opacity-40 border-gray-600';
      default: return 'bg-gray-800 bg-opacity-40 border-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Victory Header */}
        <div className="text-center mb-8 pt-8">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${isLiberalWin ? 'text-blue-500' : 'text-red-500'}`} />
          
          <div className={`text-6xl font-bold mb-4 ${isLiberalWin ? 'text-blue-400' : 'text-red-400'}`}>
            {isLiberalWin ? 'LIBERALS WIN!' : 'FASCISTS WIN!'}
          </div>
          
          <div className={`text-xl mb-6 ${humanWon ? 'text-green-400' : 'text-red-400'}`}>
            {humanWon ? '🎉 You Won!' : '💀 You Lost!'}
          </div>
          
          <div className="text-gray-300 text-lg">
            {gameState.winReason}
          </div>
        </div>

        {/* Game Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Final Board State */}
          <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Final Board State</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-400">Liberal Policies:</span>
                <span className="text-white font-bold">{gameState.liberalPolicies}/5</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-red-400">Fascist Policies:</span>
                <span className="text-white font-bold">{gameState.fascistPolicies}/6</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-orange-400">Failed Elections:</span>
                <span className="text-white font-bold">{gameState.electionTracker}/3</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rounds Played:</span>
                <span className="text-white font-bold">{gameState.round}</span>
              </div>
            </div>
          </div>

          {/* Your Performance */}
          <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Performance</h3>
            
            {humanPlayer && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Your Role:</span>
                  <span className={`font-bold ${getRoleColor(humanPlayer.role)}`}>
                    {humanPlayer.role.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Party:</span>
                  <span className={`font-bold ${humanPlayer.role === 'liberal' ? 'text-blue-400' : 'text-red-400'}`}>
                    {humanPlayer.role === 'liberal' ? 'LIBERAL' : 'FASCIST'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-bold ${humanPlayer.isAlive ? 'text-green-400' : 'text-red-400'}`}>
                    {humanPlayer.isAlive ? 'ALIVE' : 'ELIMINATED'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Result:</span>
                  <span className={`font-bold ${humanWon ? 'text-green-400' : 'text-red-400'}`}>
                    {humanWon ? 'VICTORY' : 'DEFEAT'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Role Reveal */}
        <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Player Roles</h3>
            <button
              onClick={() => setShowRoles(!showRoles)}
              className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {showRoles ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showRoles ? 'Hide' : 'Reveal'} Roles
            </button>
          </div>
          
          {showRoles && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border ${getRoleBg(player.role)} ${
                    !player.isAlive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{player.name}</span>
                    {player.isHuman && <span className="text-green-400 text-sm">(You)</span>}
                  </div>
                  
                  <div className={`font-bold ${getRoleColor(player.role)}`}>
                    {player.role.toUpperCase()}
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    {player.role === 'liberal' ? 'Liberal Party' : 'Fascist Party'}
                    {!player.isAlive && ' • Eliminated'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6">
          <button
            onClick={onRestart}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-500 hover:to-green-600 transform hover:scale-105 transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </button>
          
          <button
            onClick={onMainMenu}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-lg hover:from-gray-500 hover:to-gray-600 transform hover:scale-105 transition-all duration-300"
          >
            <Home className="w-5 h-5 mr-2" />
            Main Menu
          </button>
        </div>

        {/* Quote */}
        <div className="text-center mt-12">
          <div className="text-gray-500 text-sm italic">
            {isLiberalWin 
              ? '"Democracy is the worst form of government, except for all the others."'
              : '"The only thing necessary for the triumph of evil is for good men to do nothing."'
            }
          </div>
        </div>
      </div>
    </div>
  );
}