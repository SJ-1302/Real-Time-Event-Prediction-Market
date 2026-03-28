import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/header/Header';
import { PredictionCard } from './components/market/PredictionCard';
import { MarketDetailModal } from './components/market/MarketDetailModal';
import { PortfolioView } from './components/portfolio/PortfolioView';
import { AdminPortalView } from './components/adminportal/AdminPortalView';
import { motion, AnimatePresence } from 'motion/react';
import type { MarketEvent, ChartDataPoint } from './types/market';
import type { SiteConfig } from './types/admin';
import { useMarkets } from './hooks/useMarkets';
import { usePortfolio } from './hooks/usePortfolio';
import logoImg from './assets/logo.png';

const siteConfig: SiteConfig = {
  name: 'Optima Markets',
  logo: '/logo.svg',
  primaryColor: '#3b82f6',
  footerLinks: ['Terms of Service', 'Privacy Policy', 'Trading Rules', 'API Documentation'],
  socialLinks: { twitter: 'https://twitter.com', discord: 'https://discord.com' }
};

export default function App() {
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { markets, loading: marketsLoading } = useMarkets();
  const { portfolio, loading: portfolioLoading } = usePortfolio();

  const handleOpenMarket = (event: MarketEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  if (marketsLoading || portfolioLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium">Initializing Prediction Engine APIs...</p>
        </div>
      </div>
    );
  }

  const userContext: import('@/types/user').AdminUser = { 
    id: 'usr_1', 
    name: 'Platform Administrator', 
    email: 'admin@optima.com', 
    joinedAt: new Date().toISOString(),
    totalValue: '$10,000.00',
    activeTrades: 0,
    totalPnL: '+$0.00',
    pnlPositive: true,
    availableFunds: '$10,000.00',
    status: 'active',
    portfolio: {
      totalValue: 10000,
      totalPnL: 0,
      availableFunds: 10000,
      positions: [],
      history: []
    }
  };

  const adminModel = { 
    pendingEvents: [], 
    activeEvents: markets, 
    allUsers: [userContext] 
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-blue-500/30">
      <Routes>
        <Route
          path="/*"
          element={
            <>
              <Header
                userData={userContext}
                siteConfig={siteConfig}
                showSecondaryHeader={true}
              />
              <main className="pb-20">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <motion.div
                        key="market"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-[1400px] mx-auto px-6 py-8"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Trending Markets</h1>
                            <p className="text-sm text-zinc-500">Discover and trade on the most anticipated global events</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 mr-2">Sort by:</span>
                            <select className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium px-3 py-1.5 focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer">
                              <option>Highest Volume</option>
                              <option>Most Recent</option>
                              <option>Closing Soon</option>
                              <option>High Volatility</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {markets.map((event: MarketEvent) => (
                            <PredictionCard
                              key={event.id}
                              {...event}
                              onOpenMarket={() => handleOpenMarket(event)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    }
                  />
                  <Route
                    path="/portfolio"
                    element={
                      <motion.div
                        key="portfolio"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <PortfolioView data={portfolio!} />
                      </motion.div>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <motion.div
                        key="admin"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AdminPortalView
                          data={adminModel as any}
                          allEvents={markets}
                          allUsers={adminModel.allUsers}
                        />
                      </motion.div>
                    }
                  />
                </Routes>
              </main>
            </>
          }
        />
      </Routes>

      <MarketDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        chartData={[]}
      />

      <footer className="border-t border-zinc-900 py-12 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain filter grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all cursor-pointer" />
            </div>
            <span className="text-sm font-semibold text-zinc-500">
              {siteConfig.name} © 2026
            </span>
          </div>
          <div className="flex gap-8">
            {siteConfig.footerLinks.map((link: string) => (
              <FooterLink key={link} label={link} />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

const FooterLink = ({ label }: { label: string }) => (
  <a href="#" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors font-medium cursor-pointer">
    {label}
  </a>
);