import {
  User, AuthResponse, Device, DeviceDetail, Interface, Link,
  GlobalMetrics, TelemetryPoint, Alert, Incident, SimulationScenario,
  SimulationStatus, Notification, WhatIfResponse, PathTraceResult,
  DeviceConfig, NetworkSnapshot, SnapshotComparison, NetworkReport
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('nettwin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorBody.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request<User>('/auth/me'),

  // Devices
  getDevices: (params?: { type?: string; status?: string; tier?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.tier) query.append('tier', params.tier);
    if (params?.search) query.append('search', params.search);
    return request<Device[]>(`/devices?${query.toString()}`);
  },
  getDeviceDetail: (id: string) => request<DeviceDetail>(`/devices/${id}`),
  executeDeviceAction: (id: string, action: string, target_ip?: string) =>
    request<{ success: boolean; message?: string; output?: string; results?: any }>(`/devices/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, target_ip }),
    }),

  // Interfaces
  getInterfaces: (params?: { device_id?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.device_id) query.append('device_id', params.device_id);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return request<Interface[]>(`/interfaces?${query.toString()}`);
  },
  getInterfaceDetail: (id: string) => request<Interface>(`/interfaces/${id}`),
  executeInterfaceAction: (id: string, action: string, speed_mbps?: number) =>
    request<{ success: boolean; message: string }>(`/interfaces/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, speed_mbps }),
    }),

  // Topology
  getTopology: () => request<{ nodes: any[]; edges: any[]; devices_summary: Record<string, number>; tiers: string[] }>('/topology'),

  // Telemetry & Metrics
  getLiveMetrics: () => request<GlobalMetrics>('/telemetry/live'),
  getDeviceTelemetryHistory: (deviceId: string, limit: number = 60) =>
    request<{ device_id: string; points: TelemetryPoint[] }>(`/telemetry/history/${deviceId}?limit=${limit}`),
  getTrafficAnalytics: (timeframe: string = '1h') =>
    request<{
      timeframe: string;
      total_traffic_gbps: number;
      protocol_distribution: Array<{ name: string; pct: number; bandwidth_gbps: number; color: string }>;
      top_talkers: Array<{ rank: number; device: string; ip: string; in_mbps: number; out_mbps: number; flows: number }>;
      traffic_series: Array<{ time: string; inbound_gbps: number; outbound_gbps: number; total_gbps: number }>;
    }>(`/telemetry/traffic?timeframe=${timeframe}`),

  // Health
  getHealthStatus: () => request<{ status: string; database: string; websocket: string; simulator: string; active_devices_count: number }>('/health'),
  getHealthBreakdown: () => request<{
    overall_health_score: number;
    classification: string;
    formula_weights: Record<string, number>;
    component_scores: Record<string, number>;
    tier_breakdown: Record<string, { score: number; device_count: number; status: string }>;
    summary: any;
  }>('/health/breakdown'),

  // Alerts & Incidents
  getAlerts: (params?: { severity?: string; status?: string; device_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    if (params?.device_id) query.append('device_id', params.device_id);
    return request<Alert[]>(`/alerts?${query.toString()}`);
  },
  updateAlertStatus: (alertId: string, status: string) =>
    request<{ success: boolean; alert_id: string; new_status: string }>(`/alerts/${alertId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  clearAlerts: () => request<{ success: boolean; cleared_alerts_count: number }>('/alerts/clear', { method: 'POST' }),

  getIncidents: () => request<Incident[]>('/incidents'),
  getIncidentDetail: (id: string) => request<Incident>(`/incidents/${id}`),
  updateIncidentStatus: (id: string, status: string) =>
    request<{ success: boolean; incident_id: string; new_status: string }>(`/incidents/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  // Events
  getEvents: () => request<any[]>('/telemetry/events'),

  // Simulations
  getScenarios: () => request<SimulationScenario[]>('/simulations/scenarios'),
  getSimulationScenarios: () => request<SimulationScenario[]>('/simulations/scenarios'),
  getSimulationStatus: () => request<SimulationStatus>('/simulations/status'),
  startSimulation: () => request<{ success: boolean; message: string }>('/simulations/start', { method: 'POST' }),
  pauseSimulation: () => request<{ success: boolean; message: string }>('/simulations/pause', { method: 'POST' }),
  stopSimulation: () => request<{ success: boolean; message: string }>('/simulations/stop', { method: 'POST' }),
  resetSimulation: () => request<{ success: boolean; message: string }>('/simulations/reset', { method: 'POST' }),
  triggerScenario: (scenario: string, target_device_id?: string, duration_seconds: number = 60, custom_params?: any) =>
    request<{ success: boolean; scenario: string; message: string }>('/simulations/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario, target_device_id, duration_seconds, custom_params }),
    }),
  startSimulationScenario: (scenario: string, target_device_id?: string, duration_seconds: number = 60, custom_params?: any) =>
    request<{ success: boolean; scenario: string; message: string }>('/simulations/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario, target_device_id, duration_seconds, custom_params }),
    }),
  injectCustomFailure: (params: { device_id?: string; link_id?: string; failure_type: string; severity: string; duration_seconds: number }) => {
    const query = new URLSearchParams();
    if (params.device_id) query.append('device_id', params.device_id);
    if (params.link_id) query.append('link_id', params.link_id);
    query.append('failure_type', params.failure_type);
    query.append('severity', params.severity);
    query.append('duration_seconds', params.duration_seconds.toString());
    return request<{ success: boolean; target: string; failure_type: string; injection: any }>(`/simulations/custom-inject?${query.toString()}`, {
      method: 'POST',
    });
  },

  // What-If Analysis
  runWhatIf: (failure_type: string, target_id: string, secondary_target_id?: string) =>
    request<WhatIfResponse>('/what-if/analyze', {
      method: 'POST',
      body: JSON.stringify({ failure_type, target_id, secondary_target_id }),
    }),
  runWhatIfAnalysis: (params: { target_type?: string; target_id: string; failure_type: string }) =>
    request<any>('/what-if/analyze', {
      method: 'POST',
      body: JSON.stringify({ failure_type: params.failure_type, target_id: params.target_id }),
    }),

  // Path Analysis
  tracePath: (source: string, destination: string) =>
    request<PathTraceResult>(`/path-analysis/trace?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`),

  // Interfaces
  setInterfaceStatus: (ifId: string, status: string) =>
    request<any>(`/interfaces/${ifId}/status?status=${status}`, { method: 'POST' }),

  // Configurations
  getDeviceConfigs: (deviceId: string) => request<DeviceConfig[]>(`/configurations/${deviceId}`),
  getDeviceConfig: async (deviceId: string) => {
    const configs = await request<DeviceConfig[]>(`/configurations/${deviceId}`);
    return configs && configs.length > 0 ? configs[0] : null;
  },
  saveDeviceConfig: (deviceId: string, content: string, syntax_type: string = 'cisco_ios', diff_summary?: string) =>
    request<DeviceConfig>('/configurations/save', {
      method: 'POST',
      body: JSON.stringify({ device_id: deviceId, content, syntax_type, diff_summary }),
    }),
  rollbackConfig: (deviceId: string, targetVersion: number) =>
    request<DeviceConfig>(`/configurations/${deviceId}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ target_version: targetVersion }),
    }),

  // Inventory
  getInventory: () => request<any[]>('/inventory'),

  // Snapshots
  getSnapshots: () => request<NetworkSnapshot[]>('/snapshots'),
  createSnapshot: (name: string, description?: string) =>
    request<NetworkSnapshot>('/snapshots', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),
  getSnapshotDetail: (id: string) => request<any>(`/snapshots/${id}`),
  compareSnapshots: (snapA: string, snapB: string) =>
    request<SnapshotComparison>(`/snapshots/compare?snap_a_id=${snapA}&snap_b_id=${snapB}`, {
      method: 'POST',
    }),
  restoreSnapshot: (id: string) =>
    request<{ success: boolean; message: string }>(`/snapshots/${id}/restore`, {
      method: 'POST',
    }),

  // Reports
  generateReport: (reportType: string = 'health', timeframe: string = '24h') =>
    request<NetworkReport>(`/reports/generate?report_type=${reportType}&timeframe=${timeframe}`),

  // Notifications
  getNotifications: () => request<Notification[]>('/notifications'),
  markNotificationsRead: () => request<{ success: boolean; message: string }>('/notifications/read-all', { method: 'POST' }),
};
