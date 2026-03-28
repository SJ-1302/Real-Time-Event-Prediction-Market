import { PortfolioData } from './portfolio';

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  avatarUrl?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  totalValue: string;
  activeTrades: number;
  totalPnL: string;
  pnlPositive: boolean;
  availableFunds: string;
  status: 'active' | 'suspended';
  portfolio: PortfolioData;
}
