import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.snapshot import NetworkSnapshot
from app.schemas.snapshot import SnapshotCreateRequest, SnapshotResponse, SnapshotDetailResponse, SnapshotComparisonResponse
from app.simulator.network_simulator import simulator
from app.services.health_service import health_service

router = APIRouter(prefix="/snapshots", tags=["Snapshots"])

@router.get("", response_model=List[SnapshotResponse])
def get_snapshots(db: Session = Depends(get_db)):
    snapshots = db.query(NetworkSnapshot).order_by(NetworkSnapshot.created_at.desc()).all()
    return snapshots

@router.post("", response_model=SnapshotResponse)
def create_snapshot(req: SnapshotCreateRequest, db: Session = Depends(get_db)):
    health_data = health_service.calculate_global_health(
        list(simulator.devices.values()),
        list(simulator.links.values())
    )

    state = {
        "devices": simulator.devices,
        "links": simulator.links,
        "interfaces": simulator.interfaces,
        "alerts": simulator.alerts,
        "incidents": simulator.incidents,
        "current_scenario": simulator.current_scenario
    }

    snap_id = f"SNAP-{uuid.uuid4().hex[:8].upper()}"
    new_snap = NetworkSnapshot(
        id=snap_id,
        name=req.name,
        description=req.description or "Manual network state snapshot",
        created_by="admin@nettwin.io",
        device_count=len(simulator.devices),
        healthy_count=health_data["summary"]["healthy_devices"],
        warning_count=health_data["summary"]["warning_devices"],
        critical_count=health_data["summary"]["critical_devices"],
        health_score=health_data["overall_score"],
        state_json=json.dumps(state, default=str),
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_snap)
    db.commit()
    db.refresh(new_snap)

    simulator.add_notification(
        notif_type="system",
        title=f"Snapshot Created: {req.name}",
        message=f"Point-in-time state of {len(simulator.devices)} devices captured (Health: {health_data['overall_score']}%).",
        severity="info"
    )
    return new_snap

@router.get("/{snapshot_id}", response_model=SnapshotDetailResponse)
def get_snapshot_detail(snapshot_id: str, db: Session = Depends(get_db)):
    snap = db.query(NetworkSnapshot).filter(NetworkSnapshot.id == snapshot_id).first()
    if not snap:
        raise HTTPException(status_code=404, detail=f"Snapshot '{snapshot_id}' not found")
    
    state_data = json.loads(snap.state_json)
    return SnapshotDetailResponse(
        id=snap.id,
        name=snap.name,
        description=snap.description,
        created_by=snap.created_by,
        device_count=snap.device_count,
        healthy_count=snap.healthy_count,
        warning_count=snap.warning_count,
        critical_count=snap.critical_count,
        health_score=snap.health_score,
        created_at=snap.created_at,
        state=state_data
    )

@router.post("/compare", response_model=SnapshotComparisonResponse)
def compare_snapshots(snap_a_id: str, snap_b_id: str, db: Session = Depends(get_db)):
    snap_a = db.query(NetworkSnapshot).filter(NetworkSnapshot.id == snap_a_id).first()
    snap_b = db.query(NetworkSnapshot).filter(NetworkSnapshot.id == snap_b_id).first()

    if not snap_a or not snap_b:
        raise HTTPException(status_code=404, detail="One or both snapshots not found")

    state_a = json.loads(snap_a.state_json)
    state_b = json.loads(snap_b.state_json)

    devs_a = state_a.get("devices", {})
    devs_b = state_b.get("devices", {})

    diff_details = []
    devs_changed = 0

    all_keys = set(devs_a.keys()).union(set(devs_b.keys()))
    for k in all_keys:
        da = devs_a.get(k, {})
        db_dev = devs_b.get(k, {})

        status_a = da.get("status", "unknown")
        status_b = db_dev.get("status", "unknown")
        cpu_a = da.get("cpu_utilization", 0.0)
        cpu_b = db_dev.get("cpu_utilization", 0.0)

        if status_a != status_b or abs(cpu_a - cpu_b) > 10.0:
            devs_changed += 1
            diff_details.append({
                "device_id": k,
                "device_name": da.get("name") or db_dev.get("name", k),
                "status_before": status_a,
                "status_after": status_b,
                "cpu_before": round(cpu_a, 1),
                "cpu_after": round(cpu_b, 1),
                "diff_type": "status_changed" if status_a != status_b else "telemetry_drift"
            })

    return SnapshotComparisonResponse(
        snapshot_a_id=snap_a.id,
        snapshot_a_name=snap_a.name,
        snapshot_b_id=snap_b.id,
        snapshot_b_name=snap_b.name,
        health_score_diff=round(snap_b.health_score - snap_a.health_score, 1),
        devices_changed=devs_changed,
        links_changed=abs(len(state_b.get("links", {})) - len(state_a.get("links", {}))),
        alerts_diff_count=len(state_b.get("alerts", [])) - len(state_a.get("alerts", [])),
        details=diff_details
    )

@router.post("/{snapshot_id}/restore")
def restore_snapshot(snapshot_id: str, db: Session = Depends(get_db)):
    snap = db.query(NetworkSnapshot).filter(NetworkSnapshot.id == snapshot_id).first()
    if not snap:
        raise HTTPException(status_code=404, detail=f"Snapshot '{snapshot_id}' not found")

    state = json.loads(snap.state_json)
    simulator.devices = state.get("devices", simulator.devices)
    simulator.links = state.get("links", simulator.links)
    simulator.interfaces = state.get("interfaces", simulator.interfaces)
    simulator.alerts = state.get("alerts", [])
    simulator.incidents = state.get("incidents", [])
    simulator.current_scenario = state.get("current_scenario", "normal")

    simulator.add_notification(
        notif_type="system",
        title=f"State Restored: {snap.name}",
        message=f"Digital Twin restored to snapshot '{snap.name}' ({snap.created_at.strftime('%Y-%m-%d %H:%M')}).",
        severity="warning"
    )

    return {"success": True, "message": f"Digital twin state restored to snapshot '{snap.name}'"}
