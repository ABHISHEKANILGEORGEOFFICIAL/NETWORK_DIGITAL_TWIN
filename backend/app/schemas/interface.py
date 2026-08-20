from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class InterfaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    device_id: str
    device_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: str
    speed_mbps: int
    status: str
    admin_status: str
    mtu: int
    duplex: str
    vlan: int
    utilization_pct: float
    rx_bytes: int
    tx_bytes: int
    rx_packets: int
    tx_packets: int
    rx_errors: int
    tx_errors: int
    rx_drops: int
    tx_drops: int
    latency_ms: float
    packet_loss_pct: float
    last_updated: datetime

class InterfaceActionRequest(BaseModel):
    action: str
    speed_mbps: Optional[int] = None
