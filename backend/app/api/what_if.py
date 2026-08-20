from fastapi import APIRouter, HTTPException
from app.schemas.what_if import WhatIfRequest, WhatIfResponse
from app.simulator.network_simulator import simulator
from app.services.what_if_service import what_if_service

router = APIRouter(prefix="/what-if", tags=["What-If Simulation"])

@router.post("/analyze", response_model=WhatIfResponse)
def analyze_what_if_scenario(req: WhatIfRequest):
    if req.target_id not in simulator.devices and req.target_id not in simulator.links:
        # Default fallback target
        target = list(simulator.devices.keys())[0] if simulator.devices else "CORE-RTR-01"
    else:
        target = req.target_id

    result = what_if_service.run_what_if(
        failure_type=req.failure_type,
        target_id=target,
        live_devices=list(simulator.devices.values()),
        live_links=list(simulator.links.values()),
        secondary_target_id=req.secondary_target_id
    )
    return result
