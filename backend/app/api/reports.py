import uuid
import io
import csv
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Query, Response
from app.schemas.report import NetworkReportResponse, HealthReportSection, PerformanceSummary
from app.simulator.network_simulator import simulator
from app.services.health_service import health_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/generate", response_model=NetworkReportResponse)
def generate_report(
    report_type: str = Query("health", description="health, performance, incident, executive"),
    timeframe: str = Query("24h", description="1h, 6h, 24h, 7d")
):
    health_data = health_service.calculate_global_health(
        list(simulator.devices.values()),
        list(simulator.links.values())
    )

    devs = list(simulator.devices.values())
    links = list(simulator.links.values())

    avg_cpu = sum(d.get("cpu_utilization", 20.0) for d in devs) / max(1, len(devs))
    peak_cpu = max((d.get("cpu_utilization", 20.0) for d in devs), default=20.0)
    avg_mem = sum(d.get("memory_utilization", 40.0) for d in devs) / max(1, len(devs))
    total_bw = sum(l.get("current_bandwidth_mbps", 0.0) for l in links) / 1000.0
    avg_lat = sum(l.get("latency_ms", 3.0) for l in links) / max(1, len(links))
    max_lat = max((l.get("latency_ms", 3.0) for l in links), default=3.0)
    avg_loss = sum(l.get("packet_loss_pct", 0.0) for l in links) / max(1, len(links))

    # Top congested links
    sorted_links = sorted(links, key=lambda x: x.get("utilization_pct", 0.0), reverse=True)
    congested = [
        {
            "link_name": l["name"],
            "capacity": f"{l.get('capacity_mbps', 10000) / 1000:.0f} Gbps",
            "utilization": f"{l.get('utilization_pct', 20.0):.1f}%",
            "latency": f"{l.get('latency_ms', 3.0):.2f} ms",
            "status": l.get("status", "up")
        }
        for l in sorted_links[:5]
    ]

    recs = [
        "Network overall SLA availability is operating at optimal enterprise compliance.",
        "Consider provisioning redundant optical link on Pod-2 Distribution tier to mitigate burst load.",
        "Review BGP route flap dampening thresholds on Spine Core Routers."
    ]

    return NetworkReportResponse(
        report_id=f"RPT-{uuid.uuid4().hex[:8].upper()}",
        report_type=report_type,
        generated_at=datetime.now(timezone.utc),
        timeframe=timeframe,
        health_summary=HealthReportSection(
            availability_score=health_data["breakdown"]["availability"],
            cpu_score=health_data["breakdown"]["cpu"],
            memory_score=health_data["breakdown"]["memory"],
            bandwidth_score=health_data["breakdown"]["bandwidth"],
            latency_score=health_data["breakdown"]["latency"],
            packet_loss_score=health_data["breakdown"]["packet_loss"],
            overall_health_score=health_data["overall_score"],
            classification=health_data["classification"]
        ),
        performance_summary=PerformanceSummary(
            avg_cpu_pct=round(avg_cpu, 1),
            peak_cpu_pct=round(peak_cpu, 1),
            avg_memory_pct=round(avg_mem, 1),
            total_bandwidth_gbps=round(total_bw, 2),
            avg_latency_ms=round(avg_lat, 2),
            max_latency_ms=round(max_lat, 2),
            avg_loss_pct=round(avg_loss, 3)
        ),
        top_congested_links=congested,
        critical_incidents_count=len(simulator.incidents),
        resolved_alerts_count=18,
        recommendations=recs
    )

@router.get("/export-csv")
def export_report_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Metric", "Current Value", "Baseline SLA", "Status"])
    
    health_data = health_service.calculate_global_health(
        list(simulator.devices.values()),
        list(simulator.links.values())
    )

    writer.writerow(["Network Health Score", f"{health_data['overall_score']}%", ">= 90%", health_data['classification']])
    writer.writerow(["Availability", f"{health_data['availability_pct']}%", ">= 99.9%", "Compliant"])
    writer.writerow(["Total Active Devices", len(simulator.devices), "34 Devices", "OK"])
    writer.writerow(["Active Incidents", len(simulator.incidents), "0 Incidents", "Nominal" if len(simulator.incidents) == 0 else "Action Required"])
    writer.writerow(["Active Alerts", len(simulator.alerts), "< 5 Alerts", "Normal" if len(simulator.alerts) < 5 else "Investigating"])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=nettwin_sla_health_report.csv"}
    )
