import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.simulator.network_simulator import simulator

@pytest.fixture(autouse=True)
def init_test_state():
    simulator.initialize_topology()

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "NetTwin" in response.json()["platform"]

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["active_devices_count"] >= 30

def test_devices_list():
    response = client.get("/api/devices")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 30
    assert any(d["id"] == "CORE-RTR-01" for d in data)

def test_topology_graph():
    response = client.get("/api/topology")
    assert response.status_code == 200
    data = response.json()
    assert len(data["nodes"]) >= 30
    assert len(data["edges"]) >= 40

def test_what_if_analysis():
    response = client.post("/api/what-if/analyze", json={
        "failure_type": "device_outage",
        "target_id": "CORE-RTR-01"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["target_id"] == "CORE-RTR-01"
    assert data["affected_devices_count"] >= 1
    assert "health_score_after" in data
