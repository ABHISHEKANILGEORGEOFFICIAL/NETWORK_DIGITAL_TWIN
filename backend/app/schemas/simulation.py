from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SimulationScenarioRequest(BaseModel):
    scenario: str
    target_device_id: Optional[str] = None
    target_link_id: Optional[str] = None
    target_interface_id: Optional[str] = None
    severity: Optional[str] = "high"
    duration_seconds: Optional[int] = 60
    custom_params: Optional[Dict[str, Any]] = None

class SimulationStatusResponse(BaseModel):
    current_scenario: str
    is_running: bool
    is_paused: bool
    active_injections: List[Dict[str, Any]]
    simulated_time_seconds: int
    events_generated: int
    devices_affected: int
    alerts_generated: int
    last_sync_timestamp: datetime
    twin_sync_rate_pct: float
    twin_accuracy_pct: float

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    title: str
    message: str
    severity: str
    is_read: bool
    created_at: datetime
