from datetime import datetime, timezone
import uuid
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.config import DeviceConfig
from app.schemas.config import DeviceConfigResponse, DeviceConfigCreate, DeviceConfigRollbackRequest
from app.simulator.network_simulator import simulator

router = APIRouter(prefix="/configurations", tags=["Configuration Management"])

@router.get("/{device_id}", response_model=List[DeviceConfigResponse])
def get_device_configurations(device_id: str, db: Session = Depends(get_db)):
    if device_id not in simulator.devices:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found")

    configs = db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id).order_by(DeviceConfig.version.desc()).all()
    return configs

@router.post("/save", response_model=DeviceConfigResponse)
def save_device_configuration(req: DeviceConfigCreate, db: Session = Depends(get_db)):
    if req.device_id not in simulator.devices:
        raise HTTPException(status_code=404, detail=f"Device '{req.device_id}' not found")

    # Get latest version number
    latest = db.query(DeviceConfig).filter(DeviceConfig.device_id == req.device_id).order_by(DeviceConfig.version.desc()).first()
    next_ver = (latest.version + 1) if latest else 1

    # Deactivate previous active configs
    db.query(DeviceConfig).filter(DeviceConfig.device_id == req.device_id).update({"is_active": False})

    new_cfg = DeviceConfig(
        id=f"CFG-{req.device_id}-V{next_ver}",
        device_id=req.device_id,
        version=next_ver,
        syntax_type=req.syntax_type,
        content=req.content,
        diff_summary=req.diff_summary or f"Version {next_ver} update applied to digital twin",
        created_by="admin@nettwin.io",
        created_at=datetime.now(timezone.utc),
        is_active=True
    )
    db.add(new_cfg)
    db.commit()
    db.refresh(new_cfg)

    simulator.add_notification(
        notif_type="system",
        title=f"Configuration Updated: {req.device_id}",
        message=f"Applied version {next_ver} configuration changes to digital twin model.",
        severity="info"
    )
    return new_cfg

@router.post("/{device_id}/rollback", response_model=DeviceConfigResponse)
def rollback_configuration(device_id: str, req: DeviceConfigRollbackRequest, db: Session = Depends(get_db)):
    target_cfg = db.query(DeviceConfig).filter(
        DeviceConfig.device_id == device_id,
        DeviceConfig.version == req.target_version
    ).first()

    if not target_cfg:
        raise HTTPException(status_code=404, detail=f"Version {req.target_version} not found for device {device_id}")

    # Set active flag
    db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id).update({"is_active": False})
    target_cfg.is_active = True
    db.commit()
    db.refresh(target_cfg)

    simulator.add_notification(
        notif_type="system",
        title=f"Configuration Rollback: {device_id}",
        message=f"Device configuration successfully rolled back to Version {req.target_version}.",
        severity="warning"
    )
    return target_cfg
