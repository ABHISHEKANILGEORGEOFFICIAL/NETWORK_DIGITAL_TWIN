from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class DeviceConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    device_id: str
    version: int
    syntax_type: str
    content: str
    diff_summary: str
    created_by: str
    created_at: datetime
    is_active: bool

class DeviceConfigCreate(BaseModel):
    device_id: str
    syntax_type: str = "cisco_ios"
    content: str
    diff_summary: Optional[str] = "Configuration update via NetTwin"

class DeviceConfigRollbackRequest(BaseModel):
    target_version: int
