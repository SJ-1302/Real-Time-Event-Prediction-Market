import React from 'react';
import { motion } from 'motion/react';
import { Clock, BarChart3, TrendingUp, Search, User, Filter, Zap, LayoutGrid, Flame, Sparkles } from 'lucide-react';

interface PredictionCardProps {
  question: string;
  tags: string[];
  probability: number;
  change: number;
  volume: string;
  timeLeft: string;
  onOpenMarket: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  question,
  tags,
  probability,
  change,
  volume,
  timeLeft,
  onOpenMarket,
}) => {
  return (
    <div className="relative h-[140px] group">
      <motion.div
        layout
        initial={false}
        whileHover={{ 
          zIndex: 50,
          scale: 1.05,
        }}
        transition={{ 
          layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
          scale: { duration: 0.2 }
        }}
        className="absolute inset-x-0 top-0 flex flex-col bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-xl p-5 transition-all hover:border-blue-500/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.1)] overflow-hidden"
      >
        {/* Top Section - Always Visible */}
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-medium text-zinc-100 leading-snug line-clamp-2 min-h-[48px] group-hover:line-clamp-none">
            {question}
          </h3>
          
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-white leading-none">
                {probability}%
              </span>
            </div>
            <div className={`text-xs font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </div>
          </div>
        </div>

        {/* Expandable Section - Matches Previous Design */}
        <div className="max-h-0 opacity-0 group-hover:max-h-[500px] group-hover:opacity-100 transition-all duration-300 ease-in-out">
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-800/50 rounded-full border border-zinc-700/50"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <div className="relative h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${probability}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
              <span>0% (NO)</span>
              <span>100% (YES)</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock size={14} className="text-zinc-500" />
                <span className="text-xs">{timeLeft}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <BarChart3 size={14} className="text-zinc-500" />
                <span className="text-xs">{volume}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenMarket();
              }}
              className="px-4 py-2 bg-zinc-100 text-zinc-950 text-xs font-bold rounded-lg transition-all hover:bg-white hover:scale-105 active:scale-95"
            >
              Open Market
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
