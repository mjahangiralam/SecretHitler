import React, { useState, useRef, useEffect } from 'react';
import { GameState, GameConfig, ChatMessage } from '../types/game';
import { MessageSquare, Send, Users, Clock } from 'lucide-react';
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
        {/* Header */}
        <div className="text-center mb-6 pt-8">
          <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Discussion Phase</h1>
          <p className="text-gray-400">{getLastAction()}</p>
        </div>

        {/* Timer and Game State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black bg-opacity-40 border border-gray-700 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{formatTime(timer)}</div>
            <div className="text-sm text-gray-400">Time Remaining</div>
          </div>
          
          <div className="bg-black bg-opacity-40 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-blue-400 text-lg font-bold">{gameState.liberalPolicies}/5</div>
            <div className="text-sm text-gray-400">Liberal Policies</div>
          </div>
          
          <div className="bg-black bg-opacity-40 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-red-400 text-lg font-bold">{gameState.fascistPolicies}/6</div>
            <div className="text-sm text-gray-400">Fascist Policies</div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-black bg-opacity-40 border border-gray-700 rounded-xl p-4 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p>Discussion will begin shortly...</p>
                {!config.aiChatEnabled && (
                  <p className="text-sm mt-2">AI chat is disabled. You can still send messages.</p>
                )}
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isAI
                      ? 'bg-gray-700 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">
                    {message.playerName}
                    {!message.isAI && <span className="text-green-300 ml-1">(You)</span>}
                  </div>
                  <div className="text-sm">{message.message}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              maxLength={200}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center mt-6">
          <button
            onClick={onContinue}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-500 hover:to-green-600 transition-all duration-300"
          >
            {timer > 0 ? 'Skip Discussion' : 'Continue Game'}
          </button>
          
          {timer > 0 && (
            <p className="text-gray-500 text-sm mt-2">
              Or wait for the timer to finish
            </p>
          )}
        </div>
      </div>
    </div>
  );
}