import React from 'react';
import { Search, Wallet, Filter, LogIn, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import logoImg from '@/assets/logo.png';

import { NavTab } from './NavTab';
import { FilterDialog } from './FilterDialog';
import { UserMenu } from './UserMenu';
import { CATEGORIES, CATEGORY_ICONS } from './HeaderConstants';
import { ADMIN_EMAIL } from '@/constants';
import './SliderStyles.css';

interface HeaderProps {
  userData?: any;
  siteConfig?: any;
  showSecondaryHeader?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userData,
  siteConfig,
  showSecondaryHeader = true,
}) => {
  const { user } = useUser();
  const { openSignIn, openSignUp } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = React.useState('All Events');
  const [showFilterDialog, setShowFilterDialog] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [filterButtonRef, setFilterButtonRef] = React.useState<HTMLButtonElement | null>(null);
  const [userMenuRef, setUserMenuRef] = React.useState<HTMLDivElement | null>(null);
  const [filters, setFilters] = React.useState({
    countries: [] as string[],
    sectors: [] as string[],
    timeframe: '',
    volumeRange: [0, 1000000] as [number, number],
  });

  const isAdmin =
    user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL ||
    user?.publicMetadata?.role === 'admin';

  const isMarketPage = location.pathname === '/';

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return user.primaryEmailAddress?.emailAddress.charAt(0).toUpperCase() || 'U';
  };

  const clearFilters = () => {
    setFilters({ countries: [], sectors: [], timeframe: '', volumeRange: [0, 1000000] });
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    setShowFilterDialog(false);
  };

  const isFilterActive =
    filters.countries.length > 0 ||
    filters.sectors.length > 0 ||
    filters.timeframe !== '' ||
    filters.volumeRange[0] > 0 ||
    filters.volumeRange[1] < 1000000;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef && !userMenuRef.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, userMenuRef]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-semibold text-white bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:to-white transition-all">
                {siteConfig?.name || 'Prediction Market'}
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search events, markets or sectors..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-12 pr-4 text-sm text-zinc-200 focus:outline-none cursor-text"
            />
          </div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <button
                onClick={() => openSignIn()}
                className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm font-medium text-zinc-200 transition-all cursor-pointer"
              >
                <LogIn size={16} /> Log In
              </button>
              <button
                onClick={() => openSignUp()}
                className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm font-medium text-zinc-200 transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </SignedOut>

            <SignedIn>
              {isAdmin ? (
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-sm font-medium text-zinc-200 transition-all cursor-pointer"
                  >
                    <Shield size={16} /> Admin Portal
                  </button>
                  <div className="relative z-50" ref={setUserMenuRef}>
                    <div
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-9 h-9 rounded-full border-2 border-zinc-700 hover:border-blue-500 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer transition-all"
                    >
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} className="w-full h-full rounded-full object-cover" alt="User avatar" />
                      ) : (
                        <span className="text-sm font-semibold text-white">{getUserInitials()}</span>
                      )}
                    </div>
                    <AnimatePresence>
                      {showUserMenu && (
                        <UserMenu user={user} onClose={() => setShowUserMenu(false)} isAdmin={true} />
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/portfolio')}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-sm font-medium text-zinc-200 transition-all cursor-pointer"
                  >
                    <Wallet size={16} /> Portfolio
                  </button>
                  <div className="relative z-50" ref={setUserMenuRef}>
                    <div
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-9 h-9 rounded-full border-2 border-zinc-700 hover:border-blue-500 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer transition-all"
                    >
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} className="w-full h-full rounded-full object-cover" alt="User avatar" />
                      ) : (
                        <span className="text-sm font-semibold text-white">{getUserInitials()}</span>
                      )}
                    </div>
                    <AnimatePresence>
                      {showUserMenu && (
                        <UserMenu user={user} onClose={() => setShowUserMenu(false)} isAdmin={false} />
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </SignedIn>
          </div>
        </div>

        {showSecondaryHeader && isMarketPage && (
          <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between border-t border-zinc-800/50">
            <div className="flex items-center gap-1">
              {CATEGORIES.map((cat: string, i: number) => (
                <NavTab key={cat} icon={CATEGORY_ICONS[i]} label={cat} active={activeTab === cat} onClick={() => setActiveTab(cat)} />
              ))}
              <div className="w-px h-6 bg-zinc-800 mx-2" />
              <button
                ref={setFilterButtonRef}
                onClick={() => setShowFilterDialog(!showFilterDialog)}
                className="flex items-center gap-2 px-4 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors relative cursor-pointer"
              >
                <Filter size={14} /> Filter
                {isFilterActive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live Market</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {showFilterDialog && (
          <FilterDialog
            isOpen={showFilterDialog}
            onClose={() => setShowFilterDialog(false)}
            filters={filters}
            setFilters={setFilters}
            buttonRef={filterButtonRef}
            applyFilters={applyFilters}
            clearFilters={clearFilters}
          />
        )}
      </AnimatePresence>
    </>
  );
};