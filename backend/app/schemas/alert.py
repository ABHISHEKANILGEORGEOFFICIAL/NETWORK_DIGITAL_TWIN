from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    device_id: str
    device_name: Optional[str] = None
    interface_id: Optional[str] = None
    link_id: Optional[str] = None
    incident_id: Optional[str] = None
    severity: str
    metric_name: str
    metric_value: Optional[float] = None
    threshold_value: Optional[float] = None
    title: str
    description: str
    suggested_action: Optional[str] = None
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

class AlertActionRequest(BaseModel):
    status: str
