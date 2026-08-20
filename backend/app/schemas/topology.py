from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.device import DeviceResponse
from app.schemas.link import LinkResponse

class TopologyNode(BaseModel):
    id: str
    label: str
    type: str
    device_type: str
    status: str
    ip_address: str
    cpu: float
    memory: float
    health_score: float
    pos_x: float
    pos_y: float
    tier: str
    data: Dict[str, Any]

class TopologyEdge(BaseModel):
    id: str
    source: str
    target: str
    source_interface: str
    target_interface: str
    status: str
    utilization_pct: float
    capacity_mbps: int
    latency_ms: float
    packet_loss_pct: float
    data: Dict[str, Any]

class TopologyResponse(BaseModel):
    nodes: List[TopologyNode]
    edges: List[TopologyEdge]
    devices_summary: Dict[str, int]
    tiers: List[str]
