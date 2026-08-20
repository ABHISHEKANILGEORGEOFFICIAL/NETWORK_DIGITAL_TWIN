from datetime import datetime, timezone
import random
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException
from app.schemas.telemetry import GlobalMetricsResponse, TelemetryHistoryResponse, TelemetryPoint
from app.simulator.network_simulator import simulator
from app.services.health_service import health_service

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.get("/live", response_model=GlobalMetricsResponse)
def get_live_metrics():
    health_data = health_service.calculate_global_health(
        list(simulator.devices.values()),
        list(simulator.links.values())
    )

    total_bw = sum(l.get("current_bandwidth_mbps", 0.0) for l in simulator.links.values()) / 1000.0

    return GlobalMetricsResponse(
        timestamp=datetime.now(timezone.utc),
        network_health_score=health_data["overall_score"],
        health_classification=health_data["classification"],
        total_devices=len(simulator.devices),
        healthy_devices=health_data["summary"]["healthy_devices"],
        warning_devices=health_data["summary"]["warning_devices"],
        critical_devices=health_data["summary"]["critical_devices"],
        offline_devices=health_data["summary"]["offline_devices"],
        total_interfaces=len(simulator.interfaces),
        total_links=len(simulator.links),
        total_bandwidth_gbps=round(total_bw, 2),
        avg_latency_ms=health_data["summary"]["avg_latency_ms"],
        avg_packet_loss_pct=health_data["summary"]["avg_packet_loss_pct"],
        availability_pct=health_data["availability_pct"],
        active_alerts_count=len(simulator.alerts),
        critical_alerts_count=sum(1 for a in simulator.alerts if a["severity"] == "critical"),
        open_incidents_count=len(simulator.incidents)
    )

@router.get("/history/{device_id}", response_model=TelemetryHistoryResponse)
def get_device_telemetry_history(device_id: str, limit: int = Query(60, ge=5, le=500)):
    if device_id not in simulator.devices:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found")
    
    raw_points = simulator.telemetry_history.get(device_id, [])
    # If not enough history accumulated yet, generate smooth baseline points
    if len(raw_points) < 10:
        dev = simulator.devices[device_id]
        now_ts = datetime.now(timezone.utc)
        synthetic = []
        for i in range(20, 0, -1):
            ts = datetime.fromtimestamp(now_ts.timestamp() - (i * 2), timezone.utc)
            base_cpu = dev.get("cpu_utilization", 20.0) + random.uniform(-2, 2)
            base_mem = dev.get("memory_utilization", 40.0) + random.uniform(-1, 1)
            synthetic.append(TelemetryPoint(
                timestamp=ts,
                device_id=device_id,
                cpu=round(max(5.0, min(99.0, base_cpu)), 1),
                memory=round(max(10.0, min(99.0, base_mem)), 1),
                bandwidth_in_mbps=round(base_cpu * 12.0, 1),
                bandwidth_out_mbps=round(base_cpu * 10.5, 1),
                latency_ms=round(random.uniform(2.0, 4.0), 2),
                packet_loss_pct=0.0 if dev.get("status") == "healthy" else 5.0,
                temperature_celsius=round(dev.get("temperature_celsius", 38.0), 1),
                status=dev.get("status", "healthy")
            ))
        return TelemetryHistoryResponse(device_id=device_id, points=synthetic)

    points = [
        TelemetryPoint(
            timestamp=datetime.fromisoformat(p["timestamp"]),
            device_id=p["device_id"],
            cpu=p["cpu"],
            memory=p["memory"],
            bandwidth_in_mbps=p["bandwidth_in_mbps"],
            bandwidth_out_mbps=p["bandwidth_out_mbps"],
            latency_ms=p["latency_ms"],
            packet_loss_pct=p["packet_loss_pct"],
            temperature_celsius=p["temperature_celsius"],
            status=p["status"]
        )
        for p in raw_points[-limit:]
    ]

    return TelemetryHistoryResponse(device_id=device_id, points=points)

@router.get("/traffic")
def get_traffic_analytics(timeframe: str = Query("1h", description="5m, 1h, 6h, 24h, 7d")):
    # Protocol distribution
    protocols = [
        {"name": "HTTPS / TLS", "pct": 42.5, "bandwidth_gbps": 2.14, "color": "#06b6d4"},
        {"name": "Database (PostgreSQL / Ceph)", "pct": 24.8, "bandwidth_gbps": 1.25, "color": "#3b82f6"},
        {"name": "BGP / OSPF Control Plane", "pct": 11.2, "bandwidth_gbps": 0.56, "color": "#10b981"},
        {"name": "SSH / Netconf / gNMI", "pct": 8.4, "bandwidth_gbps": 0.42, "color": "#8b5cf6"},
        {"name": "DNS / NTP / ICMP", "pct": 6.1, "bandwidth_gbps": 0.31, "color": "#f59e0b"},
        {"name": "RoCE / RDMA GPU Fabric", "pct": 7.0, "bandwidth_gbps": 0.35, "color": "#ec4899"}
    ]

    # Top talkers
    top_talkers = [
        {"rank": 1, "device": "SRV-WEB-01", "ip": "172.16.10.11", "in_mbps": 1420.0, "out_mbps": 1890.0, "flows": 48200},
        {"rank": 2, "device": "SRV-DB-PRIMARY", "ip": "172.16.20.21", "in_mbps": 1280.0, "out_mbps": 980.0, "flows": 36100},
        {"rank": 3, "device": "SRV-AI-WORKER", "ip": "172.16.30.32", "in_mbps": 890.0, "out_mbps": 1640.0, "flows": 12400},
        {"rank": 4, "device": "SRV-APP-01", "ip": "172.16.10.12", "in_mbps": 920.0, "out_mbps": 880.0, "flows": 29800},
        {"rank": 5, "device": "AP-HQ-FL2", "ip": "192.168.10.12", "in_mbps": 410.0, "out_mbps": 320.0, "flows": 8400}
    ]

    # Time series points based on timeframe
    points_count = 20
    series = []
    now_ts = datetime.now(timezone.utc).timestamp()
    interval = 180 if timeframe == "1h" else 30

    for i in range(points_count, 0, -1):
        t = datetime.fromtimestamp(now_ts - (i * interval), timezone.utc).strftime("%H:%M:%S")
        in_bw = 2.4 + random.uniform(-0.3, 0.4)
        out_bw = 2.2 + random.uniform(-0.2, 0.3)
        series.append({
            "time": t,
            "inbound_gbps": round(in_bw, 2),
            "outbound_gbps": round(out_bw, 2),
            "total_gbps": round(in_bw + out_bw, 2)
        })

    return {
        "timeframe": timeframe,
        "total_traffic_gbps": round(sum(l.get("current_bandwidth_mbps", 0.0) for l in simulator.links.values()) / 1000.0, 2),
        "protocol_distribution": protocols,
        "top_talkers": top_talkers,
        "traffic_series": series
    }

@router.get("/events")
def get_digital_twin_events(limit: int = Query(50, ge=1, le=200)):
    return simulator.events[:limit]

