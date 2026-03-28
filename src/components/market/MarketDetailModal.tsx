import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Info, Share2, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MarketEvent, ChartDataPoint, MarketOutcome } from '@/types/market';

interface MarketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MarketEvent | null;
  chartData: ChartDataPoint[];
}

export const MarketDetailModal: React.FC<MarketDetailModalProps> = ({ isOpen, onClose, event, chartData }) => {
  const [shouldRenderChart, setShouldRenderChart] = useState(false);

  // Delay chart rendering to ensure parent dimensions are calculated after modal transition
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShouldRenderChart(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShouldRenderChart(false);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Main Content */}
          <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] font-extrabold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white max-w-2xl leading-tight tracking-tight">
                  {event.question}
                </h2>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                  <Share2 size={18} />
                </button>
                <button className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                  <Star size={18} />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatItem label="Probability" value={`${event.probability}%`} sub={`${event.change}% (24h)`} isPos={true} />
              <StatItem label="Total Volume" value={event.volume} sub="Global interest" />
              <StatItem label="Time Left" value={event.timeLeft} sub="Market ends soon" />
            </div>

            <div className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Price History</h3>
                <div className="flex gap-1">
                  {['1H', '1D', '1W', '1M', 'ALL'].map((t) => (
                    <button key={t} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors ${t === '1M' ? 'bg-white text-zinc-950' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Robust Recharts container with explicit constraints and conditional rendering */}
              <div className="relative w-full h-[300px] sm:h-[400px] flex-1 overflow-hidden">
                {shouldRenderChart && (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                        itemStyle={{ color: '#3b82f6' }}
                      />
                      <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Trading Panel */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-zinc-800 p-6 md:p-8 bg-zinc-900/50 flex flex-col">
            <div className="mb-8">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Trade Position</h3>
              <div className="flex p-1 bg-zinc-800 rounded-xl mb-6">
                <button className="flex-1 py-2.5 text-sm font-bold bg-green-500 text-white rounded-lg shadow-lg shadow-green-500/20 active:scale-95 transition-transform">YES</button>
                <button className="flex-1 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors">NO</button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-2 font-medium">
                    <span>Order Type</span>
                    <span className="text-white">Market</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">USDC</span>
                  </div>
                </div>

                <div className="bg-zinc-800/20 p-4 rounded-2xl space-y-3 border border-zinc-800/50">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-500">Shares to buy</span>
                    <span className="text-white font-bold">0.00</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-500">Avg. Price</span>
                    <span className="text-white font-bold">$0.{event.probability}</span>
                  </div>
                  <div className="pt-3 border-t border-zinc-800 flex justify-between text-xs items-center">
                    <span className="text-zinc-500">Potential Return</span>
                    <span className="text-green-400 font-extrabold text-sm">$0.00 (0%)</span>
                  </div>
                </div>

                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">
                  Confirm Purchase
                </button>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-800/50">
              <div className="flex items-start gap-3 text-[11px] text-zinc-500 mb-4 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                <Info size={14} className="flex-shrink-0 text-blue-500 mt-0.5" />
                <p className="leading-relaxed">Trading fees are approximately <span className="text-zinc-300 font-bold">0.05 USDC</span> per transaction.</p>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium">Balance</span>
                <span className="text-white font-black tracking-tight">1,240.50 USDC</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const StatItem = ({ label, value, sub, isPos }: { label: string; value: string; sub: string; isPos?: boolean }) => (
  <div className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-2xl hover:bg-zinc-800/50 transition-colors">
    <p className="text-[10px] text-zinc-500 mb-1 font-bold uppercase tracking-wider">{label}</p>
    <p className="text-xl font-black text-white tracking-tight">{value}</p>
    <p className={`text-[10px] mt-1 flex items-center gap-1 font-bold ${isPos ? 'text-green-400' : 'text-zinc-500'}`}>
      {isPos && <TrendingUp size={10} />} {sub}
    </p>
  </div>
);
