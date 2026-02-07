import { Game } from "@shared/schema";
import { Play } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface GameCardProps {
  game: Game;
  onPlay: (id: number) => void;
  disabled?: boolean;
}

export function GameCard({ game, onPlay, disabled }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative group aspect-[3/4] rounded-xl overflow-hidden bg-card border border-white/5 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <img 
        src={game.imageUrl} 
        alt={game.title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          // Fallback image if external URL fails
          (e.target as HTMLImageElement).src = `https://placehold.co/300x400/1a1a1a/FFF?text=${encodeURIComponent(game.title)}`;
        }}
      />

      {/* ASLI Badge */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-black text-[10px] font-bold shadow-lg shadow-black/50 z-10">
        ASLI
      </div>

      {/* Provider Badge */}
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium z-10">
        {game.provider}
      </div>

      {/* Overlay on Hover */}
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => onPlay(game.id)}
          disabled={disabled}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5 ml-1 fill-current" />
        </button>
        <span className="mt-3 text-sm font-bold text-white text-center px-4">
          {game.title}
        </span>
      </div>

      {/* Mobile touch target (invisible overlay) */}
      <button 
        className="absolute inset-0 w-full h-full md:hidden"
        onClick={() => onPlay(game.id)}
        disabled={disabled}
      >
        <span className="sr-only">Play {game.title}</span>
      </button>
    </motion.div>
  );
}
