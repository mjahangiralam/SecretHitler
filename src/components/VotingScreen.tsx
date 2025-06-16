import React, { useState, useEffect } from 'react';
import { GameState, Vote } from '../types/game';
import { Vote as VoteIcon, ThumbsUp, ThumbsDown, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface VotingScreenProps {
  gameState: GameState;
  onVote: (playerId: string, vote: Vote) => void;
  onContinue: () => void;
}

export function VotingScreen({ gameState, onVote, onContinue }: VotingScreenProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalJaVotes, setFinalJaVotes] = useState(0);
  const [finalNeinVotes, setFinalNeinVotes] = useState(0);
  const [finalVotePassed, setFinalVotePassed] = useState(false);
  
  const president = gameState.players.find(p => p.id === gameState.president);
  const chancellor = gameState.players.find(p => p.id === gameState.chancellor);
  const humanPlayer = gameState.players.find(p => p.isHuman);
  
  const alivePlayers = gameState.players.filter(p => p.isAlive);
  const deadPlayers = gameState.players.filter(p => !p.isAlive);
  const totalVotes = Object.keys(gameState.votes).length;
  const requiredVotes = alivePlayers.length;
  const allVotesCast = totalVotes >= requiredVotes;

  const handleVote = (vote: Vote) => {
    if (humanPlayer && !hasVoted) {
      onVote(humanPlayer.id, vote);
      setHasVoted(true);
    }
  };

  useEffect(() => {
    if (allVotesCast && !showResults) {
      const jaVotes = Object.values(gameState.votes).filter(v => v === 'ja').length;
      const neinVotes = Object.values(gameState.votes).filter(v => v === 'nein').length;
      const votePassed = jaVotes > neinVotes;
      
      setFinalJaVotes(jaVotes);
      setFinalNeinVotes(neinVotes);
      setFinalVotePassed(votePassed);
      
      const timer = setTimeout(() => setShowResults(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [allVotesCast, showResults, gameState.votes]);

  const getVoteDisplay = (playerId: string) => {
    const hasVoted = gameState.votes[playerId] !== undefined;
    if (!hasVoted) return <Clock className="w-4 h-4 text-gray-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-8 text-center">
            <VoteIcon className="w-16 h-16 mx-auto mb-6 text-blue-400" />
            
            <h1 className="text-3xl font-bold text-white mb-6">Vote Results</h1>
            
            {/* Government Display */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-yellow-400 font-bold mb-1">PRESIDENT</div>
                <div className="text-white text-lg">{president?.name}</div>
                {president?.isHuman && <div className="text-green-400 text-sm">(You)</div>}
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold mb-1">CHANCELLOR</div>
                <div className="text-white text-lg">{chancellor?.name}</div>
                {chancellor?.isHuman && <div className="text-green-400 text-sm">(You)</div>}
              </div>
            </div>

            {/* Vote Tallies */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-green-400 text-2xl font-bold mb-2">{finalJaVotes}</div>
                <div className="text-gray-400">Ja Votes</div>
              </div>
              <div>
                <div className="text-red-400 text-2xl font-bold mb-2">{finalNeinVotes}</div>
                <div className="text-gray-400">Nein Votes</div>
              </div>
            </div>
              
            <div className="mt-6 text-xl font-bold">
              {finalVotePassed ? (
                <div className="text-green-400">Government Approved!</div>
              ) : (
                <div>
                  <div className="text-red-400">Government Rejected</div>
                  {gameState.electionTracker === 2 && (
                    <div className="mt-4 flex items-center justify-center text-yellow-400 text-base">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Next failed vote will trigger chaos!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Election Tracker Display */}
            {!finalVotePassed && gameState.electionTracker > 0 && (
              <div className="mt-6 p-4 bg-red-900 bg-opacity-20 rounded-lg">
                <div className="text-red-400 font-bold mb-2">Election Tracker</div>
                <div className="flex justify-center space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < gameState.electionTracker
                          ? 'bg-red-500'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  {3 - gameState.electionTracker} more {3 - gameState.electionTracker === 1 ? 'rejection' : 'rejections'} until chaos
                </div>
              </div>
            )}
            
            <button
              onClick={onContinue}
              className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <VoteIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Vote on Government</h1>
          <p className="text-gray-400">
            {hasVoted || !humanPlayer ? 'Waiting for all votes...' : 'Cast your vote'}
          </p>
          
          {/* Election Tracker Display */}
          {gameState.electionTracker > 0 && (
            <div className="mt-4 flex flex-col items-center">
              <div className="text-yellow-400 font-bold mb-2">Election Tracker</div>
              <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < gameState.electionTracker
                        ? 'bg-yellow-500'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Proposed Government */}
        <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">Proposed Government</h3>
          
          <div className="flex justify-center space-x-12">
            <div className="text-center">
              <div className="bg-yellow-900 bg-opacity-40 border border-yellow-700 rounded-lg p-4 mb-2">
                <div className="text-yellow-400 font-bold text-sm">PRESIDENT</div>
              </div>
              <div className="text-white font-semibold">{president?.name}</div>
              {president?.isHuman && <div className="text-green-400 text-sm">(You)</div>}
            </div>
            
            <div className="text-center">
              <div className="bg-purple-900 bg-opacity-40 border border-purple-700 rounded-lg p-4 mb-2">
                <div className="text-purple-400 font-bold text-sm">CHANCELLOR</div>
              </div>
              <div className="text-white font-semibold">{chancellor?.name}</div>
              {chancellor?.isHuman && <div className="text-green-400 text-sm">(You)</div>}
            </div>
          </div>
        </div>

        {/* Voting Interface for Human Player */}
        {humanPlayer && !hasVoted && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Your Vote</h3>
              <p className="text-gray-400">Do you support this government?</p>
            </div>
            
            <div className="flex justify-center space-x-8">
              <button
                onClick={() => handleVote('ja')}
                className="group px-8 py-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-xl rounded-lg shadow-xl hover:from-green-500 hover:to-green-600 transform hover:scale-105 transition-all duration-300 border border-green-500"
              >
                <ThumbsUp className="w-8 h-8 mx-auto mb-2" />
                JA
                <div className="text-sm font-normal opacity-75 mt-1">Support</div>
              </button>
              
              <button
                onClick={() => handleVote('nein')}
                className="group px-8 py-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl rounded-lg shadow-xl hover:from-red-500 hover:to-red-600 transform hover:scale-105 transition-all duration-300 border border-red-500"
              >
                <ThumbsDown className="w-8 h-8 mx-auto mb-2" />
                NEIN
                <div className="text-sm font-normal opacity-75 mt-1">Reject</div>
              </button>
            </div>
          </div>
        )}

        {/* Voting Status */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 text-center">Voting Status</h3>
          
          {/* Living Players */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Living Players</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {alivePlayers.map((player) => (
                <div 
                  key={player.id}
                  className="bg-gray-800 bg-opacity-40 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-semibold">{player.name}</div>
                    {player.isHuman && <div className="text-green-400 text-xs">(You)</div>}
                  </div>
                  {getVoteDisplay(player.id)}
                </div>
              ))}
            </div>
          </div>

          {/* Dead Players */}
          {deadPlayers.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-3">Dead Players</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {deadPlayers.map((player) => (
                  <div 
                    key={player.id}
                    className="bg-red-900 bg-opacity-20 rounded-lg p-3 opacity-50"
                  >
                    <div>
                      <div className="text-gray-400 font-semibold line-through">{player.name}</div>
                      {player.isHuman && <div className="text-gray-500 text-xs">(You)</div>}
                      <div className="text-xs text-red-400">Eliminated</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}