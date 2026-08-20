from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.alert import AlertResponse

class IncidentTimelineEvent(BaseModel):
    timestamp: str
    event: str
    severity: str
    device_id: Optional[str] = None

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    incident_number: str
    title: str
    severity: str
    status: str
    root_cause_device_id: Optional[str] = None
    root_cause_summary: Optional[str] = None
    confidence_pct: float
    affected_devices_count: int
    affected_links_count: int
    estimated_impact: str
    timeline: List[IncidentTimelineEvent] = []
    recommendations: List[str] = []
    affected_nodes: List[str] = []
    alerts: List[AlertResponse] = []
    created_at: datetime
    resolved_at: Optional[datetime] = None

class IncidentActionRequest(BaseModel):
    status: str
