from fastapi import APIRouter, HTTPException, Query
from app.simulator.network_simulator import simulator
from app.services.routing_service import routing_service

router = APIRouter(prefix="/path-analysis", tags=["Path Analysis"])

@router.get("/trace")
def trace_path(
    source: str = Query("SRV-WEB-01", description="Source Device ID"),
    destination: str = Query("INET-GW-01", description="Destination Device ID")
):
    if source not in simulator.devices:
        raise HTTPException(status_code=404, detail=f"Source device '{source}' not found")
    if destination not in simulator.devices:
        raise HTTPException(status_code=404, detail=f"Destination device '{destination}' not found")

    result = routing_service.analyze_path(
        source_id=source,
        destination_id=destination,
        devices=list(simulator.devices.values()),
        links=list(simulator.links.values())
    )

    if not result:
        raise HTTPException(status_code=400, detail=f"Could not compute path from {source} to {destination}")

    return result
