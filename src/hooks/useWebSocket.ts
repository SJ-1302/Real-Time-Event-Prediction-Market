import { useEffect, useRef, useCallback, useState } from 'react';
import { MarketWebSocket } from '@/services/websocket';

interface UseWebSocketOptions {
  /** Market IDs to subscribe to */
  marketIds?: number[];
  /** Called when a subscribed market's price changes */
  onPriceUpdate?: (data: { marketId: number; probability: number; volume: string }) => void;
  /** Auto-connect on mount */
  autoConnect?: boolean;
}

/**
 * React hook for real-time WebSocket price updates.
 * Manages connection lifecycle, subscriptions, and cleanup.
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { marketIds = [], onPriceUpdate, autoConnect = true } = options;
  const wsRef = useRef<MarketWebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const onPriceUpdateRef = useRef(onPriceUpdate);
  onPriceUpdateRef.current = onPriceUpdate;

  // Connect
  const connect = useCallback(async () => {
    if (wsRef.current) return;

    const ws = new MarketWebSocket({
      onPriceUpdate: (data) => onPriceUpdateRef.current?.(data),
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
    });

    wsRef.current = ws;
    await ws.connect();
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
    wsRef.current = null;
    setConnected(false);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  // Manage subscriptions when marketIds change
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;

    marketIds.forEach(id => ws.subscribeToMarket(id));

    return () => {
      marketIds.forEach(id => ws.unsubscribeFromMarket(id));
    };
  }, [marketIds]);

  return { connected, connect, disconnect };
}
