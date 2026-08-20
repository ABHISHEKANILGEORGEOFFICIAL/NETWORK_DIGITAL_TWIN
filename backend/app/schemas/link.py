from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class LinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    source_device_id: str
    source_device_name: Optional[str] = None
    source_interface_id: str
    source_interface_name: Optional[str] = None
    target_device_id: str
    target_device_name: Optional[str] = None
    target_interface_id: str
    target_interface_name: Optional[str] = None
    capacity_mbps: int
    status: str
    utilization_pct: float
    current_bandwidth_mbps: float
    latency_ms: float
    packet_loss_pct: float
    jitter_ms: float
    last_updated: datetime

class LinkActionRequest(BaseModel):
    action: str
    congestion_pct: Optional[float] = None
    latency_ms: Optional[float] = None
