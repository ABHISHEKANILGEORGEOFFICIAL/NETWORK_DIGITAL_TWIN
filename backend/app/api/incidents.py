from typing import List, Optional
from fastapi import APIRouter, HTTPException
from app.schemas.incident import IncidentResponse, IncidentActionRequest
from app.simulator.network_simulator import simulator

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents():
    results = []
    for inc in simulator.incidents:
        inc_copy = dict(inc)
        # Attach associated active alerts
        inc_copy["alerts"] = [a for a in simulator.alerts if a.get("device_id") in inc.get("affected_nodes", [])]
        results.append(inc_copy)
    return results

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_detail(incident_id: str):
    for inc in simulator.incidents:
        if inc["id"] == incident_id:
            inc_copy = dict(inc)
            inc_copy["alerts"] = [a for a in simulator.alerts if a.get("device_id") in inc.get("affected_nodes", [])]
            return inc_copy
    raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found")

@router.post("/{incident_id}/status")
def update_incident_status(incident_id: str, req: IncidentActionRequest):
    for inc in simulator.incidents:
        if inc["id"] == incident_id:
            inc["status"] = req.status
            return {"success": True, "incident_id": incident_id, "new_status": req.status}
    raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found")
