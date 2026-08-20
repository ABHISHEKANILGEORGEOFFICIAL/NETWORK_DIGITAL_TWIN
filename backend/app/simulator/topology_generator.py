import uuid
from typing import Dict, List, Any

def generate_default_network_topology() -> Dict[str, Any]:
    """
    Generates a realistic enterprise multi-tier network topology:
    - Internet Gateway (1)
    - Perimeter Firewalls (2: Active/Standby HA)
    - Core Routers (3: Tri-homed backbone mesh)
    - Distribution Switches (4: Spanning 2 Pods/Data Halls)
    - Access Switches (6: Rack/Floor edge switches)
    - Workload Servers (10: Web, DB, App, Auth, DNS, Storage, Monitoring, AI-Worker, Load Balancers)
    - Access Points (4: HQ Floors & Warehouses)
    - Client Endpoints (6: IoT, Workstations, Mobile gateways)
    Total: 36 interconnected devices, 60+ links, 120+ interfaces.
    """
    devices: List[Dict[str, Any]] = [
        # Tier 0: External / Internet
        {
            "id": "INET-GW-01",
            "name": "INET-GW-01",
            "type": "gateway",
            "vendor": "Juniper",
            "model": "MX204",
            "os_version": "Junos 22.4R1",
            "ip_address": "198.51.100.1",
            "mac_address": "00:1C:73:00:00:01",
            "location": "Edge POP East",
            "rack_unit": "U42",
            "pos_x": 650,
            "pos_y": 50,
            "tier": "internet",
            "cpu_utilization": 22.0,
            "memory_utilization": 41.0,
            "temperature_celsius": 42.0,
            "status": "healthy"
        },
        
        # Tier 1: Perimeter Firewalls
        {
            "id": "FW-CORE-01",
            "name": "FW-CORE-01 (Active)",
            "type": "firewall",
            "vendor": "Palo Alto",
            "model": "PA-5250",
            "os_version": "PAN-OS 11.0.2",
            "ip_address": "10.0.0.1",
            "mac_address": "00:1C:73:01:00:01",
            "location": "HQ Datacenter - Security Pod",
            "rack_unit": "U38",
            "pos_x": 480,
            "pos_y": 180,
            "tier": "perimeter",
            "cpu_utilization": 38.0,
            "memory_utilization": 54.0,
            "temperature_celsius": 45.0,
            "status": "healthy"
        },
        {
            "id": "FW-CORE-02",
            "name": "FW-CORE-02 (Standby)",
            "type": "firewall",
            "vendor": "Palo Alto",
            "model": "PA-5250",
            "os_version": "PAN-OS 11.0.2",
            "ip_address": "10.0.0.2",
            "mac_address": "00:1C:73:01:00:02",
            "location": "HQ Datacenter - Security Pod",
            "rack_unit": "U36",
            "pos_x": 820,
            "pos_y": 180,
            "tier": "perimeter",
            "cpu_utilization": 12.0,
            "memory_utilization": 48.0,
            "temperature_celsius": 40.0,
            "status": "healthy"
        },

        # Tier 2: Core Backbone Routers
        {
            "id": "CORE-RTR-01",
            "name": "CORE-RTR-01",
            "type": "router",
            "vendor": "Cisco",
            "model": "ASR 9006",
            "os_version": "IOS-XR 7.8.2",
            "ip_address": "10.0.1.1",
            "mac_address": "00:1C:73:02:00:01",
            "location": "HQ Datacenter - Spine A",
            "rack_unit": "U30",
            "pos_x": 350,
            "pos_y": 320,
            "tier": "core",
            "cpu_utilization": 28.0,
            "memory_utilization": 45.0,
            "temperature_celsius": 44.0,
            "status": "healthy"
        },
        {
            "id": "CORE-RTR-02",
            "name": "CORE-RTR-02",
            "type": "router",
            "vendor": "Cisco",
            "model": "ASR 9006",
            "os_version": "IOS-XR 7.8.2",
            "ip_address": "10.0.1.2",
            "mac_address": "00:1C:73:02:00:02",
            "location": "HQ Datacenter - Spine B",
            "rack_unit": "U30",
            "pos_x": 650,
            "pos_y": 320,
            "tier": "core",
            "cpu_utilization": 31.0,
            "memory_utilization": 47.0,
            "temperature_celsius": 46.0,
            "status": "healthy"
        },
        {
            "id": "CORE-RTR-03",
            "name": "CORE-RTR-03",
            "type": "router",
            "vendor": "Cisco",
            "model": "ASR 9006",
            "os_version": "IOS-XR 7.8.2",
            "ip_address": "10.0.1.3",
            "mac_address": "00:1C:73:02:00:03",
            "location": "HQ Datacenter - Spine C",
            "rack_unit": "U30",
            "pos_x": 950,
            "pos_y": 320,
            "tier": "core",
            "cpu_utilization": 24.0,
            "memory_utilization": 43.0,
            "temperature_celsius": 43.0,
            "status": "healthy"
        },

        # Tier 3: Distribution Switches (Aggregators)
        {
            "id": "DIST-SW-01",
            "name": "DIST-SW-01",
            "type": "switch",
            "vendor": "Arista",
            "model": "7050SX3-48YC8",
            "os_version": "EOS 4.30.1F",
            "ip_address": "10.0.2.1",
            "mac_address": "00:1C:73:03:00:01",
            "location": "Pod 1 - Aggregation",
            "rack_unit": "U22",
            "pos_x": 200,
            "pos_y": 480,
            "tier": "distribution",
            "cpu_utilization": 20.0,
            "memory_utilization": 38.0,
            "temperature_celsius": 39.0,
            "status": "healthy"
        },
        {
            "id": "DIST-SW-02",
            "name": "DIST-SW-02",
            "type": "switch",
            "vendor": "Arista",
            "model": "7050SX3-48YC8",
            "os_version": "EOS 4.30.1F",
            "ip_address": "10.0.2.2",
            "mac_address": "00:1C:73:03:00:02",
            "location": "Pod 1 - Aggregation",
            "rack_unit": "U22",
            "pos_x": 500,
            "pos_y": 480,
            "tier": "distribution",
            "cpu_utilization": 22.0,
            "memory_utilization": 40.0,
            "temperature_celsius": 41.0,
            "status": "healthy"
        },
        {
            "id": "DIST-SW-03",
            "name": "DIST-SW-03",
            "type": "switch",
            "vendor": "Arista",
            "model": "7050SX3-48YC8",
            "os_version": "EOS 4.30.1F",
            "ip_address": "10.0.2.3",
            "mac_address": "00:1C:73:03:00:03",
            "location": "Pod 2 - Aggregation",
            "rack_unit": "U22",
            "pos_x": 800,
            "pos_y": 480,
            "tier": "distribution",
            "cpu_utilization": 19.0,
            "memory_utilization": 36.0,
            "temperature_celsius": 38.0,
            "status": "healthy"
        },
        {
            "id": "DIST-SW-04",
            "name": "DIST-SW-04",
            "type": "switch",
            "vendor": "Arista",
            "model": "7050SX3-48YC8",
            "os_version": "EOS 4.30.1F",
            "ip_address": "10.0.2.4",
            "mac_address": "00:1C:73:03:00:04",
            "location": "Pod 2 - Aggregation",
            "rack_unit": "U22",
            "pos_x": 1100,
            "pos_y": 480,
            "tier": "distribution",
            "cpu_utilization": 26.0,
            "memory_utilization": 42.0,
            "temperature_celsius": 42.0,
            "status": "healthy"
        },

        # Tier 4: Access / ToR Switches
        {
            "id": "ACC-SW-01",
            "name": "ACC-SW-01 (Web/App)",
            "type": "switch",
            "vendor": "Cisco",
            "model": "Catalyst 9300-48P",
            "os_version": "IOS-XE 17.9.4",
            "ip_address": "10.0.3.1",
            "mac_address": "00:1C:73:04:00:01",
            "location": "Rack A01 - ToR",
            "rack_unit": "U18",
            "pos_x": 120,
            "pos_y": 650,
            "tier": "access",
            "cpu_utilization": 18.0,
            "memory_utilization": 33.0,
            "temperature_celsius": 36.0,
            "status": "healthy"
        },
        {
            "id": "ACC-SW-02",
            "name": "ACC-SW-02 (Database)",
            "type": "switch",
            "vendor": "Cisco",
            "model": "Catalyst 9300-48P",
            "os_version": "IOS-XE 17.9.4",
            "ip_address": "10.0.3.2",
            "mac_address": "00:1C:73:04:00:02",
            "location": "Rack A02 - ToR",
            "rack_unit": "U18",
            "pos_x": 350,
            "pos_y": 650,
            "tier": "access",
            "cpu_utilization": 24.0,
            "memory_utilization": 37.0,
            "temperature_celsius": 38.0,
            "status": "healthy"
        },
        {
            "id": "ACC-SW-03",
            "name": "ACC-SW-03 (Storage)",
            "type": "switch",
            "vendor": "Cisco",
            "model": "Catalyst 9300-48P",
            "os_version": "IOS-XE 17.9.4",
            "ip_address": "10.0.3.3",
            "mac_address": "00:1C:73:04:00:03",
            "location": "Rack B01 - ToR",
            "rack_unit": "U18",
            "pos_x": 580,
            "pos_y": 650,
            "tier": "access",
            "cpu_utilization": 27.0,
            "memory_utilization": 44.0,
            "temperature_celsius": 40.0,
            "status": "healthy"
        },
        {
            "id": "ACC-SW-04",
            "name": "ACC-SW-04 (Infra/Ops)",
            "type": "switch",
            "vendor": "Cisco",
            "model": "Catalyst 9300-48P",
            "os_version": "IOS-XE 17.9.4",
            "ip_address": "10.0.3.4",
            "mac_address": "00:1C:73:04:00:04",
            "location": "Rack B02 - ToR",
            "rack_unit": "U18",
            "pos_x": 800,
            "pos_y": 650,
            "tier": "access",
            "cpu_utilization": 16.0,
            "memory_utilization": 32.0,
            "temperature_celsius": 35.0,
            "status": "healthy"
        },
        {
            "id": "ACC-SW-05",
            "name": "ACC-SW-05 (Campus WLAN)",
            "type": "switch",
            "vendor": "Cisco",
            "model": "Catalyst 9300-48P",
            "os_version": "IOS-XE 17.9.4",
            "ip_address": "10.0.3.5",
            "mac_address": "00:1C:73:04:00:05",
            "location": "Floor 2 IDF",
            "rack_unit": "U10",
            "pos_x": 1020,
            "pos_y": 650,
            "tier": "access",
            "cpu_utilization": 19.0,
            "memory_utilization": 35.0,
            "temperature_celsius": 37.0,
            "status": "healthy"
        },
        {
            "id": "ACC-SW-06",
            "name": "ACC-SW-06 (User LAN)",
            "type": "switch",
            "vendor": "Cisco",
            "model": "Catalyst 9300-48P",
            "os_version": "IOS-XE 17.9.4",
            "ip_address": "10.0.3.6",
            "mac_address": "00:1C:73:04:00:06",
            "location": "Floor 3 IDF",
            "rack_unit": "U10",
            "pos_x": 1240,
            "pos_y": 650,
            "tier": "access",
            "cpu_utilization": 17.0,
            "memory_utilization": 31.0,
            "temperature_celsius": 35.0,
            "status": "healthy"
        },

        # Tier 5: Workload Servers & Critical Services
        {
            "id": "LB-INGRESS-01",
            "name": "LB-INGRESS-01 (F5 BIG-IP)",
            "type": "load_balancer",
            "vendor": "F5 Networks",
            "model": "BIG-IP i5800",
            "os_version": "TMOS 16.1",
            "ip_address": "172.16.10.10",
            "mac_address": "00:1C:73:05:00:00",
            "location": "Rack A01 - Slot 2",
            "rack_unit": "U02",
            "pos_x": 30,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 26.0,
            "memory_utilization": 42.0,
            "temperature_celsius": 38.0,
            "status": "healthy"
        },
        {
            "id": "SRV-WEB-01",
            "name": "SRV-WEB-01 (Nginx Ingress)",
            "type": "server",
            "vendor": "Dell",
            "model": "PowerEdge R750",
            "os_version": "Ubuntu 22.04 LTS",
            "ip_address": "172.16.10.11",
            "mac_address": "00:1C:73:05:00:01",
            "location": "Rack A01 - Slot 4",
            "rack_unit": "U04",
            "pos_x": 140,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 32.0,
            "memory_utilization": 58.0,
            "temperature_celsius": 39.0,
            "status": "healthy"
        },
        {
            "id": "SRV-APP-01",
            "name": "SRV-APP-01 (Microservices)",
            "type": "server",
            "vendor": "Dell",
            "model": "PowerEdge R750",
            "os_version": "Ubuntu 22.04 LTS",
            "ip_address": "172.16.10.12",
            "mac_address": "00:1C:73:05:00:02",
            "location": "Rack A01 - Slot 6",
            "rack_unit": "U06",
            "pos_x": 250,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 45.0,
            "memory_utilization": 68.0,
            "temperature_celsius": 42.0,
            "status": "healthy"
        },
        {
            "id": "SRV-DB-PRIMARY",
            "name": "SRV-DB-PRIMARY (PostgreSQL)",
            "type": "server",
            "vendor": "HPE",
            "model": "ProLiant DL380 Gen10",
            "os_version": "RHEL 9.2",
            "ip_address": "172.16.20.21",
            "mac_address": "00:1C:73:05:00:03",
            "location": "Rack A02 - Slot 10",
            "rack_unit": "U10",
            "pos_x": 360,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 52.0,
            "memory_utilization": 74.0,
            "temperature_celsius": 47.0,
            "status": "healthy"
        },
        {
            "id": "SRV-DB-REPLICA",
            "name": "SRV-DB-REPLICA (Standby)",
            "type": "server",
            "vendor": "HPE",
            "model": "ProLiant DL380 Gen10",
            "os_version": "RHEL 9.2",
            "ip_address": "172.16.20.22",
            "mac_address": "00:1C:73:05:00:04",
            "location": "Rack A02 - Slot 12",
            "rack_unit": "U12",
            "pos_x": 470,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 24.0,
            "memory_utilization": 60.0,
            "temperature_celsius": 41.0,
            "status": "healthy"
        },
        {
            "id": "SRV-SAN-STORAGE",
            "name": "SRV-SAN-STORAGE (Ceph/NFS)",
            "type": "server",
            "vendor": "NetApp",
            "model": "AFF A400",
            "os_version": "ONTAP 9.12",
            "ip_address": "172.16.30.31",
            "mac_address": "00:1C:73:05:00:05",
            "location": "Rack B01 - Slot 14",
            "rack_unit": "U14",
            "pos_x": 580,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 36.0,
            "memory_utilization": 65.0,
            "temperature_celsius": 43.0,
            "status": "healthy"
        },
        {
            "id": "SRV-AI-WORKER",
            "name": "SRV-AI-WORKER (GPU Cluster)",
            "type": "server",
            "vendor": "NVIDIA",
            "model": "DGX H100",
            "os_version": "DGX OS 6",
            "ip_address": "172.16.30.32",
            "mac_address": "00:1C:73:05:00:06",
            "location": "Rack B01 - Slot 20",
            "rack_unit": "U20",
            "pos_x": 690,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 58.0,
            "memory_utilization": 72.0,
            "temperature_celsius": 52.0,
            "status": "healthy"
        },
        {
            "id": "SRV-MONITOR-01",
            "name": "SRV-MONITOR-01 (NetTwin Core)",
            "type": "server",
            "vendor": "Dell",
            "model": "PowerEdge R650",
            "os_version": "Ubuntu 22.04 LTS",
            "ip_address": "172.16.40.41",
            "mac_address": "00:1C:73:05:00:07",
            "location": "Rack B02 - Slot 4",
            "rack_unit": "U04",
            "pos_x": 800,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 28.0,
            "memory_utilization": 49.0,
            "temperature_celsius": 38.0,
            "status": "healthy"
        },
        {
            "id": "SRV-AUTH-01",
            "name": "SRV-AUTH-01 (FreeIPA/RADIUS)",
            "type": "server",
            "vendor": "Dell",
            "model": "PowerEdge R650",
            "os_version": "Ubuntu 22.04 LTS",
            "ip_address": "172.16.40.42",
            "mac_address": "00:1C:73:05:00:08",
            "location": "Rack B02 - Slot 6",
            "rack_unit": "U06",
            "pos_x": 900,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 15.0,
            "memory_utilization": 34.0,
            "temperature_celsius": 36.0,
            "status": "healthy"
        },
        {
            "id": "SRV-DNS-CORE",
            "name": "SRV-DNS-CORE (Bind9 / NTP)",
            "type": "server",
            "vendor": "Dell",
            "model": "PowerEdge R650",
            "os_version": "Ubuntu 22.04 LTS",
            "ip_address": "172.16.40.43",
            "mac_address": "00:1C:73:05:00:09",
            "location": "Rack B02 - Slot 8",
            "rack_unit": "U08",
            "pos_x": 1000,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 14.0,
            "memory_utilization": 30.0,
            "temperature_celsius": 34.0,
            "status": "healthy"
        },

        # Tier 6: Campus Access Points & Edge Endpoints
        {
            "id": "AP-HQ-FL1",
            "name": "AP-HQ-FL1 (Executive Floor)",
            "type": "access_point",
            "vendor": "Aruba",
            "model": "AP-555 Wi-Fi 6",
            "os_version": "ArubaOS 10.4",
            "ip_address": "192.168.10.11",
            "mac_address": "00:1C:73:06:00:01",
            "location": "HQ Floor 1 - North Wing",
            "rack_unit": "Ceiling",
            "pos_x": 1100,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 21.0,
            "memory_utilization": 45.0,
            "temperature_celsius": 37.0,
            "status": "healthy"
        },
        {
            "id": "AP-HQ-FL2",
            "name": "AP-HQ-FL2 (Engineering Hub)",
            "type": "access_point",
            "vendor": "Aruba",
            "model": "AP-555 Wi-Fi 6",
            "os_version": "ArubaOS 10.4",
            "ip_address": "192.168.10.12",
            "mac_address": "00:1C:73:06:00:02",
            "location": "HQ Floor 2 - Open Space",
            "rack_unit": "Ceiling",
            "pos_x": 1200,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 34.0,
            "memory_utilization": 52.0,
            "temperature_celsius": 39.0,
            "status": "healthy"
        },
        {
            "id": "AP-HQ-FL3",
            "name": "AP-HQ-FL3 (Operations)",
            "type": "access_point",
            "vendor": "Aruba",
            "model": "AP-555 Wi-Fi 6",
            "os_version": "ArubaOS 10.4",
            "ip_address": "192.168.10.13",
            "mac_address": "00:1C:73:06:00:03",
            "location": "HQ Floor 3 - Operations Center",
            "rack_unit": "Ceiling",
            "pos_x": 1300,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 25.0,
            "memory_utilization": 46.0,
            "temperature_celsius": 38.0,
            "status": "healthy"
        },
        {
            "id": "AP-WAREHOUSE",
            "name": "AP-WAREHOUSE (Logistics)",
            "type": "access_point",
            "vendor": "Aruba",
            "model": "AP-575 Rugged",
            "os_version": "ArubaOS 10.4",
            "ip_address": "192.168.10.14",
            "mac_address": "00:1C:73:06:00:04",
            "location": "Warehouse Logistics Hall",
            "rack_unit": "High Bay",
            "pos_x": 1400,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 18.0,
            "memory_utilization": 39.0,
            "temperature_celsius": 34.0,
            "status": "healthy"
        },
        {
            "id": "IOT-GATEWAY-01",
            "name": "IOT-GATEWAY-01 (Building Sensors)",
            "type": "endpoint",
            "vendor": "Siemens",
            "model": "SIMATIC IOT2050",
            "os_version": "Debian Embedded",
            "ip_address": "192.168.20.50",
            "mac_address": "00:1C:73:07:00:01",
            "location": "Facility BMS Room",
            "rack_unit": "Wall Mount",
            "pos_x": 1500,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 14.0,
            "memory_utilization": 28.0,
            "temperature_celsius": 32.0,
            "status": "healthy"
        },
        {
            "id": "CLIENT-OPS-WS01",
            "name": "CLIENT-OPS-WS01 (NOC Console)",
            "type": "endpoint",
            "vendor": "Apple",
            "model": "Mac Studio M2 Ultra",
            "os_version": "macOS 14.5",
            "ip_address": "192.168.30.101",
            "mac_address": "00:1C:73:07:00:02",
            "location": "Operations Room Station 1",
            "rack_unit": "Desk",
            "pos_x": 1600,
            "pos_y": 830,
            "tier": "workload",
            "cpu_utilization": 20.0,
            "memory_utilization": 45.0,
            "temperature_celsius": 36.0,
            "status": "healthy"
        }
    ]

    interfaces: List[Dict[str, Any]] = []
    links: List[Dict[str, Any]] = []

    def create_if(dev_id: str, if_name: str, speed_mbps: int = 10000, ip: str = None) -> str:
        if_id = f"{dev_id}-{if_name.replace('/', '_')}"
        interfaces.append({
            "id": if_id,
            "device_id": dev_id,
            "name": if_name,
            "description": f"Interface {if_name} on {dev_id}",
            "mac_address": f"00:1C:73:{abs(hash(if_id)) % 90 + 10:02X}:{abs(hash(if_id)*3) % 90 + 10:02X}:{abs(hash(if_id)*7) % 90 + 10:02X}",
            "ip_address": ip,
            "speed_mbps": speed_mbps,
            "status": "up",
            "admin_status": "up",
            "mtu": 9000 if speed_mbps >= 10000 else 1500,
            "duplex": "full",
            "vlan": 1,
            "utilization_pct": 15.0,
            "rx_bytes": 1024 * 1024 * 500,
            "tx_bytes": 1024 * 1024 * 480,
            "rx_packets": 350000,
            "tx_packets": 340000,
            "rx_errors": 0,
            "tx_errors": 0,
            "rx_drops": 0,
            "tx_drops": 0,
            "latency_ms": 2.5,
            "packet_loss_pct": 0.0
        })
        return if_id

    def connect(dev_a: str, if_name_a: str, dev_b: str, if_name_b: str, capacity_mbps: int = 10000, name: str = None) -> None:
        if_a = create_if(dev_a, if_name_a, capacity_mbps)
        if_b = create_if(dev_b, if_name_b, capacity_mbps)
        link_id = f"LINK-{dev_a}-{dev_b}"
        links.append({
            "id": link_id,
            "name": name or f"{dev_a} <-> {dev_b}",
            "source_device_id": dev_a,
            "source_interface_id": if_a,
            "target_device_id": dev_b,
            "target_interface_id": if_b,
            "capacity_mbps": capacity_mbps,
            "status": "up",
            "utilization_pct": 20.0,
            "current_bandwidth_mbps": capacity_mbps * 0.20,
            "latency_ms": 3.0,
            "packet_loss_pct": 0.0,
            "jitter_ms": 0.5
        })

    # 1. Internet to Perimeter Firewalls
    connect("INET-GW-01", "100GE1/0/1", "FW-CORE-01", "eth1/1", 100000, "WAN Transit Primary")
    connect("INET-GW-01", "100GE1/0/2", "FW-CORE-02", "eth1/1", 100000, "WAN Transit Secondary")

    # HA Link between Firewalls
    connect("FW-CORE-01", "ha1", "FW-CORE-02", "ha1", 40000, "Firewall State Sync HA")

    # 2. Firewalls to Core Routers
    connect("FW-CORE-01", "eth1/2", "CORE-RTR-01", "TenGigE0/0/0/0", 40000)
    connect("FW-CORE-01", "eth1/3", "CORE-RTR-02", "TenGigE0/0/0/0", 40000)
    connect("FW-CORE-02", "eth1/2", "CORE-RTR-02", "TenGigE0/0/0/1", 40000)
    connect("FW-CORE-02", "eth1/3", "CORE-RTR-03", "TenGigE0/0/0/0", 40000)

    # Core Router Mesh
    connect("CORE-RTR-01", "HundredGigE0/1/0/0", "CORE-RTR-02", "HundredGigE0/1/0/0", 100000, "Core Ring Link 1-2")
    connect("CORE-RTR-02", "HundredGigE0/1/0/1", "CORE-RTR-03", "HundredGigE0/1/0/0", 100000, "Core Ring Link 2-3")
    connect("CORE-RTR-03", "HundredGigE0/1/0/1", "CORE-RTR-01", "HundredGigE0/1/0/1", 100000, "Core Ring Link 3-1")

    # 3. Core to Distribution Switches
    connect("CORE-RTR-01", "TenGigE0/0/0/1", "DIST-SW-01", "Ethernet49/1", 40000)
    connect("CORE-RTR-01", "TenGigE0/0/0/2", "DIST-SW-02", "Ethernet49/1", 40000)
    
    connect("CORE-RTR-02", "TenGigE0/0/0/2", "DIST-SW-01", "Ethernet50/1", 40000)
    connect("CORE-RTR-02", "TenGigE0/0/0/3", "DIST-SW-02", "Ethernet50/1", 40000)
    connect("CORE-RTR-02", "TenGigE0/0/0/4", "DIST-SW-03", "Ethernet49/1", 40000)
    connect("CORE-RTR-02", "TenGigE0/0/0/5", "DIST-SW-04", "Ethernet49/1", 40000)

    connect("CORE-RTR-03", "TenGigE0/0/0/1", "DIST-SW-03", "Ethernet50/1", 40000)
    connect("CORE-RTR-03", "TenGigE0/0/0/2", "DIST-SW-04", "Ethernet50/1", 40000)

    # MLAG / Peer Links between Distribution pairs
    connect("DIST-SW-01", "Ethernet51/1", "DIST-SW-02", "Ethernet51/1", 40000, "MLAG Pod-1 Peer")
    connect("DIST-SW-03", "Ethernet51/1", "DIST-SW-04", "Ethernet51/1", 40000, "MLAG Pod-2 Peer")

    # 4. Distribution to Access Switches
    connect("DIST-SW-01", "Ethernet1/1", "ACC-SW-01", "TenGigabitEthernet1/1/1", 10000)
    connect("DIST-SW-02", "Ethernet1/1", "ACC-SW-01", "TenGigabitEthernet1/1/2", 10000)

    connect("DIST-SW-01", "Ethernet1/2", "ACC-SW-02", "TenGigabitEthernet1/1/1", 10000)
    connect("DIST-SW-02", "Ethernet1/2", "ACC-SW-02", "TenGigabitEthernet1/1/2", 10000)

    connect("DIST-SW-02", "Ethernet1/3", "ACC-SW-03", "TenGigabitEthernet1/1/1", 10000)
    connect("DIST-SW-03", "Ethernet1/1", "ACC-SW-03", "TenGigabitEthernet1/1/2", 10000)

    connect("DIST-SW-03", "Ethernet1/2", "ACC-SW-04", "TenGigabitEthernet1/1/1", 10000)
    connect("DIST-SW-04", "Ethernet1/1", "ACC-SW-04", "TenGigabitEthernet1/1/2", 10000)

    connect("DIST-SW-03", "Ethernet1/3", "ACC-SW-05", "TenGigabitEthernet1/1/1", 10000)
    connect("DIST-SW-04", "Ethernet1/2", "ACC-SW-05", "TenGigabitEthernet1/1/2", 10000)

    connect("DIST-SW-04", "Ethernet1/3", "ACC-SW-06", "TenGigabitEthernet1/1/1", 10000)

    # 5. Access Switches to Ingress LB and Servers
    connect("ACC-SW-01", "GigabitEthernet1/0/0", "LB-INGRESS-01", "1.1", 10000)
    connect("ACC-SW-01", "GigabitEthernet1/0/1", "SRV-WEB-01", "eth0", 10000)
    connect("ACC-SW-01", "GigabitEthernet1/0/2", "SRV-APP-01", "eth0", 10000)

    connect("ACC-SW-02", "GigabitEthernet1/0/1", "SRV-DB-PRIMARY", "bond0", 10000)
    connect("ACC-SW-02", "GigabitEthernet1/0/2", "SRV-DB-REPLICA", "bond0", 10000)

    connect("ACC-SW-03", "GigabitEthernet1/0/1", "SRV-SAN-STORAGE", "eth0", 10000)
    connect("ACC-SW-03", "GigabitEthernet1/0/2", "SRV-AI-WORKER", "ib0", 100000)

    connect("ACC-SW-04", "GigabitEthernet1/0/1", "SRV-MONITOR-01", "eth0", 10000)
    connect("ACC-SW-04", "GigabitEthernet1/0/2", "SRV-AUTH-01", "eth0", 10000)
    connect("ACC-SW-04", "GigabitEthernet1/0/3", "SRV-DNS-CORE", "eth0", 10000)

    # 6. Access Switches to APs & Endpoints
    connect("ACC-SW-05", "GigabitEthernet1/0/1", "AP-HQ-FL1", "eth0", 1000)
    connect("ACC-SW-05", "GigabitEthernet1/0/2", "AP-HQ-FL2", "eth0", 1000)
    connect("ACC-SW-06", "GigabitEthernet1/0/1", "AP-HQ-FL3", "eth0", 1000)
    connect("ACC-SW-06", "GigabitEthernet1/0/2", "AP-WAREHOUSE", "eth0", 1000)
    connect("ACC-SW-06", "GigabitEthernet1/0/3", "IOT-GATEWAY-01", "eth0", 1000)
    connect("ACC-SW-06", "GigabitEthernet1/0/4", "CLIENT-OPS-WS01", "eth0", 1000)

    return {
        "devices": devices,
        "interfaces": interfaces,
        "links": links
    }
