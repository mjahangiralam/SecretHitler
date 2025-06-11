import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import { Shield, Eye, EyeOff, Users } from 'lucide-react';

interface RoleRevealScreenProps {
  humanPlayer: Player;
  allPlayers: Player[];
  playerCount: number;
  onContinue: () => void;
}

export function RoleRevealScreen({ humanPlayer, allPlayers, playerCount, onContinue }: RoleRevealScreenProps) {
  const [showRole, setShowRole] = useState(false);
  const [showTeammates, setShowTeammates] = useState(false);

  // Determine what the human player should know based on their role and player count
  const getKnownTeammates = () => {
    if (humanPlayer.role === 'liberal') {
      return [];
    } else if (humanPlayer.role === 'fascist') {
      // Fascists always know each other and Hitler
      return allPlayers.filter(p => 
        p.id !== humanPlayer.id && (p.role === 'fascist' || p.role === 'hitler')
      );
    } else if (humanPlayer.role === 'hitler') {
      // Hitler knows fascists only in 5-player games
      if (playerCount === 5) {
        return allPlayers.filter(p => p.role === 'fascist');
      }
      return [];
    }
    return [];
  };

  const teammates = getKnownTeammates();
  const hasTeammates = teammates.length > 0;

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
      case 'liberal': return 'from-blue-900 to-blue-800';
      case 'fascist': return 'from-red-900 to-red-800';
      case 'hitler': return 'from-gray-800 to-gray-700';
      default: return 'from-gray-800 to-gray-700';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'liberal':
        return "You fight for democracy and freedom. Enact 5 Liberal policies or eliminate Hitler to win.";
      case 'fascist':
        return "You seek to overthrow the government. Enact 6 Fascist policies or get Hitler elected as Chancellor to win.";
      case 'hitler':
        return "You are the secret leader of the fascist movement. Stay hidden until you can seize power as Chancellor.";
      default:
        return "";
    }
  };

  useEffect(() => {
    // Auto-reveal role after a short delay for dramatic effect
    const timer = setTimeout(() => setShowRole(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Dramatic header */}
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-4xl font-bold text-white mb-2">Your Role</h1>
          <p className="text-gray-400">The fate of the nation rests in your hands</p>
        </div>

        {/* Role Card */}
        <div className="relative mb-8">
          <div className={`bg-gradient-to-br ${getRoleBg(humanPlayer.role)} border-2 border-gray-600 rounded-xl p-8 shadow-2xl transform transition-all duration-500 ${showRole ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
            {!showRole ? (
              <div className="text-center py-12">
                <div className="animate-pulse">
                  <div className="w-32 h-8 bg-gray-700 rounded mx-auto mb-4"></div>
                  <div className="w-48 h-4 bg-gray-700 rounded mx-auto"></div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <h2 className={`text-3xl font-bold mb-2 ${getRoleColor(humanPlayer.role)}`}>
                    {humanPlayer.role.toUpperCase()}
                  </h2>
                  <div className="w-24 h-1 bg-current mx-auto opacity-50"></div>
                </div>
                
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {getRoleDescription(humanPlayer.role)}
                </p>

                {/* Party Affiliation */}
                <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-400 mb-1">Party Affiliation</div>
                  <div className={`text-xl font-bold ${humanPlayer.role === 'liberal' ? 'text-blue-400' : 'text-red-400'}`}>
                    {humanPlayer.role === 'liberal' ? 'LIBERAL' : 'FASCIST'}
                  </div>
                </div>

                {/* Teammates section */}
                {hasTeammates && (
                  <div className="border-t border-gray-600 pt-6">
                    <button
                      onClick={() => setShowTeammates(!showTeammates)}
                      className="flex items-center justify-center w-full text-yellow-400 hover:text-yellow-300 transition-colors mb-4"
                    >
                      {showTeammates ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showTeammates ? 'Hide' : 'Reveal'} Your Allies
                    </button>

                    {showTeammates && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center mb-3">
                          <Users className="w-4 h-4 mr-2 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">Known Allies</span>
                        </div>
                        
                        {teammates.map((teammate) => (
                          <div key={teammate.id} className="bg-black bg-opacity-40 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-white font-medium">{teammate.name}</span>
                            <span className={`text-sm font-semibold ${getRoleColor(teammate.role)}`}>
                              {teammate.role.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Continue button */}
        {showRole && (
          <div className="text-center">
            <button
              onClick={onContinue}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg rounded-lg shadow-xl hover:from-green-500 hover:to-green-600 transform hover:scale-105 transition-all duration-300 border border-green-500"
            >
              Enter the Game
            </button>
            
            <p className="text-gray-500 text-sm mt-4">
              Remember: Keep your role secret from other players
            </p>
          </div>
        )}
      </div>
    </div>
  );
}