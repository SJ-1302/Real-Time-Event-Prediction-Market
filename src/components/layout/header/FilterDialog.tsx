import React from 'react';
import { motion } from 'motion/react';
import { Globe, Briefcase, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { ALL_COUNTRIES, ALL_SECTORS, TIMEFRAMES } from './HeaderConstants';
import type { MarketFilters } from '@/types/market';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MarketFilters;
  setFilters: React.Dispatch<React.SetStateAction<MarketFilters>>;
  buttonRef: HTMLButtonElement | null;
  applyFilters: () => void;
  clearFilters: () => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({ 
  onClose, filters, setFilters, buttonRef, applyFilters, clearFilters 
}) => {
  const [showAllCountries, setShowAllCountries] = React.useState(false);
  const [showAllSectors, setShowAllSectors] = React.useState(false);

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M+`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const toggleItem = (key: 'countries' | 'sectors', value: string) => {
    setFilters((prev: MarketFilters) => {
      const currentList: string[] = prev[key];
      const isIncluded = currentList.includes(value);
      return {
        ...prev,
        [key]: isIncluded ? currentList.filter(v => v !== value) : [...currentList, value]
      };
    });
  };

  const displayedCountries = showAllCountries ? ALL_COUNTRIES : ALL_COUNTRIES.slice(0, 10);
  const displayedSectors = showAllSectors ? ALL_SECTORS : ALL_SECTORS.slice(0, 10);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/40 z-40"
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        style={{
          position: 'absolute',
          top: buttonRef ? buttonRef.getBoundingClientRect().bottom + 8 : 120,
          left: buttonRef ? buttonRef.getBoundingClientRect().left : '50%',
          transform: buttonRef ? 'none' : 'translateX(-50%)',
          width: '480px', maxWidth: '480px'
        }}
        className="max-h-[500px] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50"
      >
        <div className="p-4 space-y-6">
          {/* Countries */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={14} className="text-blue-400" />
              <h3 className="text-xs font-semibold text-white">Country/Region</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {displayedCountries.map(country => (
                <button
                  key={country}
                  onClick={() => toggleItem('countries', country)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filters.countries.includes(country) ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {country}
                </button>
              ))}
              <button onClick={() => setShowAllCountries(!showAllCountries)} className="px-2.5 py-1.5 text-xs text-blue-400 flex items-center gap-1">
                {showAllCountries ? <>Less <ChevronUp size={12}/></> : <>More <ChevronDown size={12}/></>}
              </button>
            </div>
          </div>

          {/* Sectors */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={14} className="text-purple-400" />
              <h3 className="text-xs font-semibold text-white">Sector</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {displayedSectors.map(sector => (
                <button
                  key={sector}
                  onClick={() => toggleItem('sectors', sector)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filters.sectors.includes(sector) ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {sector}
                </button>
              ))}
              <button onClick={() => setShowAllSectors(!showAllSectors)} className="px-2.5 py-1.5 text-xs text-blue-400 flex items-center gap-1">
                {showAllSectors ? <>Less <ChevronUp size={12}/></> : <>More <ChevronDown size={12}/></>}
              </button>
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-green-400" />
              <h3 className="text-xs font-semibold text-white">Time to Resolution</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf}
                  onClick={() => setFilters((p: MarketFilters) => ({ ...p, timeframe: p.timeframe === tf ? '' : tf }))}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filters.timeframe === tf ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Trading Volume Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-blue-400" />
                <h3 className="text-xs font-semibold text-white">Trading Volume</h3>
              </div>
              <span className="text-xs text-zinc-400">{formatVolume(filters.volumeRange[0])} - {formatVolume(filters.volumeRange[1])}</span>
            </div>
            <div className="relative pt-8 pb-4">
              <div className="relative w-full h-2 bg-zinc-700 rounded-full">
                <div 
                  className="absolute h-full rounded-full transition-all duration-150"
                  style={{
                    left: `${(filters.volumeRange[0] / 1000000) * 100}%`,
                    width: `${((filters.volumeRange[1] - filters.volumeRange[0]) / 1000000) * 100}%`,
                    background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)'
                  }}
                />
              </div>
              <input
                type="range" min="0" max="1000000" step="10000"
                value={filters.volumeRange[0]}
                onChange={(e) => setFilters((p: MarketFilters) => ({ ...p, volumeRange: [Math.min(parseInt(e.target.value), p.volumeRange[1] - 10000), p.volumeRange[1]] }))}
                className="range-slider"
              />
              <input
                type="range" min="0" max="1000000" step="10000"
                value={filters.volumeRange[1]}
                onChange={(e) => setFilters((p: MarketFilters) => ({ ...p, volumeRange: [p.volumeRange[0], Math.max(parseInt(e.target.value), p.volumeRange[0] + 10000)] }))}
                className="range-slider"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-4 py-3 flex items-center justify-center gap-2">
          <button onClick={onClose} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg">Cancel</button>
          <button onClick={clearFilters} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white">Clear All</button>
          <button onClick={applyFilters} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg">Apply Filters</button>
        </div>
      </motion.div>
    </>
  );
};