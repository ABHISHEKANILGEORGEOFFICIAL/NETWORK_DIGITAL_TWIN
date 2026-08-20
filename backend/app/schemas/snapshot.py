from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SnapshotCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None

class SnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str] = None
    created_by: str
    device_count: int
    healthy_count: int
    warning_count: int
    critical_count: int
    health_score: float
    created_at: datetime

class SnapshotDetailResponse(SnapshotResponse):
    state: Dict[str, Any]

class SnapshotComparisonResponse(BaseModel):
    snapshot_a_id: str
    snapshot_a_name: str
    snapshot_b_id: str
    snapshot_b_name: str
    health_score_diff: float
    devices_changed: int
    links_changed: int
    alerts_diff_count: int
    details: List[Dict[str, Any]]
