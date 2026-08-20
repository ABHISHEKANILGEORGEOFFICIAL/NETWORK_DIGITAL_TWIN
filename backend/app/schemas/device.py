from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict

class InterfaceBasicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    device_id: str
    name: str
    description: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: str
    speed_mbps: int = 1000
    status: str = "up"
    admin_status: str = "up"
    utilization_pct: float = 15.0
    rx_bytes: int = 0
    tx_bytes: int = 0
    rx_packets: int = 0
    tx_packets: int = 0
    rx_errors: int = 0
    tx_errors: int = 0
    rx_drops: int = 0
    tx_drops: int = 0
    latency_ms: float = 2.5
    packet_loss_pct: float = 0.0

class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    vendor: str = "Cisco"
    model: str = "Catalyst 9300"
    os_version: str = "IOS-XE 17.9"
    ip_address: str
    mac_address: str
    location: str = "HQ Datacenter"
    rack_unit: str = "U10"
    status: str = "healthy"
    cpu_utilization: float = 20.0
    memory_utilization: float = 40.0
    temperature_celsius: float = 38.0
    uptime_seconds: int = 864000
    health_score: float = 100.0
    pos_x: float = 0.0
    pos_y: float = 0.0
    tier: str = "core"
    last_seen_at: Optional[datetime] = None
    interfaces_count: Optional[int] = 0
    active_alerts_count: Optional[int] = 0

class DeviceDetailResponse(DeviceResponse):
    interfaces: List[InterfaceBasicResponse] = []
    neighbors: List[str] = []
    recent_events: List[dict] = []
    active_config_snippet: Optional[str] = None

class DeviceActionRequest(BaseModel):
    action: str
    target_ip: Optional[str] = None
    parameters: Optional[dict] = None
