export type EventStatus = 'pending' | 'active' | 'paused' | 'closed' | 'resolved';
export type MarketOutcome = 'YES' | 'NO';

export interface MarketEvent {
  id: number;
  question: string;
  tags: string[];
  probability: number;
  change: number;
  volume: string;
  timeLeft: string;
  status?: EventStatus;
  expirationDate?: string;
  expirationTime?: string;
  resolution?: MarketOutcome | null;
  participants?: number;
  createdAt?: string;
}

export interface ChartDataPoint {
  name: string;
  price: number;
}

export interface MarketFilters {
  countries: string[];
  sectors: string[];
  timeframe: string;
  volumeRange: [number, number];
}

export type SortOption = 'Highest Volume' | 'Most Recent' | 'Closing Soon' | 'High Volatility';
