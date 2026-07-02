import React from 'react';
import type { Game } from '../types';
import { getContrastColor } from '../lib/utils';
import GameCard from './GameCard';

interface TierRowProps {
  label: string;
  color: string;
  games: Game[];
  onUpdated: () => void;
}

const TierRow: React.FC<TierRowProps> = ({ label, color, games, onUpdated }) => {
  const textColor = getContrastColor(color);

  return (
    <div className="flex gap-2 lg:gap-4 min-h-[90px] lg:min-h-[120px] tier-row-container">
      {/* Tier Label */}
      <div 
        className="w-16 lg:w-24 flex items-center justify-center rounded-xl shadow-lg shrink-0 tier-row-label"
        style={{ backgroundColor: color, color: textColor }}
      >
        <span className="font-bold text-[10px] lg:text-lg select-none text-center px-1 break-all leading-tight tier-row-label-text">{label}</span>
      </div>

      {/* Games Container */}
      <div className="flex-1 bg-white/5 rounded-xl p-2 lg:p-3 flex flex-wrap gap-2 lg:gap-3 border border-white/5 group-hover:border-white/10 transition-colors tier-row-games">
        {games.map(game => (
          <GameCard key={game.id} game={game} onUpdated={onUpdated} />
        ))}
        {games.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-white/10 text-sm font-medium uppercase tracking-tighter">
            Empty Tier
          </div>
        )}
      </div>
    </div>
  );
};

export default TierRow;
