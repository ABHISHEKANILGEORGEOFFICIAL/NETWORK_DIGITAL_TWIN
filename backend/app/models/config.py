from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base

class DeviceConfig(Base):
    __tablename__ = "device_configs"

    id = Column(String(50), primary_key=True, index=True)
    device_id = Column(String(50), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    version = Column(Integer, default=1)
    syntax_type = Column(String(50), default="cisco_ios")  # cisco_ios, junos, arista_eos
    content = Column(Text, nullable=False)
    diff_summary = Column(String(255), default="Initial baseline configuration")
    created_by = Column(String(100), default="admin@nettwin.io")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

    device = relationship("Device", back_populates="configs")
