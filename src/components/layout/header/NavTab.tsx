import React from 'react';

interface NavTabProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const NavTab: React.FC<NavTabProps> = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
      active
        ? 'bg-zinc-100 text-zinc-950'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
    }`}
  >
    {icon}
    {label}
  </button>
);