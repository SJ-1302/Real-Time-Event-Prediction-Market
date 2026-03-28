import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { PortfolioData, PortfolioStat, SectorExposure, Transaction } from '@/types/portfolio';

interface PortfolioViewProps {
  data: PortfolioData;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-center items-center" style={{ marginBottom: '50px' }}>
        <h1 className="text-8xl font-black text-white uppercase" style={{ fontSize: '4.5rem', fontWeight: '900', textAlign: 'center' }}>
          portfolio
        </h1>
      </div>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {data.stats.map((stat: PortfolioStat, i: number) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Portfolio Performance</h3>
              <p className="text-sm text-zinc-500">Historical value over time</p>
            </div>
            <div className="flex gap-2">
              {['1W', '1M', '3M', '1Y', 'ALL'].map((t) => (
                <button key={t} className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${t === '1W' ? 'bg-white text-zinc-900' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Enhanced stability for Recharts with min-height and overflow-hidden */}
          <div className="relative w-full h-[350px] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <LineChart data={data.performance} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0a0a0b' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assets Allocation */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Sector Exposure</h3>
          <div className="space-y-6 flex-1">
            {data.exposure.map((exp: SectorExposure, i: number) => (
              <ExposureRow key={i} {...exp} />
            ))}
          </div>
          <div className="mt-8 p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Primary Strategy</p>
            <p className="text-sm font-medium text-zinc-300">Diversified Alpha</p>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
            <button className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-wider">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-zinc-500 border-b border-zinc-800">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Avg Price</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">P&L</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.transactions.map((trade: Transaction, i: number) => (
                  <TradeRow key={i} {...trade} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, change, isPositive, subtitle }: PortfolioStat) => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors">
    <p className="text-sm text-zinc-500 mb-1">{title}</p>
    <div className="flex items-end gap-3">
      <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
      {change && (
        <span className={`text-xs font-bold flex items-center mb-1.5 px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </span>
      )}
      {subtitle && <span className="text-sm text-zinc-600 mb-1">{subtitle}</span>}
    </div>
  </div>
);

const ExposureRow = ({ label, percentage, color }: SectorExposure) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-zinc-400 uppercase tracking-wider">{label}</span>
      <span className="text-zinc-500">{percentage}%</span>
    </div>
    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${percentage}%` }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full ${color} shadow-[0_0_10px_rgba(59,130,246,0.3)]`} 
      />
    </div>
  </div>
);

const TradeRow = ({ event, position, amount, price, pnl, pnlPos, status, time }: Transaction) => (
  <tr className="group hover:bg-zinc-800/30 transition-colors">
    <td className="px-6 py-4">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white line-clamp-1">{event}</span>
        <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 font-medium">
          <Clock size={10} /> {time}
        </span>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${position === 'YES' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
        {position}
      </span>
    </td>
    <td className="px-6 py-4 text-sm text-zinc-300 font-bold">{amount}</td>
    <td className="px-6 py-4 text-sm text-zinc-400">{price}</td>
    <td className={`px-6 py-4 text-sm font-bold ${pnlPos ? 'text-green-400' : 'text-red-400'}`}>{pnl}</td>
    <td className="px-6 py-4">
      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${status === 'Active' ? 'text-blue-400' : 'text-zinc-600'}`}>
        {status}
      </span>
    </td>
  </tr>
);
