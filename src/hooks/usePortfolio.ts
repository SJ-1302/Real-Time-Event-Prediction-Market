import { useState, useEffect } from 'react';
import type { PortfolioData } from '@/types/portfolio';
import { appData } from '@/mockData';

/**
 * Hook for portfolio data.
 * Currently reads from mock data — will switch to API when backend is ready.
 */
export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '1Y' | 'ALL'>('1W');

  useEffect(() => {
    try {
      // TODO: Replace with portfolioApi.get() when backend is ready
      setPortfolio(appData.portfolio as PortfolioData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      setLoading(false);
    }
  }, []);

  return {
    portfolio,
    loading,
    error,
    timeframe,
    setTimeframe,
  };
}
