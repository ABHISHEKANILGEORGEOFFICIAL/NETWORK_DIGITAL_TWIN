import uuid
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.core.logging_config import logger
from app.models.user import User
from app.models.config import DeviceConfig
from app.simulator.network_simulator import simulator

DEFAULT_USERS = [
    {
        "id": "usr-admin-01",
        "email": "admin@nettwin.io",
        "password": "admin123",
        "full_name": "Abhishek Anil George (Lead Architect)",
        "role": "admin"
    },
    {
        "id": "usr-eng-01",
        "email": "engineer@nettwin.io",
        "password": "engineer123",
        "full_name": "Elena Rostova (Senior NetOps Engineer)",
        "role": "engineer"
    },
    {
        "id": "usr-view-01",
        "email": "viewer@nettwin.io",
        "password": "viewer123",
        "full_name": "David Chen (SOC Analyst / Viewer)",
        "role": "viewer"
    }
]

SAMPLE_CISCO_CONFIG = """!
version 17.9
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
hostname {hostname}
!
boot-start-marker
boot-end-marker
!
vrf definition Mgmt-vrf
 address-family ipv4
 exit-address-family
!
no aaa new-model
!
ip routing
!
interface Loopback0
 ip address 10.255.0.1 255.255.255.255
!
interface GigabitEthernet0/0
 description MANAGEMENT_OUT_OF_BAND
 vrf forwarding Mgmt-vrf
 ip address 192.168.100.1 255.255.255.0
 negotiation auto
 no shutdown
!
interface TenGigabitEthernet0/0/0/0
 description UPLINK_PRIMARY_TRANSIT
 ip address {ip_address} 255.255.255.252
 mtu 9000
 no shutdown
!
router bgp 65001
 bgp router-id {ip_address}
 bgp log-neighbor-changes
 neighbor 10.0.1.2 remote-as 65001
 neighbor 10.0.1.2 update-source Loopback0
!
line con 0
 stopbits 2
line vty 0 4
 transport input ssh
!
end
"""

def seed_database(db: Session):
    # 1. Seed Default Users
    for u in DEFAULT_USERS:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            user_obj = User(
                id=u["id"],
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
                is_active=True
            )
            db.add(user_obj)
            logger.info(f"Seeded default user: {u['email']} ({u['role']})")

    # 2. Seed Baseline Device Configurations
    if not simulator.devices:
        simulator.initialize_topology()

    for dev_id, dev in simulator.devices.items():
        existing_cfg = db.query(DeviceConfig).filter(DeviceConfig.device_id == dev_id).first()
        if not existing_cfg:
            cfg_text = SAMPLE_CISCO_CONFIG.format(
                hostname=dev["name"],
                ip_address=dev["ip_address"]
            )
            cfg_obj = DeviceConfig(
                id=f"CFG-{dev_id}-V1",
                device_id=dev_id,
                version=1,
                syntax_type="cisco_ios" if "cisco" in dev.get("vendor", "").lower() else "junos",
                content=cfg_text,
                diff_summary="Baseline production configuration import",
                created_by="admin@nettwin.io",
                is_active=True
            )
            db.add(cfg_obj)

    db.commit()
    logger.info("Database seeding completed successfully.")
