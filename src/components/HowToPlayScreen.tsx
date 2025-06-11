import React, { useState } from 'react';
import { BookOpen, Shield, Target, Users, ArrowLeft } from 'lucide-react';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  const [activeTab, setActiveTab] = useState('rules');

  const tabs = [
    { id: 'rules', label: 'Basic Rules', icon: BookOpen },
    { id: 'roles', label: 'Roles & Powers', icon: Users },
    { id: 'victory', label: 'Victory Conditions', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8 pt-8">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors mr-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <h1 className="text-4xl font-bold text-white">How to Play</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-black bg-opacity-40 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-black bg-opacity-40 rounded-xl border border-gray-700 p-8">
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <Shield className="w-8 h-8 text-red-500 mr-3" />
                <h2 className="text-2xl font-bold text-white">Game Overview</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">The Setup</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Players are secretly assigned roles: Liberals, Fascists, or Hitler</li>
                    <li>• Each round, players elect a President and Chancellor</li>
                    <li>• The government enacts policies from a deck of cards</li>
                    <li>• Fascist policies grant special powers to the President</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Game Flow</h3>
                  <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                    <li>President nominates a Chancellor</li>
                    <li>All players vote on the government</li>
                    <li>If approved, they draw and enact policies</li>
                    <li>Discussion phase with AI opponents</li>
                    <li>Special powers may activate</li>
                    <li>Repeat until someone wins</li>
                  </ol>
                </div>
              </div>

              <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 mt-6">
                <h4 className="text-red-400 font-semibold mb-2">⚠️ Key Rules</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Presidents and Chancellors cannot be re-elected immediately</li>
                  <li>• If 3 governments fail in a row, the top policy is enacted automatically</li>
                  <li>• Hitler becomes ineligible for Chancellor after 3 Fascist policies (in larger games)</li>
                  <li>• Dead players cannot vote, be elected, or use powers</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Roles & Powers</h2>

              <div className="grid gap-6">
                {/* Liberals */}
                <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">🔵 Liberals</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Goal:</h4>
                      <p className="text-gray-300 text-sm">Enact 5 Liberal policies or eliminate Hitler</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Knowledge:</h4>
                      <p className="text-gray-300 text-sm">Only know their own role</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-white mb-2">Strategy:</h4>
                    <p className="text-gray-300 text-sm">Use logic and voting patterns to identify fascists. Be cautious about who gains power.</p>
                  </div>
                </div>

                {/* Fascists */}
                <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-red-400 mb-4">🔴 Fascists</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Goal:</h4>
                      <p className="text-gray-300 text-sm">Enact 6 Fascist policies or elect Hitler as Chancellor</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Knowledge:</h4>
                      <p className="text-gray-300 text-sm">Know each other and Hitler (in small games)</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-white mb-2">Strategy:</h4>
                    <p className="text-gray-300 text-sm">Appear liberal while subtly advancing fascist agenda. Protect Hitler's identity.</p>
                  </div>
                </div>

                {/* Hitler */}
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-300 mb-4">⚫ Hitler</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Goal:</h4>
                      <p className="text-gray-300 text-sm">Become Chancellor after 3 Fascist policies</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Knowledge:</h4>
                      <p className="text-gray-300 text-sm">Knows fascists in 5-player games only</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-white mb-2">Strategy:</h4>
                    <p className="text-gray-300 text-sm">Stay hidden and appear liberal until the moment is right to seize power.</p>
                  </div>
                </div>
              </div>

              {/* Special Powers */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">Special Powers (Fascist Policies)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-yellow-400 font-semibold">🔍 Investigate Loyalty</h4>
                    <p className="text-gray-300 text-sm mt-1">Secretly learn another player's party affiliation</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-purple-400 font-semibold">🗳️ Special Election</h4>
                    <p className="text-gray-300 text-sm mt-1">Choose the next President</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-blue-400 font-semibold">👁️ Policy Peek</h4>
                    <p className="text-gray-300 text-sm mt-1">Look at the next 3 policies in the deck</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-red-400 font-semibold">💀 Execution</h4>
                    <p className="text-gray-300 text-sm mt-1">Eliminate a player from the game</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'victory' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Victory Conditions</h2>

              <div className="grid gap-6">
                {/* Liberal Victory */}
                <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">L</span>
                    </div>
                    <h3 className="text-xl font-semibold text-blue-400">Liberal Victory</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Policy Victory</h4>
                        <p className="text-gray-300 text-sm">Enact 5 Liberal policies on the board</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Assassination Victory</h4>
                        <p className="text-gray-300 text-sm">Execute Hitler using the Execution power</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fascist Victory */}
                <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">F</span>
                    </div>
                    <h3 className="text-xl font-semibold text-red-400">Fascist Victory</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Policy Victory</h4>
                        <p className="text-gray-300 text-sm">Enact 6 Fascist policies on the board</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Hitler Chancellor Victory</h4>
                        <p className="text-gray-300 text-sm">Elect Hitler as Chancellor after 3+ Fascist policies are enacted</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategy Tips */}
              <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">💡 Pro Tips</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">For Liberals:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Watch voting patterns carefully</li>
                      <li>• Don't trust anyone completely</li>
                      <li>• Use investigation results wisely</li>
                      <li>• Coordinate to block fascist governments</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">For Fascists:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Appear liberal in early game</li>
                      <li>• Create confusion and distrust</li>
                      <li>• Protect Hitler's identity</li>
                      <li>• Use powers to mislead liberals</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}