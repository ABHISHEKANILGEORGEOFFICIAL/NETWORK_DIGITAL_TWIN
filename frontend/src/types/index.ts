export type UserRole = 'admin' | 'engineer' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type DeviceStatus = 'healthy' | 'warning' | 'critical' | 'offline' | 'maintenance';
export type DeviceType = 'router' | 'switch' | 'firewall' | 'server' | 'access_point' | 'load_balancer' | 'gateway' | 'endpoint';
export type NetworkTier = 'internet' | 'perimeter' | 'core' | 'distribution' | 'access' | 'workload';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  vendor: string;
  model: string;
  os_version: string;
  ip_address: string;
  mac_address: string;
  location: string;
  rack_unit: string;
  status: DeviceStatus;
  cpu_utilization: number;
  memory_utilization: number;
  temperature_celsius: number;
  uptime_seconds: number;
  health_score: number;
  pos_x: number;
  pos_y: number;
  tier: NetworkTier;
  last_seen_at?: string;
  interfaces_count?: number;
  active_alerts_count?: number;
}

export interface Interface {
  id: string;
  device_id: string;
  device_name?: string;
  name: string;
  description?: string;
  ip_address?: string;
  mac_address: string;
  speed_mbps: number;
  status: 'up' | 'down' | 'degraded';
  admin_status: 'up' | 'down';
  mtu?: number;
  duplex?: string;
  vlan?: number;
  utilization_pct: number;
  rx_bytes: number;
  tx_bytes: number;
  rx_packets: number;
  tx_packets: number;
  rx_errors: number;
  tx_errors: number;
  rx_drops: number;
  tx_drops: number;
  latency_ms: number;
  packet_loss_pct: number;
  last_updated?: string;
}

export interface DeviceDetail extends Device {
  interfaces: Interface[];
  neighbors: string[];
  recent_events: Array<{ timestamp: string; type: string; message: string }>;
  active_config_snippet?: string;
}

export interface Link {
  id: string;
  name: string;
  source_device_id: string;
  source_device_name?: string;
  source_interface_id: string;
  source_interface_name?: string;
  target_device_id: string;
  target_device_name?: string;
  target_interface_id: string;
  target_interface_name?: string;
  capacity_mbps: number;
  status: 'up' | 'down' | 'congested' | 'degraded';
  utilization_pct: number;
  current_bandwidth_mbps: number;
  latency_ms: number;
  packet_loss_pct: number;
  jitter_ms: number;
  last_updated?: string;
}

export interface GlobalMetrics {
  timestamp: string;
  network_health_score: number;
  health_classification: 'Excellent' | 'Healthy' | 'Warning' | 'Degraded' | 'Critical';
  availability_pct: number;
  total_devices: number;
  healthy_devices: number;
  warning_devices: number;
  critical_devices: number;
  offline_devices: number;
  total_interfaces: number;
  total_links: number;
  total_bandwidth_gbps: number;
  avg_latency_ms: number;
  avg_packet_loss_pct: number;
  active_alerts_count: number;
  critical_alerts_count: number;
  open_incidents_count: number;
  current_scenario?: string;
  twin_sync_rate_pct?: number;
  twin_accuracy_pct?: number;
  breakdown?: {
    availability: number;
    cpu: number;
    memory: number;
    bandwidth: number;
    latency: number;
    packet_loss: number;
  };
}

export interface TelemetryPoint {
  timestamp: string;
  device_id: string;
  cpu: number;
  memory: number;
  bandwidth_in_mbps: number;
  bandwidth_out_mbps: number;
  latency_ms: number;
  packet_loss_pct: number;
  temperature_celsius: number;
  status: string;
}

export type AlertSeverity = 'info' | 'warning' | 'high' | 'critical';
export type AlertStatus = 'open' | 'new' | 'acknowledged' | 'investigating' | 'resolved';

export interface Alert {
  id: string;
  device_id: string;
  device_name?: string;
  interface_id?: string;
  link_id?: string;
  incident_id?: string;
  severity: AlertSeverity;
  metric_name: string;
  metric_value?: number;
  threshold_value?: number;
  title: string;
  description: string;
  suggested_action?: string;
  status: AlertStatus;
  created_at: string;
  resolved_at?: string;
}

export interface IncidentTimelineEvent {
  timestamp: string;
  event: string;
  severity: string;
  device_id?: string;
}

export interface Incident {
  id: string;
  incident_number: string;
  title: string;
  severity: AlertSeverity;
  status: 'open' | 'investigating' | 'mitigating' | 'resolved';
  root_cause_device_id?: string;
  root_cause_summary?: string;
  confidence_pct: number;
  affected_devices_count: number;
  affected_links_count: number;
  estimated_impact: string;
  timeline: IncidentTimelineEvent[];
  recommendations: string[];
  affected_nodes: string[];
  alerts?: Alert[];
  created_at: string;
}

export interface SimulationScenario {
  key: string;
  name: string;
  description: string;
  default_target: string;
  default_duration: number;
}

export interface SimulationStatus {
  current_scenario: string;
  is_running: boolean;
  is_paused: boolean;
  active_injections: any[];
  simulated_time_seconds: number;
  events_generated: number;
  devices_affected: number;
  alerts_generated: number;
  last_sync_timestamp: string;
  twin_sync_rate_pct: number;
  twin_accuracy_pct: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  is_read: boolean;
  created_at: string;
}

export interface WhatIfReroutePath {
  source: string;
  destination: string;
  original_path: string[];
  new_path: string[];
  original_latency_ms: number;
  new_latency_ms: number;
  reroute_possible: boolean;
}

export interface WhatIfResponse {
  scenario: string;
  target_id: string;
  estimated_impact: string;
  affected_devices_count: number;
  affected_devices: string[];
  affected_links_count: number;
  affected_links: string[];
  isolated_nodes: string[];
  congested_links: string[];
  estimated_recovery_time_seconds: number;
  health_score_before: number;
  health_score_after: number;
  traffic_redistribution_summary: string;
  rerouted_paths: WhatIfReroutePath[];
  suggested_mitigations: string[];
}

export interface PathHop {
  hop_number: number;
  device_id: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  status: string;
  cpu: number;
  link_to_next?: string;
  link_latency_ms: number;
  link_loss_pct: number;
  link_utilization_pct: number;
  is_healthy: boolean;
}

export interface PathTraceResult {
  source_id: string;
  destination_id: string;
  path_found: boolean;
  error?: string;
  path_nodes?: string[];
  total_hops: number;
  total_latency_ms: number;
  max_packet_loss_pct: number;
  highest_utilization_pct: number;
  bottleneck_device?: string;
  hops: PathHop[];
  sla_compliant: boolean;
}

export interface DeviceConfig {
  id: string;
  device_id: string;
  version: number;
  syntax_type: string;
  content: string;
  diff_summary: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface NetworkSnapshot {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  device_count: number;
  healthy_count: number;
  warning_count: number;
  critical_count: number;
  health_score: number;
  created_at: string;
}

export interface SnapshotComparison {
  snapshot_a_id: string;
  snapshot_a_name: string;
  snapshot_b_id: string;
  snapshot_b_name: string;
  health_score_diff: number;
  devices_changed: number;
  links_changed: number;
  alerts_diff_count: number;
  details: Array<{
    device_id: string;
    device_name: string;
    status_before: string;
    status_after: string;
    cpu_before: number;
    cpu_after: number;
    diff_type: string;
  }>;
}

export type DesignerComponentType =
  | 'router'
  | 'switch_l2'
  | 'switch_l3'
  | 'firewall'
  | 'server'
  | 'access_point'
  | 'load_balancer'
  | 'cloud'
  | 'workstation'
  | 'internet';

export interface DesignerComponentConfig {
  name: string;
  ip_address: string;
  description: string;
  speed_mbps: number;
  vlan?: number;
  ports?: number;
  ssid?: string;
  subnet?: string;
  gateway?: string;
  os?: string;
  role?: string;
}

export interface DesignerNodeData {
  id: string;
  componentType: DesignerComponentType;
  label: string;
  config: DesignerComponentConfig;
}

export interface DesignerLink {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  bandwidth_mbps: number;
  type: 'ethernet' | 'fiber' | 'wireless' | 'vpn';
}

export interface NetworkDesign {
  id: string;
  name: string;
  description: string;
  nodes: Array<{ id: string; type: DesignerComponentType; position: { x: number; y: number }; config: DesignerComponentConfig }>;
  links: DesignerLink[];
  created_at: string;
  updated_at: string;
}

export interface NetworkReport {
  report_id: string;
  report_type: string;
  generated_at: string;
  timeframe: string;
  health_summary: {
    availability_score: number;
    cpu_score: number;
    memory_score: number;
    bandwidth_score: number;
    latency_score: number;
    packet_loss_score: number;
    overall_health_score: number;
    classification: string;
  };
  performance_summary: {
    avg_cpu_pct: number;
    peak_cpu_pct: number;
    avg_memory_pct: number;
    total_bandwidth_gbps: number;
    avg_latency_ms: number;
    max_latency_ms: number;
    avg_loss_pct: number;
  };
  top_congested_links: Array<{
    link_name: string;
    capacity: string;
    utilization: string;
    latency: string;
    status: string;
  }>;
  critical_incidents_count: number;
  resolved_alerts_count: number;
  recommendations: string[];
}
