from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(50), primary_key=True, index=True)  # e.g. INC-1024
    incident_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    severity = Column(String(20), default="critical")  # info, warning, high, critical
    status = Column(String(30), default="investigating")  # open, investigating, mitigating, resolved
    
    # Root Cause Analysis
    root_cause_device_id = Column(String(50), ForeignKey("devices.id", ondelete="SET NULL"), nullable=True)
    root_cause_summary = Column(Text, nullable=True)
    confidence_pct = Column(Float, default=90.0)
    
    # Impact metrics
    affected_devices_count = Column(Integer, default=0)
    affected_links_count = Column(Integer, default=0)
    estimated_impact = Column(String(50), default="High")  # Low, Medium, High, Critical
    
    # JSON-encoded payloads for rich timelines & recommendations
    timeline_json = Column(Text, default="[]")
    recommendations_json = Column(Text, default="[]")
    affected_nodes_json = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    resolved_at = Column(DateTime, nullable=True)

    alerts = relationship("Alert", back_populates="incident")
