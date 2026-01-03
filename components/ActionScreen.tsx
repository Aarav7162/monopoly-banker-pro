import React from 'react';
import { BoardSpace, Player, SpaceType, PropertyGroup } from '../types';
import { getGroupColorClass } from '../services/gameLogic';

interface ActionScreenProps {
  space: BoardSpace;
  currentPlayer: Player;
  owner?: Player;
  rentAmount: number;
  onBuy: () => void;
  onAuction: () => void;
  onPayRent: () => void;
  onEndTurn: () => void;
  canAfford: boolean;
  diceTotal: number;
}

const ActionScreen: React.FC<ActionScreenProps> = ({
  space,
  currentPlayer,
  owner,
  rentAmount,
  onBuy,
  onAuction,
  onPayRent,
  onEndTurn,
  canAfford,
  diceTotal,
}) => {
  // Scenario 1: Unowned Property
  if ((space.type === SpaceType.PROPERTY || space.type === SpaceType.RAILROAD || space.type === SpaceType.UTILITY) && !owner) {
    return (
      <div className="flex flex-col items-center gap-6 w-full animate-slide-up">
        <div className="w-full max-w-md cyber-card p-0 overflow-hidden group">
          <div className={`h-24 flex items-center justify-center ${getGroupColorClass(space.group)} relative`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <span className="text-3xl font-bold text-center uppercase drop-shadow-md z-10 text-white tracking-widest">
              {space.type === SpaceType.PROPERTY ? 'ASSET AVAILABLE' : space.type}
            </span>
          </div>
          <div className="p-8 flex flex-col items-center gap-4 bg-black/80">
            <h2 className="text-3xl font-bold text-center uppercase text-white">{space.name}</h2>
            <div className="text-6xl font-mono font-bold text-neon-green text-shadow-glow">${space.price}</div>
            <p className="text-gray-400 font-mono text-sm">BASE ROI: ${space.baseRent}</p>
          </div>
        </div>

        <div className="flex gap-4 w-full max-w-md">
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className="flex-1 cyber-btn bg-neon-green text-black font-bold py-4 text-xl disabled:opacity-50 disabled:grayscale"
          >
            ACQUIRE
          </button>
          <button
            onClick={onAuction}
            className="flex-1 cyber-btn border border-neon-blue text-neon-blue font-bold py-4 text-xl hover:bg-neon-blue hover:text-black"
          >
            AUCTION
          </button>
        </div>
      </div>
    );
  }

  // Scenario 2: Owned Property (Pay Rent)
  if (owner && owner.id !== currentPlayer.id) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto animate-pulse-once">
        <div className="cyber-card p-8 border-neon-pink w-full text-center">
          <h2 className="text-2xl font-bold text-neon-pink mb-2 tracking-widest font-mono">PAYMENT REQUIRED</h2>
          <div className="text-lg text-gray-400 mb-6">
            OWNER: <span className="font-bold text-white px-2 py-1 bg-gray-800">{owner.name}</span>
          </div>
          <div className="text-7xl font-mono font-bold text-white mb-2 text-shadow-glow">
            -${rentAmount}
          </div>
        </div>

        <button
          onClick={onPayRent}
          disabled={!canAfford}
          className="w-full cyber-btn bg-neon-pink text-black text-2xl font-bold py-5 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          TRANSFER FUNDS
        </button>
      </div>
    );
  }

  // Scenario 3: Owned by Current Player
  if (owner && owner.id === currentPlayer.id) {
     return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            <div className="cyber-card p-8 text-center w-full border-neon-green">
                <h2 className="text-2xl font-bold text-neon-green mb-2">SECURE LOCATION</h2>
                <div className="text-gray-400 text-lg">You own {space.name}</div>
            </div>
            <button onClick={onEndTurn} className="cyber-btn w-full bg-gray-800 text-white border border-gray-600 py-4 font-bold text-lg">END CYCLE</button>
        </div>
     )
  }

  // Scenario 4: Tax
  if (space.type === SpaceType.TAX) {
      const taxAmount = space.id === 4 ? 200 : 100;
       return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
          <div className="cyber-card p-8 text-center w-full border-neon-pink">
            <h2 className="text-3xl font-bold text-white mb-2">{space.name}</h2>
            <div className="text-6xl font-bold text-neon-pink mb-4">-${taxAmount}</div>
            <p className="text-gray-400 font-mono">MANDATORY DEDUCTION</p>
          </div>
          <button onClick={onPayRent} className="w-full cyber-btn bg-neon-pink text-black py-4 font-bold text-xl">PAY TAX</button>
        </div>
      );
  }

    // Default Fallback
    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            <div className="cyber-card p-8 text-center w-full">
                <h2 className="text-3xl font-bold text-neon-blue mb-4">{space.name}</h2>
                <p className="text-gray-300 text-lg font-mono">
                    {space.type === SpaceType.GO_TO_JAIL ? "WARNING: IMMEDIATE INCARCERATION" : "SAFE ZONE. NO ACTION."}
                </p>
            </div>
            <button onClick={onEndTurn} className="w-full cyber-btn bg-neon-blue text-black py-4 font-bold text-xl">
                {space.type === SpaceType.GO_TO_JAIL ? "PROCEED TO JAIL" : "CONTINUE"}
            </button>
        </div>
    );
};

export default ActionScreen;