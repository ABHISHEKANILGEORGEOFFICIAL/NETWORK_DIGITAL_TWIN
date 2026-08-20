from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from app.database.session import Base

class Link(Base):
    __tablename__ = "links"

    id = Column(String(100), primary_key=True, index=True)  # e.g. LINK-CORE01-SW01
    name = Column(String(150), nullable=False)
    source_device_id = Column(String(50), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    source_interface_id = Column(String(100), ForeignKey("interfaces.id", ondelete="CASCADE"), nullable=False)
    target_device_id = Column(String(50), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    target_interface_id = Column(String(100), ForeignKey("interfaces.id", ondelete="CASCADE"), nullable=False)
    
    capacity_mbps = Column(Integer, default=10000)  # 10 Gbps default for backbone
    status = Column(String(50), default="up")  # up, down, congested, degraded
    
    # Real-time Telemetry
    utilization_pct = Column(Float, default=24.5)
    current_bandwidth_mbps = Column(Float, default=2450.0)
    latency_ms = Column(Float, default=4.1)
    packet_loss_pct = Column(Float, default=0.01)
    jitter_ms = Column(Float, default=0.8)
    
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))
