import React from 'react';
import { Player, BoardSpace } from '../types';
import { BOARD_SPACES } from '../constants';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  onSelect?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isActive, onSelect }) => {
  const currentSpace = BOARD_SPACES[player.position];

  return (
    <div 
      onClick={onSelect}
      className={`relative p-4 border-l-4 transition-all duration-300 cursor-pointer bg-black/40 backdrop-blur-sm
        ${isActive 
          ? 'border-neon-blue bg-white/5 shadow-[0_0_15px_rgba(0,243,255,0.1)]' 
          : 'border-gray-700 opacity-70 hover:opacity-100 hover:bg-white/5'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-sm shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: player.color, color: player.color }}
          />
          <h3 className="font-mono font-bold text-lg text-white tracking-wider">{player.name}</h3>
        </div>
        {player.isInJail && (
          <span className="text-[10px] bg-neon-pink/20 text-neon-pink border border-neon-pink px-2 py-0.5 rounded-sm font-bold uppercase animate-pulse">
            DETAINED
          </span>
        )}
      </div>
      
      <div className="flex flex-col gap-1 pl-6">
        <div className="text-2xl font-bold font-mono text-neon-green">
          ${player.money.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 font-mono uppercase truncate">
          LOC: <span className="text-gray-300">{currentSpace.name}</span>
        </div>
      </div>
      
      {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-neon-blue to-transparent opacity-50"></div>}
    </div>
  );
};

export default PlayerCard;