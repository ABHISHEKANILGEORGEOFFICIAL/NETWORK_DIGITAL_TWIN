import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { GlobalMetrics, Alert, Incident } from '../types';
import { api } from '../services/api';

interface WebSocketContextType {
  isConnected: boolean;
  isLive: boolean;
  lastUpdate: Date | null;
  liveMetrics: GlobalMetrics | null;
  activeAlerts: Alert[];
  incidents: Incident[];
  refreshData: () => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<GlobalMetrics | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const wsTelemetryRef = useRef<WebSocket | null>(null);
  const wsAlertsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const fetchInitialData = async () => {
    try {
      const [metrics, alerts, incs] = await Promise.all([
        api.getLiveMetrics(),
        api.getAlerts(),
        api.getIncidents(),
      ]);
      setLiveMetrics(metrics);
      setActiveAlerts(alerts);
      setIncidents(incs);
      setLastUpdate(new Date());
    } catch (e) {
      console.warn('REST initial fetch fallback active:', e);
    }
  };

  const connectWebSockets = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/telemetry`;
    const alertsUrl = `${protocol}//${host}/ws/alerts`;

    try {
      const ws = new WebSocket(wsUrl);
      wsTelemetryRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'TELEMETRY_UPDATE' && payload.data) {
            setLiveMetrics(payload.data);
            setLastUpdate(new Date());
          }
        } catch (err) {
          console.error('Error parsing telemetry WS message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        scheduleReconnect();
      };

      ws.onerror = () => {
        setIsConnected(false);
        ws.close();
      };

      // Alerts channel
      const wsAlerts = new WebSocket(alertsUrl);
      wsAlertsRef.current = wsAlerts;

      wsAlerts.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'ALERTS_UPDATE') {
            if (payload.alerts) setActiveAlerts(payload.alerts);
            if (payload.incidents) setIncidents(payload.incidents);
          }
        } catch (err) {
          console.error('Error parsing alerts WS message:', err);
        }
      };

    } catch (err) {
      console.warn('WebSocket connection init failed:', err);
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) return;
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connectWebSockets();
      fetchInitialData();
    }, 3000);
  };

  useEffect(() => {
    fetchInitialData();
    connectWebSockets();

    // Fallback polling interval in case WebSockets are blocked by proxies
    const pollInterval = setInterval(() => {
      fetchInitialData();
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsTelemetryRef.current?.close();
      wsAlertsRef.current?.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        isLive: isConnected,
        lastUpdate,
        liveMetrics,
        activeAlerts,
        incidents,
        refreshData: fetchInitialData,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
