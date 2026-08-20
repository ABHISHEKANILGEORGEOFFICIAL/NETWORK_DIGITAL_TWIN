from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean
from app.database.session import Base

class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(String(50), primary_key=True, index=True)
    scenario_type = Column(String(100), nullable=False)  # normal, router_failure, switch_failure, link_failure, congestion, high_cpu, packet_loss, latency_spike, custom
    target_device_id = Column(String(50), nullable=True)
    target_interface_id = Column(String(100), nullable=True)
    target_link_id = Column(String(100), nullable=True)
    
    status = Column(String(30), default="running")  # running, paused, stopped, completed
    severity = Column(String(20), default="high")
    duration_seconds = Column(Integer, default=60)
    events_generated = Column(Integer, default=0)
    params_json = Column(Text, default="{}")
    
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(50), primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # alert, incident, simulation, prediction, system
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="info")  # info, warning, high, critical
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
