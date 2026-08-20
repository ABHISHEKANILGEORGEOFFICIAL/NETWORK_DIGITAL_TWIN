import copy
from typing import List, Dict, Any
import networkx as nx
from app.services.health_service import health_service
from app.services.routing_service import routing_service

class WhatIfService:
    """
    Isolated What-If Analysis Engine:
    - Creates in-memory clone of the Digital Twin state
    - Perturbs the sandbox graph (e.g. simulated link cuts, node shutdowns, bandwidth surge)
    - Recomputes network topology connectivity, Dijkstra alternate routing, bottleneck links
    - Calculates impact blast radius, health degradation, and recovery time estimates
    - Leaves live production twin state completely untouched
    """
    def __init__(self):
        pass

    def run_what_if(
        self,
        failure_type: str,
        target_id: str,
        live_devices: List[Dict[str, Any]],
        live_links: List[Dict[str, Any]],
        secondary_target_id: str = None
    ) -> Dict[str, Any]:
        # 1. Deep clone state to guarantee total isolation
        sim_devices = copy.deepcopy(live_devices)
        sim_links = copy.deepcopy(live_links)

        # Baseline Health
        baseline_health = health_service.calculate_global_health(sim_devices, sim_links)
        health_before = baseline_health["overall_score"]

        affected_devices = []
        affected_links = []
        isolated_nodes = []
        congested_links = []

        # 2. Apply simulated disruption in sandbox
        if failure_type == "device_outage":
            for d in sim_devices:
                if d["id"] == target_id:
                    d["status"] = "offline"
                    d["cpu_utilization"] = 0.0
                    affected_devices.append(d["id"])
            for l in sim_links:
                if l["source_device_id"] == target_id or l["target_device_id"] == target_id:
                    l["status"] = "down"
                    l["utilization_pct"] = 0.0
                    affected_links.append(l["id"])

        elif failure_type == "link_cut":
            for l in sim_links:
                if l["id"] == target_id or (l["source_device_id"] == target_id and l["target_device_id"] == secondary_target_id):
                    l["status"] = "down"
                    l["utilization_pct"] = 0.0
                    affected_links.append(l["id"])
                    affected_devices.extend([l["source_device_id"], l["target_device_id"]])

        elif failure_type == "bandwidth_surge":
            for l in sim_links:
                if l["id"] == target_id or l["source_device_id"] == target_id:
                    l["utilization_pct"] = 98.5
                    l["packet_loss_pct"] = 8.5
                    l["latency_ms"] = 180.0
                    l["status"] = "congested"
                    congested_links.append(l["id"])
                    affected_links.append(l["id"])

        # 3. Analyze connectivity in sandbox
        G = routing_service.build_graph(sim_devices, sim_links)
        
        # Check for isolated / unreachable nodes from Internet Gateway
        inet_root = "INET-GW-01"
        if inet_root in G:
            for d in sim_devices:
                if d["id"] != inet_root and d["status"] != "offline":
                    try:
                        if not nx.has_path(G, inet_root, d["id"]):
                            isolated_nodes.append(d["id"])
                            if d["id"] not in affected_devices:
                                affected_devices.append(d["id"])
                    except Exception:
                        isolated_nodes.append(d["id"])

        # 4. Reroute Key Workload Paths (e.g. SRV-WEB-01 -> INET-GW-01, SRV-DB-PRIMARY -> INET-GW-01)
        test_flows = [
            ("SRV-WEB-01", "INET-GW-01"),
            ("SRV-DB-PRIMARY", "INET-GW-01"),
            ("SRV-APP-01", "INET-GW-01"),
            ("AP-HQ-FL1", "INET-GW-01")
        ]

        rerouted_paths = []
        for src, dst in test_flows:
            orig_path_res = routing_service.analyze_path(src, dst, live_devices, live_links)
            sim_path_res = routing_service.analyze_path(src, dst, sim_devices, sim_links)

            orig_path = orig_path_res.get("path_nodes", []) if orig_path_res else []
            orig_lat = orig_path_res.get("total_latency_ms", 5.0) if orig_path_res else 5.0

            if sim_path_res and sim_path_res.get("path_found"):
                new_path = sim_path_res.get("path_nodes", [])
                new_lat = sim_path_res.get("total_latency_ms", 12.0)
                reroute_possible = True
            else:
                new_path = []
                new_lat = 999.0
                reroute_possible = False

            rerouted_paths.append({
                "source": src,
                "destination": dst,
                "original_path": orig_path,
                "new_path": new_path,
                "original_latency_ms": orig_lat,
                "new_latency_ms": new_lat,
                "reroute_possible": reroute_possible
            })

        # 5. Post-scenario health calculation
        health_after_data = health_service.calculate_global_health(sim_devices, sim_links)
        health_after = health_after_data["overall_score"]

        # Impact categorization
        if len(isolated_nodes) > 4 or (health_before - health_after) > 30:
            impact_level = "Critical"
            recovery_sec = 45
        elif len(affected_devices) > 2 or (health_before - health_after) > 15:
            impact_level = "High"
            recovery_sec = 25
        elif len(affected_devices) > 0:
            impact_level = "Medium"
            recovery_sec = 12
        else:
            impact_level = "Low"
            recovery_sec = 4

        mitigations = [
            f"Dynamic BGP / OSPF failover will shift transit flows to secondary spine (CORE-RTR-02).",
            f"Spanning Tree / MLAG dual-homing prevents total rack isolation on distribution tier.",
            f"Pre-warm standby firewall and provision backup LACP aggregates."
        ]

        if isolated_nodes:
            mitigations.insert(0, f"ATTENTION: {len(isolated_nodes)} nodes ({', '.join(isolated_nodes[:3])}) will suffer complete partitioning. Urgent dual-homed link recommended.")

        return {
            "scenario": f"What-If: {failure_type.replace('_', ' ').title()} on {target_id}",
            "target_id": target_id,
            "estimated_impact": impact_level,
            "affected_devices_count": len(affected_devices),
            "affected_devices": affected_devices,
            "affected_links_count": len(affected_links),
            "affected_links": affected_links,
            "isolated_nodes": isolated_nodes,
            "congested_links": congested_links,
            "estimated_recovery_time_seconds": recovery_sec,
            "health_score_before": health_before,
            "health_score_after": health_after,
            "traffic_redistribution_summary": f"Traffic dynamically redistributed across {len([p for p in rerouted_paths if p['reroute_possible']])} alternate topological paths.",
            "rerouted_paths": rerouted_paths,
            "suggested_mitigations": mitigations
        }

what_if_service = WhatIfService()
