import React, { useEffect, useState } from 'react';
import type { Game } from '../types';
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import EditGameModal from './EditGameModal';

interface GameCardProps {
  game: Game;
  onUpdated: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onUpdated }) => {
  const [showEdit, setShowEdit] = useState(false);

  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!game.coverImage) {
      const timer = window.setTimeout(() => {
        if (!isCancelled) setCoverUrl(null);
      }, 0);

      return () => {
        isCancelled = true;
        window.clearTimeout(timer);
      };
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (!isCancelled && typeof reader.result === 'string') {
        setCoverUrl(reader.result);
      }
    };
    reader.onerror = () => {
      if (!isCancelled) setCoverUrl(null);
    };
    reader.readAsDataURL(game.coverImage);

    return () => {
      isCancelled = true;
    };
  }, [game.coverImage]);

  return (
    <>
      <motion.div 
        layout
        whileHover={{ y: -5 }}
        className="w-[72px] sm:w-[130px] h-[115px] sm:h-[200px] bg-dark-accent rounded-lg overflow-hidden shadow-xl border border-white/5 flex flex-col group relative shrink-0 game-card-container"
      >
        {/* Cover Image Area - Fixed Height */}
        <div className="h-[80px] sm:h-[160px] bg-gray-800 relative overflow-hidden game-card-cover">
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={game.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-xs text-gray-600 text-center p-1 sm:p-4">
              No Cover
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={() => setShowEdit(true)}
              className="p-1 sm:p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors shadow-lg"
            >
              <Edit2 className="text-white w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Info Area - Fixed Height at bottom */}
        <div className="h-[35px] sm:h-[40px] bg-black/60 flex items-center px-1 sm:px-2 gap-0.5 sm:gap-1 border-t border-white/10 mt-auto game-card-info">
          <div className="flex-1 min-w-0">
            <p className="text-[8px] sm:text-[10px] font-medium truncate text-white leading-tight game-card-title">
              {game.title}
            </p>
          </div>
          <div className="flex-shrink-0 bg-red-600 text-white text-[7px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded game-card-score">
            {game.score}
          </div>
        </div>
      </motion.div>

      {showEdit && (
        <EditGameModal 
          game={game} 
          onClose={() => setShowEdit(false)} 
          onUpdated={onUpdated} 
        />
      )}
    </>
  );
};

export default GameCard;
