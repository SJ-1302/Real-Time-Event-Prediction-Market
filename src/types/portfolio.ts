export interface PortfolioStat {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
}

export interface PerformancePoint {
  day: string;
  value: number;
}

export interface SectorExposure {
  label: string;
  percentage: number;
  color: string;
}

export interface Transaction {
  event: string;
  position: string;
  amount: string;
  price: string;
  pnl: string;
  pnlPos: boolean;
  status: 'Active' | 'Closed';
  time: string;
}

export interface PortfolioData {
  stats: PortfolioStat[];
  performance: PerformancePoint[];
  exposure: SectorExposure[];
  transactions: Transaction[];
}
