import React from 'react';
import { GameState, Player } from '../types/game';
import { Crown, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface GameBoardProps {
  gameState: GameState;
  onPlayerClick?: (playerId: string) => void;
  showRoles?: boolean;
}

export function GameBoard({ gameState, onPlayerClick, showRoles = false }: GameBoardProps) {
  const playerCount = gameState.players.length;
  
  const PolicyTrack = ({ type, count, max }: { type: 'liberal' | 'fascist', count: number, max: number }) => {
    const isLiberal = type === 'liberal';
    const color = isLiberal ? 'blue' : 'red';
    const bgColor = isLiberal ? 'bg-blue-900' : 'bg-red-900';
    const accentColor = isLiberal ? 'bg-blue-500' : 'bg-red-500';
    
    return (
      <div className={`${bgColor} bg-opacity-20 border border-${color}-700 rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-${color}-400 font-bold text-lg`}>
            {type.charAt(0).toUpperCase() + type.slice(1)} Policies
          </h3>
          <div className={`text-${color}-300 font-bold`}>
            {count}/{max}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {Array.from({ length: max }, (_, i) => (
            <div
              key={i}
              className={clsx(
                "flex-1 h-8 rounded border-2 transition-all duration-300",
                i < count 
                  ? `${accentColor} border-${color}-400 shadow-lg` 
                  : `bg-gray-800 border-gray-600`
              )}
            >
              {i < count && (
                <div className="w-full h-full flex items-center justify-center">
                  <CheckCircle className={`w-4 h-4 text-${color}-200`} />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Special powers indicators for fascist track */}
        {type === 'fascist' && (
          <div className="mt-2 flex space-x-2 text-xs">
            {Array.from({ length: max }, (_, i) => {
              const policyNumber = i + 1;
              const powers: Record<number, Record<number, string>> = {
                5: { 3: '👁️', 4: '💀' },
                7: { 2: '🔍', 3: '🗳️', 4: '💀', 5: '💀' },
                9: { 1: '🔍', 2: '🔍', 3: '🗳️', 4: '💀', 5: '💀' }
              };
              
              const power = powers[playerCount]?.[policyNumber];
              
              return (
                <div key={i} className="flex-1 text-center text-gray-500">
                  {power || ''}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const PlayerCard = ({ player }: { player: Player }) => {
    const isPresident = gameState.president === player.id;
    const isChancellor = gameState.chancellor === player.id;
    const isHuman = player.isHuman;
    
    return (
      <div
        className={clsx(
          "relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer",
          !player.isAlive && "opacity-50 grayscale",
          isPresident && "border-yellow-500 bg-yellow-900 bg-opacity-20",
          isChancellor && "border-purple-500 bg-purple-900 bg-opacity-20",
          !isPresident && !isChancellor && "border-gray-600 bg-gray-800 bg-opacity-40",
          "hover:scale-105 hover:shadow-lg"
        )}
        onClick={() => onPlayerClick?.(player.id)}
      >
        {/* Role badges */}
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            {isPresident && (
              <div className="bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded font-bold flex items-center">
                <Crown className="w-3 h-3 mr-1" />
                PRESIDENT
              </div>
            )}
            {isChancellor && (
              <div className="bg-purple-600 text-purple-100 text-xs px-2 py-1 rounded font-bold">
                CHANCELLOR
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {isHuman && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Human Player" />
            )}
            {!player.isAlive && (
              <XCircle className="w-4 h-4 text-red-500" title="Eliminated" />
            )}
          </div>
        </div>

        {/* Player name */}
        <div className="text-white font-semibold mb-1">{player.name}</div>
        
        {/* Role (if revealed) */}
        {showRoles && (
          <div className={clsx(
            "text-xs font-bold",
            player.role === 'liberal' && "text-blue-400",
            player.role === 'fascist' && "text-red-400",
            player.role === 'hitler' && "text-gray-400"
          )}>
            {player.role.toUpperCase()}
          </div>
        )}

        {/* AI personality indicator */}
        {!isHuman && player.personality && (
          <div className="text-xs text-gray-400 mt-1">
            {player.personality.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Game Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Secret Hitler</h1>
          <div className="text-gray-400">
            Round {gameState.round} • {gameState.phase.replace('-', ' ').toUpperCase()}
          </div>
        </div>

        {/* Policy Tracks */}
        <div className="grid md:grid-cols-2 gap-6">
          <PolicyTrack type="liberal" count={gameState.liberalPolicies} max={5} />
          <PolicyTrack type="fascist" count={gameState.fascistPolicies} max={6} />
        </div>

        {/* Election Tracker */}
        <div className="bg-black bg-opacity-40 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-orange-400 font-bold flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Election Tracker
            </h3>
            <div className="text-orange-300">
              {gameState.electionTracker}/3 Failed Elections
            </div>
          </div>
          
          <div className="flex space-x-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className={clsx(
                  "flex-1 h-6 rounded border-2 transition-all duration-300",
                  i < gameState.electionTracker 
                    ? "bg-orange-500 border-orange-400" 
                    : "bg-gray-800 border-gray-600"
                )}
              />
            ))}
          </div>
          
          {gameState.electionTracker >= 2 && (
            <div className="mt-2 text-orange-300 text-sm text-center">
              ⚠️ Next failed election will enact the top policy automatically
            </div>
          )}
        </div>

        {/* Players Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Players</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {gameState.players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}