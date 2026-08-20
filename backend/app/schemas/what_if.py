from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class WhatIfRequest(BaseModel):
    failure_type: str  # device_outage, link_cut, bandwidth_surge, high_loss, interface_down
    target_id: str  # device ID or link ID
    secondary_target_id: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class WhatIfHop(BaseModel):
    device_id: str
    device_name: str
    interface: str
    latency_ms: float
    status: str

class WhatIfReroutePath(BaseModel):
    source: str
    destination: str
    original_path: List[str]
    new_path: List[str]
    original_latency_ms: float
    new_latency_ms: float
    reroute_possible: bool

class WhatIfResponse(BaseModel):
    scenario: str
    target_id: str
    estimated_impact: str  # Low, Medium, High, Critical
    affected_devices_count: int
    affected_devices: List[str]
    affected_links_count: int
    affected_links: List[str]
    isolated_nodes: List[str]
    congested_links: List[str]
    estimated_recovery_time_seconds: int
    health_score_before: float
    health_score_after: float
    traffic_redistribution_summary: str
    rerouted_paths: List[WhatIfReroutePath]
    suggested_mitigations: List[str]
