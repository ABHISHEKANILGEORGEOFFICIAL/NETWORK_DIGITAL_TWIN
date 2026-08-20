import pytest
from app.detection.correlation_engine import incident_correlator
from app.simulator.network_simulator import simulator

def test_incident_correlation_root_cause():
    simulator.initialize_topology()
    
    # Simulate cascade alerts where CORE-RTR-01 is root failure and downstream ACC-SW-01 is unreachable
    alerts = [
        {
            "id": "ALT-1",
            "device_id": "ACC-SW-01",
            "severity": "critical",
            "title": "ACC-SW-01 unreachable"
        },
        {
            "id": "ALT-2",
            "device_id": "CORE-RTR-01",
            "severity": "critical",
            "title": "CORE-RTR-01 offline"
        },
        {
            "id": "ALT-3",
            "device_id": "SRV-WEB-01",
            "severity": "critical",
            "title": "SRV-WEB-01 unreachable"
        }
    ]

    incident = incident_correlator.correlate_alerts(alerts)
    assert incident is not None
    assert incident["root_cause_device_id"] == "CORE-RTR-01"
    assert incident["confidence_pct"] >= 80.0
    assert incident["affected_devices_count"] >= 2
