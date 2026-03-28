import { MarketOutcome } from './market';

export type OrderType = 'MARKET' | 'LIMIT';
export type TradeType = 'BUY' | 'SELL';

export interface TradeOrder {
  marketId: number;
  position: MarketOutcome;
  amount: number;
  orderType: OrderType;
  limitPrice?: number;
}

export interface TradeResult {
  id: string;
  marketId: number;
  position: MarketOutcome;
  shares: number;
  price: number;
  amount: number;
  type: TradeType;
  timestamp: string;
}

export interface Position {
  marketId: number;
  question: string;
  yesShares: number;
  noShares: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
}
