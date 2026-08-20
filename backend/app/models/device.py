from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(String(50), primary_key=True, index=True)  # e.g. CORE-RTR-01
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # router, switch, firewall, server, access_point, load_balancer, endpoint
    vendor = Column(String(100), default="Cisco")
    model = Column(String(100), default="Catalyst 9300")
    os_version = Column(String(100), default="IOS-XE 17.9.4")
    ip_address = Column(String(50), nullable=False, index=True)
    mac_address = Column(String(50), nullable=False)
    location = Column(String(100), default="Datacenter Core Rack 1")
    rack_unit = Column(String(50), default="U24")
    
    # Real-time state
    status = Column(String(50), default="healthy")  # healthy, warning, critical, offline, maintenance
    cpu_utilization = Column(Float, default=15.0)
    memory_utilization = Column(Float, default=35.0)
    temperature_celsius = Column(Float, default=38.5)
    uptime_seconds = Column(Integer, default=864000)
    health_score = Column(Float, default=98.0)
    
    # Topology layout coordinates (for frontend canvas consistency)
    pos_x = Column(Float, default=0.0)
    pos_y = Column(Float, default=0.0)
    tier = Column(String(50), default="core")  # internet, perimeter, core, distribution, access, workload
    
    last_seen_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    interfaces = relationship("Interface", back_populates="device", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="device", cascade="all, delete-orphan")
    configs = relationship("DeviceConfig", back_populates="device", cascade="all, delete-orphan")
