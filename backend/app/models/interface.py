from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from app.database.session import Base

class Interface(Base):
    __tablename__ = "interfaces"

    id = Column(String(100), primary_key=True, index=True)  # e.g. CORE-RTR-01-Gi0/0
    device_id = Column(String(50), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(50), nullable=False)  # Gi0/0, Te1/0/1, 100GE1/0/1
    description = Column(String(200), default="Uplink Interface")
    mac_address = Column(String(50), nullable=False)
    ip_address = Column(String(50), nullable=True)
    speed_mbps = Column(Integer, default=1000)  # 1000 (1G), 10000 (10G), 40000, 100000
    status = Column(String(50), default="up")  # up, down, degraded, testing
    admin_status = Column(String(50), default="up")  # up, down
    mtu = Column(Integer, default=1500)
    duplex = Column(String(20), default="full")
    vlan = Column(Integer, default=1)
    
    # Real-time Telemetry metrics
    utilization_pct = Column(Float, default=12.5)
    rx_bytes = Column(BigInteger, default=104857600)
    tx_bytes = Column(BigInteger, default=94371840)
    rx_packets = Column(BigInteger, default=125000)
    tx_packets = Column(BigInteger, default=112000)
    rx_errors = Column(Integer, default=0)
    tx_errors = Column(Integer, default=0)
    rx_drops = Column(Integer, default=0)
    tx_drops = Column(Integer, default=0)
    latency_ms = Column(Float, default=3.2)
    packet_loss_pct = Column(Float, default=0.01)
    
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    device = relationship("Device", back_populates="interfaces")
    alerts = relationship("Alert", back_populates="interface", cascade="all, delete-orphan")
