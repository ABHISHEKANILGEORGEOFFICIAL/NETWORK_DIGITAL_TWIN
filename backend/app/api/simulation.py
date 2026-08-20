from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from app.schemas.simulation import SimulationScenarioRequest, SimulationStatusResponse
from app.simulator.network_simulator import simulator
from app.simulator.scenarios import SCENARIOS

router = APIRouter(prefix="/simulations", tags=["Simulation Control Center"])

@router.get("/scenarios")
def get_scenarios():
    return [
        {
            "key": s.key,
            "name": s.name,
            "description": s.description,
            "default_target": s.default_target,
            "default_duration": s.default_duration
        }
        for s in SCENARIOS.values()
    ]

@router.get("/status", response_model=SimulationStatusResponse)
def get_simulation_status():
    return SimulationStatusResponse(
        current_scenario=simulator.current_scenario,
        is_running=simulator.is_running,
        is_paused=simulator.is_paused,
        active_injections=simulator.active_injections,
        simulated_time_seconds=simulator.simulated_time_seconds,
        events_generated=simulator.tick_count * 34,
        devices_affected=sum(1 for d in simulator.devices.values() if d.get("status") != "healthy"),
        alerts_generated=len(simulator.alerts),
        last_sync_timestamp=datetime.now(timezone.utc),
        twin_sync_rate_pct=99.8,
        twin_accuracy_pct=98.7
    )

@router.post("/start")
async def start_simulation():
    await simulator.start()
    simulator.is_paused = False
    return {"success": True, "message": "Simulation loop started."}

@router.post("/pause")
def pause_simulation():
    simulator.is_paused = True
    return {"success": True, "message": "Simulation loop paused."}

@router.post("/stop")
def stop_simulation():
    simulator.stop()
    return {"success": True, "message": "Simulation loop stopped."}

@router.post("/reset")
def reset_simulation():
    simulator.reset()
    return {"success": True, "message": "Digital Twin reset to baseline healthy state."}

@router.post("/scenario")
def trigger_scenario(req: SimulationScenarioRequest):
    injection = simulator.set_scenario(
        scenario_key=req.scenario,
        target_id=req.target_device_id or req.target_link_id,
        duration_seconds=req.duration_seconds or 60,
        custom_params=req.custom_params
    )
    return {
        "success": True,
        "scenario": req.scenario,
        "injection": injection,
        "message": f"Successfully activated scenario '{req.scenario}' on target '{injection['target']}'"
    }

@router.post("/custom-inject")
def custom_failure_inject(
    device_id: str = None,
    link_id: str = None,
    failure_type: str = "cpu",
    severity: str = "high",
    duration_seconds: int = 60
):
    target = device_id or link_id or "CORE-RTR-01"
    custom_params = {"failure_type": failure_type, "severity": severity}
    
    if failure_type == "cpu":
        custom_params["cpu"] = 96.5
    elif failure_type == "memory":
        custom_params["memory"] = 94.0
    elif failure_type == "connectivity":
        custom_params["status"] = "offline"

    injection = simulator.set_scenario(
        scenario_key="custom",
        target_id=target,
        duration_seconds=duration_seconds,
        custom_params=custom_params
    )
    return {
        "success": True,
        "target": target,
        "failure_type": failure_type,
        "duration_seconds": duration_seconds,
        "injection": injection
    }
