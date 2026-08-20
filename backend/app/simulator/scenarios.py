from typing import Dict, Any, Optional

class ScenarioDefinition:
    def __init__(self, key: str, name: str, description: str, default_target: str, default_duration: int = 60):
        self.key = key
        self.name = name
        self.description = description
        self.default_target = default_target
        self.default_duration = default_duration

SCENARIOS: Dict[str, ScenarioDefinition] = {
    "normal": ScenarioDefinition(
        key="normal",
        name="Normal Operation Baseline",
        description="All physical and virtual network elements operating within nominal SLA thresholds.",
        default_target="ALL",
        default_duration=0
    ),
    "router_failure": ScenarioDefinition(
        key="router_failure",
        name="Spine Router Failure",
        description="Complete outage of CORE-RTR-01. Forces BGP reconvergence, link drops, and downstream alert cascade.",
        default_target="CORE-RTR-01",
        default_duration=60
    ),
    "switch_failure": ScenarioDefinition(
        key="switch_failure",
        name="Distribution Switch Outage",
        description="DIST-SW-01 kernel panic / power supply failure causing failover to secondary MLAG peer.",
        default_target="DIST-SW-01",
        default_duration=60
    ),
    "link_failure": ScenarioDefinition(
        key="link_failure",
        name="Fiber Cut / Link Outage",
        description="Physical fiber break on LINK-CORE-RTR-01-DIST-SW-01 causing immediate interface line-down state.",
        default_target="LINK-CORE-RTR-01-DIST-SW-01",
        default_duration=45
    ),
    "congestion": ScenarioDefinition(
        key="congestion",
        name="Backbone Congestion / Microburst",
        description="Severe traffic congestion (98%+ utilization) inducing packet drops and buffer bloat.",
        default_target="LINK-INET-GW-01-FW-CORE-01",
        default_duration=60
    ),
    "high_cpu": ScenarioDefinition(
        key="high_cpu",
        name="Control Plane CPU Saturation",
        description="Control plane CPU spikes to 96% due to routing flap recalculations.",
        default_target="CORE-RTR-02",
        default_duration=60
    ),
    "packet_loss": ScenarioDefinition(
        key="packet_loss",
        name="Interface CRC Errors & Packet Loss",
        description="Degraded optical transceiver causing 12.5% packet loss on database storage uplink.",
        default_target="LINK-ACC-SW-02-SRV-DB-PRIMARY",
        default_duration=60
    ),
    "latency_spike": ScenarioDefinition(
        key="latency_spike",
        name="WAN Latency Degradation",
        description="Upstream ISP peering issue causing latency spike from 4ms to 260ms.",
        default_target="LINK-INET-GW-01-FW-CORE-01",
        default_duration=60
    ),
    "custom": ScenarioDefinition(
        key="custom",
        name="Custom Failure Injection",
        description="User-configured parameter perturbation across specific device, link, or metric.",
        default_target="",
        default_duration=60
    )
}
