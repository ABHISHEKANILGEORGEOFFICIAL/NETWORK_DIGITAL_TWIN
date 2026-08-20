from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.device import DeviceResponse, DeviceDetailResponse, DeviceActionRequest
from app.simulator.network_simulator import simulator
from app.models.config import DeviceConfig

router = APIRouter(prefix="/devices", tags=["Devices"])

@router.get("", response_model=List[DeviceResponse])
def get_devices(
    type: Optional[str] = Query(None, description="Filter by device type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    tier: Optional[str] = Query(None, description="Filter by network tier"),
    search: Optional[str] = Query(None, description="Search term for name or IP")
):
    results = list(simulator.devices.values())

    if type:
        results = [d for d in results if d.get("type", "").lower() == type.lower()]
    if status:
        results = [d for d in results if d.get("status", "").lower() == status.lower()]
    if tier:
        results = [d for d in results if d.get("tier", "").lower() == tier.lower()]
    if search:
        s = search.lower()
        results = [
            d for d in results 
            if s in d.get("name", "").lower() or s in d.get("ip_address", "").lower() or s in d.get("id", "").lower()
        ]

    # Augment with interface counts and active alert counts
    augmented = []
    for d in results:
        d_copy = dict(d)
        d_copy["interfaces_count"] = sum(1 for iface in simulator.interfaces.values() if iface["device_id"] == d["id"])
        d_copy["active_alerts_count"] = sum(1 for a in simulator.alerts if a["device_id"] == d["id"])
        augmented.append(d_copy)

    return augmented

@router.get("/{device_id}", response_model=DeviceDetailResponse)
def get_device_detail(device_id: str, db: Session = Depends(get_db)):
    dev = simulator.devices.get(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found in Digital Twin")

    # Interfaces for this device
    dev_interfaces = [
        iface for iface in simulator.interfaces.values() 
        if iface["device_id"] == device_id
    ]

    # Neighbor devices connected via links
    neighbor_ids = set()
    for link in simulator.links.values():
        if link["source_device_id"] == device_id:
            neighbor_ids.add(link["target_device_id"])
        elif link["target_device_id"] == device_id:
            neighbor_ids.add(link["source_device_id"])

    # Active config snippet
    config_record = db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id, DeviceConfig.is_active == True).first()
    config_snippet = config_record.content if config_record else "! Baseline configuration"

    # Recent events
    recent_events = [
        {"timestamp": "02m ago", "type": "heartbeat", "message": "Telemetry poll telemetry stream OK"},
        {"timestamp": "14m ago", "type": "bgp", "message": "BGP peer established with CORE-RTR-02"},
        {"timestamp": "1h ago", "type": "config", "message": "Configuration sync validated"}
    ]

    dev_detail = dict(dev)
    dev_detail["interfaces"] = dev_interfaces
    dev_detail["interfaces_count"] = len(dev_interfaces)
    dev_detail["active_alerts_count"] = sum(1 for a in simulator.alerts if a["device_id"] == device_id)
    dev_detail["neighbors"] = list(neighbor_ids)
    dev_detail["recent_events"] = recent_events
    dev_detail["active_config_snippet"] = config_snippet

    return dev_detail

@router.post("/{device_id}/action")
def execute_device_action(device_id: str, req: DeviceActionRequest):
    dev = simulator.devices.get(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found")

    action = req.action.lower()
    if action == "restart":
        res = simulator.restart_device(device_id)
        return res
    elif action == "shutdown":
        dev["status"] = "offline"
        dev["cpu_utilization"] = 0.0
        return {"success": True, "message": f"Device {dev['name']} shut down in Digital Twin."}
    elif action == "ping":
        target = req.target_ip or "8.8.8.8"
        return {
            "success": True,
            "action": "ping",
            "target": target,
            "output": f"PING {target} (56 data bytes)\n64 bytes from {target}: icmp_seq=1 ttl=58 time=3.42 ms\n64 bytes from {target}: icmp_seq=2 ttl=58 time=3.18 ms\n64 bytes from {target}: icmp_seq=3 ttl=58 time=3.55 ms\n--- {target} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, rtt min/avg/max = 3.18/3.38/3.55 ms"
        }
    elif action == "traceroute":
        target = req.target_ip or "198.51.100.1"
        return {
            "success": True,
            "action": "traceroute",
            "target": target,
            "output": f"traceroute to {target}, 30 hops max, 60 byte packets\n 1  10.0.1.1 (CORE-RTR-01)  0.842 ms  0.791 ms\n 2  10.0.0.1 (FW-CORE-01)   1.412 ms  1.385 ms\n 3  198.51.100.1 (INET-GW-01) 3.120 ms  3.045 ms"
        }
    elif action == "run_diagnostics":
        return {
            "success": True,
            "action": "run_diagnostics",
            "results": {
                "hardware_health": "PASSED",
                "fan_speed_rpm": 4200,
                "power_supply_1": "OK",
                "power_supply_2": "OK",
                "optical_transceivers": "ALL WITHIN SLA",
                "control_plane_latency_ms": 0.42
            }
        }
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported action '{req.action}'")
