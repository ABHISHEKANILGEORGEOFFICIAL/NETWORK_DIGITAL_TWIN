from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, Text
from app.database.session import Base

class NetworkSnapshot(Base):
    __tablename__ = "network_snapshots"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(String(100), default="admin@nettwin.io")
    
    # Statistical summary at snapshot time
    device_count = Column(Integer, default=0)
    healthy_count = Column(Integer, default=0)
    warning_count = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    health_score = Column(Float, default=100.0)
    
    # Full serialized JSON twin state
    state_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
