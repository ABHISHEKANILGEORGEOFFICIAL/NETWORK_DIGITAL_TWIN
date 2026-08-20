from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True, index=True)  # e.g. ALT-9821
    device_id = Column(String(50), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    interface_id = Column(String(100), ForeignKey("interfaces.id", ondelete="SET NULL"), nullable=True)
    link_id = Column(String(100), nullable=True)
    incident_id = Column(String(50), ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True, index=True)
    
    severity = Column(String(20), nullable=False)  # info, warning, high, critical
    metric_name = Column(String(50), nullable=False)  # cpu, memory, latency, packet_loss, bandwidth, link_state, device_reachability
    metric_value = Column(Float, nullable=True)
    threshold_value = Column(Float, nullable=True)
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    suggested_action = Column(Text, nullable=True)
    
    status = Column(String(30), default="new")  # new, acknowledged, investigating, resolved
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    resolved_at = Column(DateTime, nullable=True)

    device = relationship("Device", back_populates="alerts")
    interface = relationship("Interface", back_populates="alerts")
    incident = relationship("Incident", back_populates="alerts")
