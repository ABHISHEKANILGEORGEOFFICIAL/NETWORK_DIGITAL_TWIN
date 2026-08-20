from typing import List
from fastapi import APIRouter
from app.schemas.simulation import NotificationResponse
from app.simulator.network_simulator import simulator

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications():
    return simulator.notifications

@router.post("/read-all")
def mark_all_read():
    for n in simulator.notifications:
        n["is_read"] = True
    return {"success": True, "message": "All notifications marked as read."}
