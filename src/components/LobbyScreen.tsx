import React, { useState } from 'react';
import { Users, Crown, ArrowRight, Settings, Volume2 } from 'lucide-react';
import { GameConfig } from '../types/game';

interface LobbyScreenProps {
  onStartGame: (config: GameConfig) => void;
  onBack: () => void;
}

export function LobbyScreen({ onStartGame, onBack }: LobbyScreenProps) {
  const [playerCount, setPlayerCount] = useState<5 | 7 | 9>(5);
  const [humanPlayerName, setHumanPlayerName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiChatEnabled, setAiChatEnabled] = useState(true);
  const [voiceChatEnabled, setVoiceChatEnabled] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');

  const handleStartGame = () => {
    if (!humanPlayerName.trim()) {
      alert('Please enter your name!');
      return;
    }

    const config: GameConfig = {
      playerCount,
      humanPlayerName: humanPlayerName.trim(),
      aiChatEnabled,
      voiceChatEnabled,
      openAIKey: openAIKey.trim() || undefined,
      elevenLabsKey: elevenLabsKey.trim() || undefined
    };

    onStartGame(config);
  };

  const playerCountOptions = [
    { count: 5 as const, label: '5 Players', description: 'Quick & Intense', color: 'from-red-600 to-red-700' },
    { count: 7 as const, label: '7 Players', description: 'Balanced Strategy', color: 'from-yellow-600 to-yellow-700' },
    { count: 9 as const, label: '9 Players', description: 'Maximum Chaos', color: 'from-purple-600 to-purple-700' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <button
            onClick={onBack}
            className="absolute top-8 left-8 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          
          <h1 className="text-4xl font-bold text-white mb-4">Create Game</h1>
          <p className="text-gray-300">Configure your Secret Hitler session</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Game Setup */}
          <div className="space-y-8">
            {/* Player Count Selection */}
            <div className="bg-black bg-opacity-40 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Player Count
              </h3>
              
              <div className="space-y-3">
                {playerCountOptions.map((option) => (
                  <button
                    key={option.count}
                    onClick={() => setPlayerCount(option.count)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-300 ${
                      playerCount === option.count
                        ? `bg-gradient-to-r ${option.color} border-white shadow-lg transform scale-105`
                        : 'bg-gray-800 border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-bold text-white">{option.label}</div>
                        <div className="text-sm text-gray-300">{option.description}</div>
                      </div>
                      <div className="text-2xl font-bold text-white opacity-75">
                        {option.count}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Player Name Input */}
            <div className="bg-black bg-opacity-40 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Crown className="w-5 h-5 mr-2" />
                Your Name
              </h3>
              
              <input
                type="text"
                value={humanPlayerName}
                onChange={(e) => setHumanPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
                maxLength={20}
              />
            </div>

            {/* Advanced Settings */}
            <div className="bg-black bg-opacity-40 p-6 rounded-xl border border-gray-700">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-white hover:text-gray-300 transition-colors"
              >
                <span className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Advanced Settings
                </span>
                <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {showAdvanced && (
                <div className="mt-6 space-y-6">
                  {/* AI Chat Settings */}
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={aiChatEnabled}
                        onChange={(e) => setAiChatEnabled(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-300">AI Live Chat (Experimental)</span>
                    </label>
                    
                    {aiChatEnabled && (
                      <div className="space-y-2 ml-7">
                        <label className="block text-sm text-gray-300">OpenAI API Key (Optional)</label>
                        <input
                          type="password"
                          value={openAIKey}
                          onChange={(e) => setOpenAIKey(e.target.value)}
                          placeholder="sk-..."
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm"
                        />
                        <p className="text-sm text-gray-500">
                          Add your OpenAI API key to enable more sophisticated AI responses. 
                          Without a key, AI will use pre-written responses.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Voice Settings */}
                  <div className="space-y-4 border-t border-gray-600 pt-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={voiceChatEnabled}
                        onChange={(e) => setVoiceChatEnabled(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-300 flex items-center">
                        <Volume2 className="w-4 h-4 mr-2" />
                        Voice Narration (ElevenLabs)
                      </span>
                    </label>
                    
                    {voiceChatEnabled && (
                      <div className="space-y-3 ml-7">
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-300">ElevenLabs API Key</label>
                          <input
                            type="password"
                            value={elevenLabsKey}
                            onChange={(e) => setElevenLabsKey(e.target.value)}
                            placeholder="Enter your ElevenLabs API Key"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                          />
                        </div>
                        
                        <div className="bg-purple-900 bg-opacity-20 border border-purple-700 rounded-lg p-3">
                          <p className="text-sm text-purple-300 mb-2">
                            <strong>Voice Features:</strong>
                          </p>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li>• Role reveal narration</li>
                            <li>• AI character voices during discussion</li>
                            <li>• Presidential power announcements</li>
                          </ul>
                        </div>
                        
                        <p className="text-sm text-gray-500">
                          This key will be used to generate audio narration during gameplay.
                          Your key is stored locally and used only for audio generation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Game Preview */}
          <div className="space-y-6">
            {/* Game Preview */}
            <div className="bg-black bg-opacity-40 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Game Preview</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Total Players:</span>
                  <span className="text-white font-bold">{playerCount}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Human Players:</span>
                  <span className="text-white font-bold">1</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">AI Players:</span>
                  <span className="text-white font-bold">{playerCount - 1}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Voice Narration:</span>
                  <span className={`font-bold ${voiceChatEnabled && elevenLabsKey ? 'text-green-400' : 'text-gray-500'}`}>
                    {voiceChatEnabled && elevenLabsKey ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-white font-semibold mb-3">Role Distribution:</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-blue-900 bg-opacity-50 p-2 rounded text-center">
                      <div className="text-blue-300 font-bold">
                        {playerCount === 5 ? 3 : playerCount === 7 ? 4 : 5}
                      </div>
                      <div className="text-blue-200 text-xs">Liberals</div>
                    </div>
                    <div className="bg-red-900 bg-opacity-50 p-2 rounded text-center">
                      <div className="text-red-300 font-bold">
                        {playerCount === 5 ? 1 : playerCount === 7 ? 2 : 3}
                      </div>
                      <div className="text-red-200 text-xs">Fascists</div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded text-center">
                      <div className="text-gray-300 font-bold">1</div>
                      <div className="text-gray-400 text-xs">Hitler</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Game Button */}
            <button
              onClick={handleStartGame}
              disabled={!humanPlayerName.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-bold rounded-lg shadow-xl hover:from-green-500 hover:to-green-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-green-500"
            >
              <ArrowRight className="inline-block w-6 h-6 mr-3" />
              START SECRET HITLER
            </button>
            
            {!humanPlayerName.trim() && (
              <p className="text-center text-red-400 text-sm">
                Please enter your name to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}