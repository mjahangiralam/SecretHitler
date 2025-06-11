import React, { useState, useEffect } from 'react';
import { GameState, Policy } from '../types/game';
import { FileText, Eye, CheckCircle } from 'lucide-react';

interface LegislativeScreenProps {
  gameState: GameState;
  onPresidentialAction: (discardedPolicy: Policy) => void;
  onChancellorAction: (enactedPolicy: Policy) => void;
  onContinue: () => void;
}

export function LegislativeScreen({ 
  gameState, 
  onPresidentialAction, 
  onChancellorAction, 
  onContinue 
}: LegislativeScreenProps) {
  const [presidentialChoice, setPresidentialChoice] = useState<Policy | null>(null);
  const [chancellorChoice, setChancellorChoice] = useState<Policy | null>(null);
  const [showPolicyResult, setShowPolicyResult] = useState(false);

  const president = gameState.players.find(p => p.id === gameState.president);
  const chancellor = gameState.players.find(p => p.id === gameState.chancellor);
  const humanPlayer = gameState.players.find(p => p.isHuman);
  
  const isHumanPresident = president?.isHuman;
  const isHumanChancellor = chancellor?.isHuman;
  const hasPresidentialDraw = gameState.presidentialDraw.length > 0;
  const hasChancellorChoice = gameState.chancellorChoice.length > 0;
  
  // Auto-simulate AI actions
  useEffect(() => {
    if (hasPresidentialDraw && !isHumanPresident && presidentialChoice === null) {
      // AI President discards a policy
      const timer = setTimeout(() => {
        const policyToDiscard = gameState.presidentialDraw[Math.floor(Math.random() * gameState.presidentialDraw.length)];
        setPresidentialChoice(policyToDiscard);
        onPresidentialAction(policyToDiscard);
      }, 2000 + Math.random() * 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hasPresidentialDraw, isHumanPresident, presidentialChoice, gameState.presidentialDraw, onPresidentialAction]);

  useEffect(() => {
    if (hasChancellorChoice && !isHumanChancellor && chancellorChoice === null) {
      // AI Chancellor enacts a policy
      const timer = setTimeout(() => {
        const policyToEnact = gameState.chancellorChoice[Math.floor(Math.random() * gameState.chancellorChoice.length)];
        setChancellorChoice(policyToEnact);
        onChancellorAction(policyToEnact);
        setShowPolicyResult(true);
      }, 2000 + Math.random() * 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hasChancellorChoice, isHumanChancellor, chancellorChoice, gameState.chancellorChoice, onChancellorAction]);

  const handlePresidentialDiscard = (policy: Policy) => {
    setPresidentialChoice(policy);
    onPresidentialAction(policy);
  };

  const handleChancellorEnact = (policy: Policy) => {
    setChancellorChoice(policy);
    onChancellorAction(policy);
    setShowPolicyResult(true);
  };

  const PolicyCard = ({ policy, onClick, selected = false }: { 
    policy: Policy; 
    onClick?: () => void; 
    selected?: boolean;
  }) => {
    const isLiberal = policy === 'liberal';
    const bgColor = isLiberal 
      ? selected ? 'from-blue-600 to-blue-700' : 'from-blue-800 to-blue-900'
      : selected ? 'from-red-600 to-red-700' : 'from-red-800 to-red-900';
    const borderColor = isLiberal ? 'border-blue-500' : 'border-red-500';
    const textColor = isLiberal ? 'text-blue-100' : 'text-red-100';
    
    return (
      <button
        onClick={onClick}
        disabled={!onClick}
        className={`p-6 rounded-lg border-2 ${borderColor} bg-gradient-to-br ${bgColor} ${textColor} transition-all duration-300 ${
          onClick ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
        } ${selected ? 'ring-4 ring-white ring-opacity-50' : ''}`}
      >
        <FileText className="w-8 h-8 mx-auto mb-3" />
        <div className="font-bold text-lg">{policy.toUpperCase()}</div>
        <div className="text-sm opacity-75">POLICY</div>
      </button>
    );
  };

  // Show policy result
  if (showPolicyResult && chancellorChoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-white mb-6">Policy Enacted</h1>
            
            <div className="mb-8">
              <PolicyCard policy={chancellorChoice} />
            </div>
            
            <div className="text-gray-300 mb-8">
              The government has enacted a {chancellorChoice} policy.
              {chancellorChoice === 'fascist' && gameState.availablePower && (
                <div className="mt-4 p-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
                  <div className="text-red-400 font-bold">Special Power Activated!</div>
                  <div className="text-sm">The President will use a special power.</div>
                </div>
              )}
            </div>
            
            <button
              onClick={onContinue}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-500 hover:to-green-600 transition-all duration-300"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chancellor phase
  if (hasChancellorChoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <FileText className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Chancellor Decision</h1>
            <p className="text-gray-400">
              {isHumanChancellor ? 'Choose which policy to enact' : `${chancellor?.name} is choosing a policy...`}
            </p>
          </div>

          <div className="bg-purple-900 bg-opacity-20 border border-purple-700 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center">
              <span className="text-purple-400 font-bold">CHANCELLOR: </span>
              <span className="text-white font-semibold ml-2">{chancellor?.name}</span>
              {chancellor?.isHuman && <span className="ml-2 text-green-400">(You)</span>}
            </div>
          </div>

          {isHumanChancellor ? (
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Choose Policy to Enact:</h3>
                <p className="text-gray-400 mb-6">Select one policy to enact, the other will be discarded</p>
              </div>
              
              <div className="flex justify-center space-x-6 mb-8">
                {gameState.chancellorChoice.map((policy, index) => (
                  <PolicyCard
                    key={index}
                    policy={policy}
                    onClick={() => handleChancellorEnact(policy)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-8">
                <div className="animate-pulse mb-6">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto mb-4"></div>
                  <div className="w-48 h-4 bg-gray-700 rounded mx-auto mb-2"></div>
                  <div className="w-32 h-3 bg-gray-700 rounded mx-auto"></div>
                </div>
                <p className="text-gray-300">
                  {chancellor?.name} is reviewing the policies and making their choice...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Presidential phase
  if (hasPresidentialDraw) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <FileText className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Presidential Decision</h1>
            <p className="text-gray-400">
              {isHumanPresident ? 'Choose which policy to discard' : `${president?.name} is reviewing policies...`}
            </p>
          </div>

          <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center">
              <span className="text-yellow-400 font-bold">PRESIDENT: </span>
              <span className="text-white font-semibold ml-2">{president?.name}</span>
              {president?.isHuman && <span className="ml-2 text-green-400">(You)</span>}
            </div>
          </div>

          {isHumanPresident ? (
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Choose Policy to Discard:</h3>
                <p className="text-gray-400 mb-6">Select one policy to discard, the other two will go to the Chancellor</p>
              </div>
              
              <div className="flex justify-center space-x-4 mb-8">
                {gameState.presidentialDraw.map((policy, index) => (
                  <PolicyCard
                    key={index}
                    policy={policy}
                    onClick={() => handlePresidentialDiscard(policy)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-black bg-opacity-40 border border-gray-700 rounded-xl p-8">
                <div className="animate-pulse mb-6">
                  <div className="flex justify-center space-x-4 mb-4">
                    <div className="w-24 h-32 bg-gray-700 rounded-lg"></div>
                    <div className="w-24 h-32 bg-gray-700 rounded-lg"></div>
                    <div className="w-24 h-32 bg-gray-700 rounded-lg"></div>
                  </div>
                  <div className="w-48 h-4 bg-gray-700 rounded mx-auto mb-2"></div>
                  <div className="w-32 h-3 bg-gray-700 rounded mx-auto"></div>
                </div>
                <p className="text-gray-300">
                  {president?.name} is reviewing the three policies and deciding which to discard...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white text-lg">Drawing policies from the deck...</p>
      </div>
    </div>
  );
}