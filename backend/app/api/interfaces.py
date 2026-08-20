from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.interface import InterfaceResponse, InterfaceActionRequest
from app.simulator.network_simulator import simulator

router = APIRouter(prefix="/interfaces", tags=["Interfaces"])

@router.get("", response_model=List[InterfaceResponse])
def get_interfaces(
    device_id: Optional[str] = Query(None, description="Filter by device ID"),
    status: Optional[str] = Query(None, description="Filter by status (up/down)"),
    search: Optional[str] = Query(None, description="Search by interface name or device")
):
    results = list(simulator.interfaces.values())

    if device_id:
        results = [i for i in results if i["device_id"] == device_id]
    if status:
        results = [i for i in results if i.get("status", "").lower() == status.lower()]
    if search:
        s = search.lower()
        results = [
            i for i in results
            if s in i.get("name", "").lower() or s in i.get("device_id", "").lower() or s in i.get("ip_address", "").lower()
        ]

    # Augment with device name
    augmented = []
    for iface in results:
        copy_if = dict(iface)
        dev = simulator.devices.get(iface["device_id"])
        copy_if["device_name"] = dev.get("name", iface["device_id"]) if dev else iface["device_id"]
        augmented.append(copy_if)

    return augmented

@router.get("/{interface_id}", response_model=InterfaceResponse)
def get_interface_detail(interface_id: str):
    iface = simulator.interfaces.get(interface_id)
    if not iface:
        raise HTTPException(status_code=404, detail=f"Interface '{interface_id}' not found")
    
    copy_if = dict(iface)
    dev = simulator.devices.get(iface["device_id"])
    copy_if["device_name"] = dev.get("name", iface["device_id"]) if dev else iface["device_id"]
    return copy_if

@router.post("/{interface_id}/action")
def execute_interface_action(interface_id: str, req: InterfaceActionRequest):
    iface = simulator.interfaces.get(interface_id)
    if not iface:
        raise HTTPException(status_code=404, detail=f"Interface '{interface_id}' not found")

    action = req.action.lower()
    if action == "enable":
        return simulator.set_interface_status(interface_id, "up")
    elif action == "disable":
        return simulator.set_interface_status(interface_id, "down")
    elif action == "flap":
        simulator.set_interface_status(interface_id, "down")
        return {"success": True, "message": f"Interface {interface_id} flapped."}
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported action '{req.action}'")
