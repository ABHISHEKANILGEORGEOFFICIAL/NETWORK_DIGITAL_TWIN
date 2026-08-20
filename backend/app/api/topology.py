from typing import Dict, Any, List
from fastapi import APIRouter
from app.schemas.topology import TopologyResponse, TopologyNode, TopologyEdge
from app.simulator.network_simulator import simulator

router = APIRouter(prefix="/topology", tags=["Topology"])

@router.get("", response_model=TopologyResponse)
def get_topology():
    devices = simulator.devices
    links = simulator.links
    interfaces = simulator.interfaces

    nodes: List[TopologyNode] = []
    edges: List[TopologyEdge] = []

    # Build Nodes
    for dev_id, dev in devices.items():
        alerts_count = sum(1 for a in simulator.alerts if a["device_id"] == dev_id)
        node_data = {
            "id": dev["id"],
            "name": dev["name"],
            "device_type": dev["type"],
            "status": dev.get("status", "healthy"),
            "ip_address": dev["ip_address"],
            "vendor": dev.get("vendor", "Cisco"),
            "model": dev.get("model", "Catalyst"),
            "cpu": round(dev.get("cpu_utilization", 20.0), 1),
            "memory": round(dev.get("memory_utilization", 40.0), 1),
            "health_score": dev.get("health_score", 100.0),
            "tier": dev.get("tier", "core"),
            "alerts_count": alerts_count
        }

        nodes.append(TopologyNode(
            id=dev["id"],
            label=dev["name"],
            type="customDevice",
            device_type=dev["type"],
            status=dev.get("status", "healthy"),
            ip_address=dev["ip_address"],
            cpu=round(dev.get("cpu_utilization", 20.0), 1),
            memory=round(dev.get("memory_utilization", 40.0), 1),
            health_score=dev.get("health_score", 100.0),
            pos_x=float(dev.get("pos_x", 0)),
            pos_y=float(dev.get("pos_y", 0)),
            tier=dev.get("tier", "core"),
            data=node_data
        ))

    # Build Edges
    for link_id, link in links.items():
        src_if = interfaces.get(link["source_interface_id"], {})
        tgt_if = interfaces.get(link["target_interface_id"], {})

        edge_data = {
            "id": link["id"],
            "name": link["name"],
            "status": link.get("status", "up"),
            "capacity_mbps": link.get("capacity_mbps", 10000),
            "utilization_pct": round(link.get("utilization_pct", 20.0), 1),
            "current_bandwidth_mbps": round(link.get("current_bandwidth_mbps", 2000.0), 1),
            "latency_ms": round(link.get("latency_ms", 3.0), 2),
            "packet_loss_pct": round(link.get("packet_loss_pct", 0.0), 3),
            "jitter_ms": round(link.get("jitter_ms", 0.5), 2),
            "source_interface_name": src_if.get("name", link["source_interface_id"]),
            "target_interface_name": tgt_if.get("name", link["target_interface_id"])
        }

        edges.append(TopologyEdge(
            id=link["id"],
            source=link["source_device_id"],
            target=link["target_device_id"],
            source_interface=src_if.get("name", "eth0"),
            target_interface=tgt_if.get("name", "eth0"),
            status=link.get("status", "up"),
            utilization_pct=round(link.get("utilization_pct", 20.0), 1),
            capacity_mbps=link.get("capacity_mbps", 10000),
            latency_ms=round(link.get("latency_ms", 3.0), 2),
            packet_loss_pct=round(link.get("packet_loss_pct", 0.0), 3),
            data=edge_data
        ))

    # Device type summary
    dev_summary: Dict[str, int] = {}
    for d in devices.values():
        t = d.get("type", "other")
        dev_summary[t] = dev_summary.get(t, 0) + 1

    return TopologyResponse(
        nodes=nodes,
        edges=edges,
        devices_summary=dev_summary,
        tiers=["internet", "perimeter", "core", "distribution", "access", "workload"]
    )
