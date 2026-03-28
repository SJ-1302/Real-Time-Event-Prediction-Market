import { WS_URL } from '@/constants';
import type { MarketEvent } from '@/types/market';

type PriceUpdateHandler = (data: { marketId: number; probability: number; volume: string }) => void;
type TradeUpdateHandler = (data: { marketId: number; position: string; shares: number; price: number }) => void;
type EventUpdateHandler = (data: { type: string; event: MarketEvent }) => void;

interface WebSocketHandlers {
  onPriceUpdate?: PriceUpdateHandler;
  onTradeUpdate?: TradeUpdateHandler;
  onEventUpdate?: EventUpdateHandler;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * WebSocket client for real-time market data.
 * 
 * Uses Socket.io under the hood. Falls back to mock price simulation
 * when the backend server is unavailable (dev mode).
 */
export class MarketWebSocket {
  private socket: any = null;
  private handlers: WebSocketHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private mockInterval: ReturnType<typeof setInterval> | null = null;
  private subscribedMarkets = new Set<number>();
  private useMock = false;

  constructor(handlers: WebSocketHandlers = {}) {
    this.handlers = handlers;
  }

  async connect(): Promise<void> {
    try {
      // Dynamic import to avoid bundling socket.io-client if not installed
      const { io } = await import('socket.io-client');
      
      this.socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        this.reconnectAttempts = 0;
        this.handlers.onConnect?.();
        
        // Re-subscribe to previously subscribed markets
        this.subscribedMarkets.forEach(id => {
          this.socket?.emit('subscribe:market', { marketId: id });
        });
      });

      this.socket.on('disconnect', () => {
        this.handlers.onDisconnect?.();
      });

      this.socket.on('price:update', (data: any) => {
        this.handlers.onPriceUpdate?.(data);
      });

      this.socket.on('trade:update', (data: any) => {
        this.handlers.onTradeUpdate?.(data);
      });

      this.socket.on('event:update', (data: any) => {
        this.handlers.onEventUpdate?.(data);
      });

      this.socket.on('connect_error', () => {
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn('[WS] Backend unavailable, falling back to mock updates');
          this.startMockUpdates();
        }
      });
    } catch {
      // socket.io-client not installed — use mock mode
      console.warn('[WS] socket.io-client not available, using mock mode');
      this.startMockUpdates();
    }
  }

  subscribeToMarket(marketId: number): void {
    this.subscribedMarkets.add(marketId);
    if (this.socket?.connected) {
      this.socket.emit('subscribe:market', { marketId });
    }
  }

  unsubscribeFromMarket(marketId: number): void {
    this.subscribedMarkets.delete(marketId);
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:market', { marketId });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
    }
    this.subscribedMarkets.clear();
  }

  // ── Mock price simulation for dev mode ──────────────────────────────────
  private startMockUpdates(): void {
    this.useMock = true;
    this.handlers.onConnect?.();

    this.mockInterval = setInterval(() => {
      this.subscribedMarkets.forEach(marketId => {
        const delta = (Math.random() - 0.5) * 2; // -1 to +1
        this.handlers.onPriceUpdate?.({
          marketId,
          probability: Math.max(1, Math.min(99, 50 + Math.round(delta * 10))),
          volume: `$${(Math.random() * 500).toFixed(0)}K`,
        });
      });
    }, 3000);
  }
}

// ── Singleton instance ────────────────────────────────────────────────────
let wsInstance: MarketWebSocket | null = null;

export function getWebSocket(handlers?: WebSocketHandlers): MarketWebSocket {
  if (!wsInstance) {
    wsInstance = new MarketWebSocket(handlers);
  }
  return wsInstance;
}
