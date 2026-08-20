from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class HealthReportSection(BaseModel):
    availability_score: float
    cpu_score: float
    memory_score: float
    bandwidth_score: float
    latency_score: float
    packet_loss_score: float
    overall_health_score: float
    classification: str

class PerformanceSummary(BaseModel):
    avg_cpu_pct: float
    peak_cpu_pct: float
    avg_memory_pct: float
    total_bandwidth_gbps: float
    avg_latency_ms: float
    max_latency_ms: float
    avg_loss_pct: float

class NetworkReportResponse(BaseModel):
    report_id: str
    report_type: str  # health, performance, incident, inventory, executive
    generated_at: datetime
    timeframe: str
    health_summary: HealthReportSection
    performance_summary: PerformanceSummary
    top_congested_links: List[Dict[str, Any]]
    critical_incidents_count: int
    resolved_alerts_count: int
    recommendations: List[str]
