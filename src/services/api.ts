import { API_BASE_URL } from '@/constants';
import type { MarketEvent, ChartDataPoint, MarketFilters } from '@/types/market';
import type { PortfolioData } from '@/types/portfolio';
import type { TradeOrder, TradeResult } from '@/types/trade';
import type { AdminPortalData, PendingEvent, ActiveEventAdmin } from '@/types/admin';
import type { AdminUser } from '@/types/user';

// ─── Base fetch helper ──────────────────────────────────────────────────────

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get Clerk token if available
  const token = await getAuthToken();
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }

  return res.json();
}

async function getAuthToken(): Promise<string | null> {
  try {
    // Clerk exposes getToken on the window session
    const clerk = (window as any).__clerk_frontend_api;
    if (clerk?.session) {
      return await clerk.session.getToken();
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Market API ─────────────────────────────────────────────────────────────

export const marketApi = {
  getAll: (filters?: Partial<MarketFilters>) =>
    fetchJSON<MarketEvent[]>('/markets', {
      method: 'GET',
    }),

  getById: (id: number) =>
    fetchJSON<MarketEvent>(`/markets/${id}`),

  getChart: (id: number, timeframe = '1M') =>
    fetchJSON<ChartDataPoint[]>(`/markets/${id}/chart?tf=${timeframe}`),
};

// ─── Trade API ──────────────────────────────────────────────────────────────

export const tradeApi = {
  buy: (order: TradeOrder) =>
    fetchJSON<TradeResult>('/trade', {
      method: 'POST',
      body: JSON.stringify({ ...order, type: 'BUY' }),
    }),

  sell: (order: TradeOrder) =>
    fetchJSON<TradeResult>('/trade', {
      method: 'POST',
      body: JSON.stringify({ ...order, type: 'SELL' }),
    }),
};

// ─── Portfolio API ──────────────────────────────────────────────────────────

export const portfolioApi = {
  get: () =>
    fetchJSON<PortfolioData>('/portfolio'),

  getHistory: () =>
    fetchJSON<PortfolioData>('/portfolio/history'),
};

// ─── Admin API ──────────────────────────────────────────────────────────────

export const adminApi = {
  getPending: () =>
    fetchJSON<PendingEvent[]>('/admin/pending'),

  approve: (id: string) =>
    fetchJSON<{ success: boolean }>(`/admin/approve/${id}`, { method: 'POST' }),

  reject: (id: string) =>
    fetchJSON<{ success: boolean }>(`/admin/reject/${id}`, { method: 'POST' }),

  updateEvent: (id: number, data: Partial<ActiveEventAdmin>) =>
    fetchJSON<ActiveEventAdmin>(`/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  pauseEvent: (id: number) =>
    fetchJSON<{ success: boolean }>(`/admin/pause/${id}`, { method: 'POST' }),

  deleteEvent: (id: number) =>
    fetchJSON<{ success: boolean }>(`/admin/events/${id}`, { method: 'DELETE' }),

  resolveEvent: (id: number, outcome: 'YES' | 'NO') =>
    fetchJSON<{ success: boolean }>(`/admin/resolve/${id}`, {
      method: 'POST',
      body: JSON.stringify({ outcome }),
    }),

  getUsers: () =>
    fetchJSON<AdminUser[]>('/admin/users'),

  triggerLLMGeneration: () =>
    fetchJSON<{ generated: number }>('/admin/generate', { method: 'POST' }),
};
