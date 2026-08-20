import pytest
from app.simulator.network_simulator import simulator
from app.simulator.topology_generator import generate_default_network_topology

def test_topology_generator_counts():
    raw = generate_default_network_topology()
    assert len(raw["devices"]) >= 30
    assert len(raw["links"]) >= 40
    assert len(raw["interfaces"]) >= 50

def test_simulator_initialization():
    simulator.initialize_topology()
    assert "INET-GW-01" in simulator.devices
    assert "CORE-RTR-01" in simulator.devices
    assert "SRV-WEB-01" in simulator.devices
    assert len(simulator.devices) >= 30

def test_simulator_tick_and_scenario():
    simulator.initialize_topology()
    # Trigger Router Failure scenario
    simulator.set_scenario("router_failure", target_id="CORE-RTR-01", duration_seconds=10)
    simulator._tick()
    
    assert simulator.devices["CORE-RTR-01"]["status"] == "offline"
    assert simulator.devices["CORE-RTR-01"]["cpu_utilization"] == 0.0
    assert len(simulator.alerts) > 0

    # Test recovery
    simulator.reset()
    assert simulator.devices["CORE-RTR-01"]["status"] == "healthy"
