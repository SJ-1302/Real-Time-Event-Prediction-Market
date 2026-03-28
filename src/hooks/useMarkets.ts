import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MarketEvent, MarketFilters, SortOption } from '@/types/market';
import { marketApi } from '@/services/api';

/**
 * Hook for managing market data, filtering, and sorting.
 * Currently reads from mock data — will switch to API when backend is ready.
 */
export function useMarkets() {
  const [markets, setMarkets] = useState<MarketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('Highest Volume');
  const [activeCategory, setActiveCategory] = useState('All Events');
  const [filters, setFilters] = useState<MarketFilters>({
    countries: [],
    sectors: [],
    timeframe: '',
    volumeRange: [0, 1000000],
  });

  // Load markets
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    marketApi.getAll()
      .then(data => {
        if (mounted) {
          setMarkets(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load markets');
          setLoading(false);
        }
      });
      
    return () => { mounted = false; };
  }, []);

  // Filter logic
  const filteredMarkets = useMemo(() => {
    let result = [...markets];

    // Category filter
    if (activeCategory !== 'All Events') {
      if (activeCategory === 'Trending') {
        result = result.filter(m => Math.abs(m.change) > 2);
      } else if (activeCategory === 'New') {
        result = result.slice(-4); // Last 4 added
      }
    }

    // Sector filter
    if (filters.sectors.length > 0) {
      result = result.filter(m =>
        m.tags.some(tag => filters.sectors.includes(tag))
      );
    }

    // Sort
    switch (sortBy) {
      case 'Highest Volume':
        result.sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
        break;
      case 'Closing Soon':
        result.sort((a, b) => parseTimeLeft(a.timeLeft) - parseTimeLeft(b.timeLeft));
        break;
      case 'High Volatility':
        result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
        break;
      case 'Most Recent':
        result.reverse();
        break;
    }

    return result;
  }, [markets, filters, sortBy, activeCategory]);

  const updateMarketPrice = useCallback((marketId: number, probability: number) => {
    setMarkets(prev =>
      prev.map(m => m.id === marketId ? { ...m, probability } : m)
    );
  }, []);

  return {
    markets: filteredMarkets,
    allMarkets: markets,
    loading,
    error,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    activeCategory,
    setActiveCategory,
    updateMarketPrice,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function parseVolume(vol: string): number {
  const num = parseFloat(vol.replace(/[$,]/g, ''));
  if (vol.includes('M')) return num * 1_000_000;
  if (vol.includes('K')) return num * 1_000;
  return num;
}

function parseTimeLeft(time: string): number {
  const match = time.match(/(\d+)/);
  if (!match) return Infinity;
  const num = parseInt(match[1]);
  if (time.includes('month')) return num * 30;
  if (time.includes('day')) return num;
  if (time.includes('hour')) return num / 24;
  return num;
}
