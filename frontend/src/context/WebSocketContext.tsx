import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GlobalMetrics, Alert, Incident } from '../types';
import { api } from '../services/api';

interface WebSocketContextType {
  isConnected: boolean;
  isLive: boolean;
  lastUpdate: string | null;
  liveMetrics: GlobalMetrics | null;
  activeAlerts: Alert[];
  incidents: Incident[];
  refreshData: () => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<GlobalMetrics | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const wsTelemetryRef = useRef<WebSocket | null>(null);
  const wsAlertsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      const [metrics, alerts, incs] = await Promise.allSettled([
        api.getLiveMetrics(),
        api.getAlerts(),
        api.getIncidents(),
      ]);

      if (metrics.status === 'fulfilled') {
        setLiveMetrics(metrics.value);
        setLastUpdate(new Date().toISOString());
      }
      if (alerts.status === 'fulfilled') setActiveAlerts(alerts.value);
      if (incs.status === 'fulfilled') setIncidents(incs.value);

      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, []);

  const connectWebSockets = useCallback(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = '8000';

    try {
      // Telemetry channel
      const telemetryUrl = `${wsProtocol}//${wsHost}:${wsPort}/ws/telemetry`;
      const wsTelemetry = new WebSocket(telemetryUrl);
      wsTelemetryRef.current = wsTelemetry;

      wsTelemetry.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'TELEMETRY_UPDATE') {
            if (payload.metrics) setLiveMetrics(payload.metrics);
            setLastUpdate(new Date().toISOString());
          }
        } catch (err) {
          console.error('Error parsing telemetry WS message:', err);
        }
      };

      wsTelemetry.onopen = () => setIsConnected(true);
      wsTelemetry.onclose = () => {
        setIsConnected(false);
        scheduleReconnect();
      };

      // Alerts channel
      const alertsUrl = `${wsProtocol}//${wsHost}:${wsPort}/ws/alerts`;
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
  }, []);

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
