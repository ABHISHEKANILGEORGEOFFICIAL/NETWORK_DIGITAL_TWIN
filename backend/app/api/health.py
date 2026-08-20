from fastapi import APIRouter
from app.simulator.network_simulator import simulator
from app.services.health_service import health_service

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def get_service_health():
    """System health check endpoint for monitoring uptime and readiness."""
    return {
        "status": "healthy",
        "database": "connected",
        "websocket": "active",
        "simulator": "running" if simulator.is_running else "stopped",
        "current_scenario": simulator.current_scenario,
        "active_devices_count": len(simulator.devices)
    }

@router.get("/breakdown")
def get_health_breakdown():
    """Returns exact 6-factor health scoring formula and component metrics."""
    health_data = health_service.calculate_global_health(
        list(simulator.devices.values()),
        list(simulator.links.values())
    )

    # Component weights documentation
    weights = {
        "availability": 0.30,
        "cpu": 0.20,
        "memory": 0.15,
        "bandwidth": 0.15,
        "latency": 0.10,
        "packet_loss": 0.10
    }

    # Per-tier health breakdown
    tier_scores = {}
    for tier in ["internet", "perimeter", "core", "distribution", "access", "workload"]:
        tier_devices = [d for d in simulator.devices.values() if d.get("tier") == tier]
        if tier_devices:
            avg_tier_health = sum(d.get("health_score", 100.0) for d in tier_devices) / len(tier_devices)
            tier_scores[tier] = {
                "score": round(avg_tier_health, 1),
                "device_count": len(tier_devices),
                "status": health_service.classify_score(avg_tier_health)
            }

    return {
        "overall_health_score": health_data["overall_score"],
        "classification": health_data["classification"],
        "formula_weights": weights,
        "component_scores": health_data["breakdown"],
        "tier_breakdown": tier_scores,
        "summary": health_data["summary"]
    }
