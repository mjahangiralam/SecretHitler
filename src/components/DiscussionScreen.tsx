import React, { useState, useRef, useEffect } from 'react';
import { GameState, GameConfig, ChatMessage } from '../types/game';
import { MessageSquare, Send, Users, Clock, User, FastForward } from 'lucide-react';
import { generateAIMessage } from '../utils/aiUtils';

interface DiscussionScreenProps {
  gameState: GameState;
  config: GameConfig;
  onContinue: () => void;
}

export function DiscussionScreen({ gameState, config, onContinue }: DiscussionScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [timer, setTimer] = useState(60); // 60 seconds discussion
  const [isTimerActive, setIsTimerActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const humanPlayer = gameState.players.find(p => p.isHuman);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Timer countdown
  useEffect(() => {
    if (isTimerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
  }, [timer, isTimerActive]);

  // Generate AI messages periodically
  useEffect(() => {
    if (!config.aiChatEnabled) return;

    const generateAIChat = () => {
      const alivePlayers = gameState.players.filter(p => !p.isHuman && p.isAlive);
      if (alivePlayers.length === 0) return;

      // Random AI player sends a message
      const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      const context = determineContext();
      const message = generateAIMessage(randomPlayer, gameState, context);

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        playerId: randomPlayer.id,
        playerName: randomPlayer.name,
        message,
        timestamp: Date.now(),
        isAI: true
      };

      setMessages(prev => [...prev, newMessage]);
    };

    // Generate initial AI messages
    const initialDelay = setTimeout(generateAIChat, 2000);
    
    // Continue generating messages periodically
    const interval = setInterval(() => {
      if (Math.random() < 0.3 && isTimerActive) { // 30% chance every 3 seconds
        generateAIChat();
      }
    }, 3000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [config.aiChatEnabled, gameState, isTimerActive]);

  const determineContext = (): 'nomination' | 'voting' | 'post-vote' | 'post-policy' | 'accusation' | 'defense' => {
    // Determine what just happened to provide context for AI messages
    if (gameState.round === 1) return 'nomination';
    if (Object.keys(gameState.votes).length > 0) return 'post-vote';
    if (gameState.liberalPolicies > 0 || gameState.fascistPolicies > 0) return 'post-policy';
    return 'voting';
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !humanPlayer) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: humanPlayer.id,
      playerName: humanPlayer.name,
      message: inputMessage.trim(),
      timestamp: Date.now(),
      isAI: false
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLastAction = () => {
    if (Object.keys(gameState.votes).length > 0) {
      const jaVotes = Object.values(gameState.votes).filter(v => v === 'ja').length;
      const neinVotes = Object.values(gameState.votes).filter(v => v === 'nein').length;
      const passed = jaVotes > neinVotes;
      return `Last vote: ${passed ? 'PASSED' : 'FAILED'} (${jaVotes} Ja, ${neinVotes} Nein)`;
    }
    return 'Discuss the current situation';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header with Skip Button */}
        <div className="text-center mb-4 relative">
          <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-white mb-2">Discussion Phase</h1>
          <p className="text-gray-400">
            Round {gameState.round} - {formatTime(timer)}
          </p>
          
          {/* Skip Button */}
          <button
            onClick={onContinue}
            className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center space-x-2 transition-colors duration-300"
          >
            <FastForward className="w-4 h-4" />
            <span>Skip</span>
          </button>
        </div>

        {/* Policy Counters */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-900 bg-opacity-40 border border-blue-700 rounded-lg p-3 text-center">
            <div className="text-blue-400 text-lg font-bold mb-1">{gameState.liberalPolicies}/5</div>
            <div className="text-sm text-gray-300">Liberal Policies</div>
          </div>
          
          <div className="bg-red-900 bg-opacity-40 border border-red-700 rounded-lg p-3 text-center">
            <div className="text-red-400 text-lg font-bold mb-1">{gameState.fascistPolicies}/6</div>
            <div className="text-sm text-gray-300">Fascist Policies</div>
          </div>
        </div>

        {/* Messages Container - Fixed height with scroll */}
        <div className="flex-grow bg-black bg-opacity-40 border border-gray-700 rounded-xl p-4 mb-4 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-grow" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <div className="space-y-4">
              {messages.map((message) => {
                const player = gameState.players.find(p => p.id === message.playerId);
                const isHuman = player?.isHuman;
                
                return (
                  <div 
                    key={message.id}
                    className={`flex items-start space-x-3 ${isHuman ? 'justify-end' : ''}`}
                  >
                    {!isHuman && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex flex-col ${isHuman ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-gray-400">{message.playerName}</span>
                        {isHuman && <span className="text-xs text-green-400">(You)</span>}
                      </div>
                      
                      <div 
                        className={`rounded-lg px-4 py-2 max-w-md break-words ${
                          isHuman 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        {message.message}
                      </div>
                    </div>
                    
                    {isHuman && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-grow bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}