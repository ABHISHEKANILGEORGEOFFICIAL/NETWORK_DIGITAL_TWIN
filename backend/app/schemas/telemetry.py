from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class TelemetryPoint(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    timestamp: datetime
    device_id: str
    cpu: float
    memory: float
    bandwidth_in_mbps: float
    bandwidth_out_mbps: float
    latency_ms: float
    packet_loss_pct: float
    temperature_celsius: float
    status: str

class TelemetryHistoryResponse(BaseModel):
    device_id: str
    points: List[TelemetryPoint]

class GlobalMetricsResponse(BaseModel):
    timestamp: datetime
    network_health_score: float
    health_classification: str
    total_devices: int
    healthy_devices: int
    warning_devices: int
    critical_devices: int
    offline_devices: int
    total_interfaces: int
    total_links: int
    total_bandwidth_gbps: float
    avg_latency_ms: float
    avg_packet_loss_pct: float
    availability_pct: float
    active_alerts_count: int
    critical_alerts_count: int
    open_incidents_count: int
