// UserMenu.tsx
import React from 'react';
import { motion } from 'motion/react';
import { Wallet, LogOut, User, Settings } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import type { UserResource } from '@clerk/types';

interface UserMenuProps {
  user: UserResource | null | undefined;
  onClose: () => void;
  isAdmin?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onClose, isAdmin = false }) => {
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed right-4 top-20 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50"
    >
      {/* User Info Section */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {user?.imageUrl ? (
              <img src={user.imageUrl} className="w-full h-full rounded-full object-cover" alt="User" />
            ) : (
              <User size={20} className="text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.fullName || user?.firstName || 'User'}
            </p>
            <p className="text-xs text-zinc-400 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {!isAdmin && (
          <>
            <button 
              onClick={() => {
                onClose();
                // Add your wallet navigation logic here
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              <Wallet size={16} />
              <span>Wallet</span>
            </button>
            
            <button 
              onClick={() => {
                onClose();
                // Add your settings navigation logic here
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>

            <div className="h-px bg-zinc-800 my-2" />
          </>
        )}

        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </motion.div>
  );
};