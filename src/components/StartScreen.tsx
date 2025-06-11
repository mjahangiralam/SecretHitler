import React from 'react';
import { Shield, Play, BookOpen, Users } from 'lucide-react';

interface StartScreenProps {
  onPlay: () => void;
  onHowToPlay: () => void;
}

export function StartScreen({ onPlay, onHowToPlay }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background texture overlay */}
      <div
        className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.03'%3E%3Cpolygon fill='%23000' points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")] opacity-20`}
      ></div>

      <div className="relative z-10 text-center max-w-4xl">
        {/* Logo Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-red-500 mr-4" />
            <div className="text-left">
              <h1 className="text-6xl font-bold text-white tracking-wider drop-shadow-2xl">
                SECRET HITLER
              </h1>
              <p className="text-2xl text-red-400 font-semibold tracking-wide mt-2">
                AI EDITION
              </p>
            </div>
          </div>

          <div className="w-32 h-1 bg-gradient-to-r from-red-600 to-blue-600 mx-auto mb-8"></div>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Navigate the treacherous world of 1930s politics. Play against advanced AI opponents
            who lie, deceive, and form alliances in real-time. Can you save democracy?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-6">
          <button
            onClick={onPlay}
            className="group relative px-12 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-xl font-bold rounded-lg shadow-2xl hover:from-red-500 hover:to-red-600 transform hover:scale-105 transition-all duration-300 border border-red-500"
          >
            <Play className="inline-block w-6 h-6 mr-3" />
            START GAME
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
          </button>

          <button
            onClick={onHowToPlay}
            className="group relative px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold rounded-lg shadow-2xl hover:from-blue-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 border border-blue-500"
          >
            <BookOpen className="inline-block w-6 h-6 mr-3" />
            HOW TO PLAY
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
          </button>

          <div className="pt-8">
            <div className="flex items-center justify-center text-gray-400 text-sm mb-4">
              <Users className="w-4 h-4 mr-2" />
              <span>Play against intelligent AI opponents with unique personalities</span>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
              <div className="bg-black bg-opacity-30 p-4 rounded-lg border border-gray-700">
                <div className="text-red-400 font-bold text-lg">5 PLAYERS</div>
                <div className="text-gray-300 text-sm">Quick Games</div>
              </div>
              <div className="bg-black bg-opacity-30 p-4 rounded-lg border border-gray-700">
                <div className="text-yellow-400 font-bold text-lg">7 PLAYERS</div>
                <div className="text-gray-300 text-sm">Balanced</div>
              </div>
              <div className="bg-black bg-opacity-30 p-4 rounded-lg border border-gray-700">
                <div className="text-purple-400 font-bold text-lg">9 PLAYERS</div>
                <div className="text-gray-300 text-sm">Chaos Mode</div>
              </div>
            </div>
          </div>
        </div>

        {/* Atmospheric bottom text */}
        <div className="mt-16 text-gray-500 text-sm italic">
          "The only thing necessary for the triumph of evil is for good men to do nothing."
        </div>
      </div>
    </div>
  );
}
