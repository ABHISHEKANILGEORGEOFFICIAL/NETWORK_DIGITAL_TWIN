from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from app.database.session import Base

class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(50), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    cpu = Column(Float, nullable=False)
    memory = Column(Float, nullable=False)
    bandwidth_in_mbps = Column(Float, default=0.0)
    bandwidth_out_mbps = Column(Float, default=0.0)
    latency_ms = Column(Float, default=5.0)
    packet_loss_pct = Column(Float, default=0.0)
    temperature_celsius = Column(Float, default=40.0)
    status = Column(String(50), default="healthy")
