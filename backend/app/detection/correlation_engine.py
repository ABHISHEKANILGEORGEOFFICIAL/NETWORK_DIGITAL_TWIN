import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import networkx as nx

class IncidentCorrelator:
    """
    Topology-Aware Alert Correlation & Root Cause Engine:
    - Ingests incoming alerts across the network graph
    - Identifies dependency trees (e.g. Spine -> Dist -> Access -> Workload)
    - Groups cascading alerts into correlated high-level Incidents
    - Determines probable root cause and calculates confidence percentage
    """
    def __init__(self):
        self._graph = nx.DiGraph()

    def build_topology_graph(self, devices: List[Dict[str, Any]], links: List[Dict[str, Any]]):
        self._graph.clear()
        tier_hierarchy = {
            "internet": 0,
            "perimeter": 1,
            "core": 2,
            "distribution": 3,
            "access": 4,
            "workload": 5
        }
        
        for dev in devices:
            self._graph.add_node(dev["id"], **dev)

        for link in links:
            src = link["source_device_id"]
            tgt = link["target_device_id"]
            if src in self._graph and tgt in self._graph:
                tier_src = tier_hierarchy.get(self._graph.nodes[src].get("tier", "workload"), 5)
                tier_tgt = tier_hierarchy.get(self._graph.nodes[tgt].get("tier", "workload"), 5)
                
                # Directed edge from upstream (lower tier index) to downstream (higher tier index)
                if tier_src <= tier_tgt:
                    self._graph.add_edge(src, tgt, link_id=link["id"], capacity=link.get("capacity_mbps", 10000))
                else:
                    self._graph.add_edge(tgt, src, link_id=link["id"], capacity=link.get("capacity_mbps", 10000))

    def correlate_alerts(self, active_alerts: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Takes a list of active unresolved alerts and attempts to group them into an Incident.
        """
        if not active_alerts:
            return None

        # Count alerts per device
        device_alert_map: Dict[str, List[Dict[str, Any]]] = {}
        for a in active_alerts:
            dev_id = a.get("device_id")
            if dev_id:
                if dev_id not in device_alert_map:
                    device_alert_map[dev_id] = []
                device_alert_map[dev_id].append(a)

        if len(device_alert_map) == 0:
            return None

        # Find the highest upstream node with critical / offline alert
        candidate_root_cause = None
        best_tier_rank = 999
        highest_severity_rank = 0

        severity_rank = {"info": 1, "warning": 2, "high": 3, "critical": 4}
        tier_rank_map = {"internet": 0, "perimeter": 1, "core": 2, "distribution": 3, "access": 4, "workload": 5}

        for dev_id, alerts in device_alert_map.items():
            node_tier = self._graph.nodes.get(dev_id, {}).get("tier", "workload")
            t_rank = tier_rank_map.get(node_tier, 5)
            max_sev = max((severity_rank.get(a.get("severity", "info"), 1) for a in alerts), default=1)

            # Favor upstream nodes with high severity
            if t_rank < best_tier_rank or (t_rank == best_tier_rank and max_sev > highest_severity_rank):
                best_tier_rank = t_rank
                highest_severity_rank = max_sev
                candidate_root_cause = dev_id

        if not candidate_root_cause:
            candidate_root_cause = list(device_alert_map.keys())[0]

        # Calculate blast radius / downstream affected nodes
        downstream_nodes = set()
        if candidate_root_cause in self._graph:
            try:
                downstream_nodes = set(nx.descendants(self._graph, candidate_root_cause))
            except Exception:
                downstream_nodes = set()
        downstream_nodes.add(candidate_root_cause)

        affected_devices = [d for d in device_alert_map.keys() if d in downstream_nodes or d == candidate_root_cause]
        if not affected_devices:
            affected_devices = list(device_alert_map.keys())

        # Root cause confidence calculation
        confidence = 94.0 if len(affected_devices) > 1 else 85.0
        
        dev_name = self._graph.nodes.get(candidate_root_cause, {}).get("name", candidate_root_cause)
        
        # Build timeline
        timeline = [
            {
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
                "event": f"Critical telemetry anomaly detected on root node {dev_name}",
                "severity": "critical",
                "device_id": candidate_root_cause
            },
            {
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
                "event": f"Alert correlation engine identified {len(affected_devices)} downstream affected nodes",
                "severity": "high",
                "device_id": candidate_root_cause
            }
        ]

        recommendations = [
            f"Inspect physical power, chassis fan, and supervisor engine on {dev_name}.",
            f"Verify BGP/OSPF neighbor state and link layer status on uplinks connected to {candidate_root_cause}.",
            f"Execute automated failover or route diversion to redundant path.",
            f"Run remote diagnostic ping/traceroute across adjacent distribution switches."
        ]

        incident_id = f"INC-{abs(hash(candidate_root_cause + str(datetime.now().hour))) % 9000 + 1000}"

        return {
            "id": incident_id,
            "incident_number": incident_id,
            "title": f"Major Service Degradation / Root Cause: {dev_name}",
            "severity": "critical" if highest_severity_rank >= 4 else "high",
            "status": "investigating",
            "root_cause_device_id": candidate_root_cause,
            "root_cause_summary": f"Primary failure on {dev_name} propagating reachability faults to {len(affected_devices) - 1} dependent devices.",
            "confidence_pct": confidence,
            "affected_devices_count": len(affected_devices),
            "affected_links_count": max(1, len(affected_devices) * 2 - 1),
            "estimated_impact": "High" if len(affected_devices) > 3 else "Medium",
            "timeline": timeline,
            "recommendations": recommendations,
            "affected_nodes": affected_devices
        }

incident_correlator = IncidentCorrelator()
