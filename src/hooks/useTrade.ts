import { useState, useCallback } from 'react';
import type { MarketOutcome } from '@/types/market';
import type { TradeOrder } from '@/types/trade';

/**
 * Hook for trade execution logic.
 * Handles amount validation, share calculation, and order submission.
 */
export function useTrade(marketId: number, probability: number) {
  const [position, setPosition] = useState<MarketOutcome>('YES');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = position === 'YES' ? probability / 100 : (100 - probability) / 100;
  const shares = amount ? parseFloat(amount) / price : 0;
  const potentialReturn = shares * 1.0; // Each share pays $1 if correct
  const potentialProfit = potentialReturn - (parseFloat(amount) || 0);
  const returnPercent = amount ? (potentialProfit / parseFloat(amount)) * 100 : 0;

  const executeTrade = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order: TradeOrder = {
        marketId,
        position,
        amount: parseFloat(amount),
        orderType: 'MARKET',
      };

      // TODO: Replace with tradeApi.buy(order) when backend is ready
      console.log('Executing trade:', order);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reset form after successful trade
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trade failed');
    } finally {
      setLoading(false);
    }
  }, [marketId, position, amount]);

  return {
    position,
    setPosition,
    amount,
    setAmount,
    price,
    shares,
    potentialReturn,
    potentialProfit,
    returnPercent,
    loading,
    error,
    executeTrade,
  };
}
