from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.alert import AlertResponse, AlertActionRequest
from app.simulator.network_simulator import simulator

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    severity: Optional[str] = Query(None, description="info, warning, high, critical"),
    status: Optional[str] = Query(None, description="open, acknowledged, resolved"),
    device_id: Optional[str] = Query(None, description="Filter by device ID")
):
    return simulator.get_all_alerts(severity=severity, status=status, device_id=device_id)

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert_detail(alert_id: str):
    all_alerts = simulator.get_all_alerts()
    for a in all_alerts:
        if a["id"] == alert_id:
            return a
    raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

@router.post("/{alert_id}/status")
def update_alert_status(alert_id: str, req: AlertActionRequest):
    updated = simulator.update_alert_status(alert_id, req.status)
    if updated:
        return {"success": True, "alert_id": alert_id, "new_status": updated["status"]}
    raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

@router.post("/clear")
def clear_alerts():
    active_count = len(simulator.active_alerts)
    simulator.active_alerts.clear()
    simulator.alert_history.clear()
    simulator.incidents.clear()
    return {"success": True, "cleared_alerts_count": active_count}
