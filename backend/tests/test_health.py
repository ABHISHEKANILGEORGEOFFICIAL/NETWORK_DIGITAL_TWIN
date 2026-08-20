import pytest
from app.services.health_service import health_service

def test_health_classification():
    assert health_service.classify_score(95.0) == "Excellent"
    assert health_service.classify_score(82.0) == "Healthy"
    assert health_service.classify_score(68.0) == "Warning"
    assert health_service.classify_score(50.0) == "Degraded"
    assert health_service.classify_score(25.0) == "Critical"

def test_device_health_calculation_nominal():
    score, breakdown = health_service.calculate_device_health(
        status="healthy",
        cpu=20.0,
        memory=40.0,
        bandwidth_util_pct=25.0,
        latency_ms=3.0,
        packet_loss_pct=0.0
    )
    assert score >= 90.0
    assert breakdown["availability"] == 100.0

def test_device_health_calculation_critical_offline():
    score, breakdown = health_service.calculate_device_health(
        status="offline",
        cpu=0.0,
        memory=0.0,
        bandwidth_util_pct=0.0,
        latency_ms=0.0,
        packet_loss_pct=100.0
    )
    assert score < 70.0
    assert breakdown["availability"] == 0.0

def test_global_health_empty():
    res = health_service.calculate_global_health([], [])
    assert res["overall_score"] == 100.0
