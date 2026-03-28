import React from 'react';
import { motion } from 'motion/react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-semibold transition-colors relative cursor-pointer ${
      active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
    }`}
  >
    {children}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
        active ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'
      }`}>
        {count}
      </span>
    )}
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </button>
);