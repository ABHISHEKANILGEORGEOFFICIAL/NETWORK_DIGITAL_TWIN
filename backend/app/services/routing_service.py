from typing import List, Dict, Any, Optional
import networkx as nx

class RoutingService:
    """
    Network Routing & Path Analysis Service:
    - Calculates hop-by-hop forwarding paths using Dijkstra's shortest path
    - Aggregates latency, packet loss, and link bandwidth utilization across path
    - Flags bottleneck and unhealthy hops
    """
    def __init__(self):
        pass

    def build_graph(self, devices: List[Dict[str, Any]], links: List[Dict[str, Any]]) -> nx.Graph:
        G = nx.Graph()
        for dev in devices:
            G.add_node(dev["id"], **dev)

        for link in links:
            src = link["source_device_id"]
            tgt = link["target_device_id"]
            if src in G and tgt in G:
                # Link weight: prefer healthy, low-latency, high-capacity links
                is_up = link.get("status") == "up"
                latency = link.get("latency_ms", 3.0)
                loss = link.get("packet_loss_pct", 0.0)
                weight = latency + (loss * 50.0) + (0.0 if is_up else 10000.0)
                
                G.add_edge(src, tgt, link_data=link, weight=weight)
        return G

    def analyze_path(
        self,
        source_id: str,
        destination_id: str,
        devices: List[Dict[str, Any]],
        links: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        G = self.build_graph(devices, links)

        if source_id not in G or destination_id not in G:
            return None

        dev_lookup = {d["id"]: d for d in devices}

        try:
            path_node_ids = nx.shortest_path(G, source=source_id, target=destination_id, weight="weight")
        except nx.NetworkXNoPath:
            return {
                "source_id": source_id,
                "destination_id": destination_id,
                "path_found": False,
                "error": f"No active routing path exists between {source_id} and {destination_id}. A partitioned segment or disconnected link is blocking forwarding.",
                "hops": [],
                "total_latency_ms": 0.0,
                "total_packet_loss_pct": 100.0,
                "bottleneck_device": None
            }

        hops = []
        cumulative_latency = 0.0
        max_loss = 0.0
        bottleneck_device = None
        highest_utilization = 0.0

        for i, node_id in enumerate(path_node_ids):
            dev = dev_lookup.get(node_id, {})
            link_info = None
            link_lat = 0.0
            link_loss = 0.0
            link_util = 0.0

            if i > 0:
                prev_id = path_node_ids[i - 1]
                edge_data = G.get_edge_data(prev_id, node_id, {})
                link_info = edge_data.get("link_data", {})
                link_lat = link_info.get("latency_ms", 2.0)
                link_loss = link_info.get("packet_loss_pct", 0.0)
                link_util = link_info.get("utilization_pct", 15.0)
                
                cumulative_latency += link_lat
                max_loss = max(max_loss, link_loss)

                if link_util > highest_utilization:
                    highest_utilization = link_util
                    bottleneck_device = node_id

            hops.append({
                "hop_number": i + 1,
                "device_id": node_id,
                "device_name": dev.get("name", node_id),
                "device_type": dev.get("type", "unknown"),
                "ip_address": dev.get("ip_address", "0.0.0.0"),
                "status": dev.get("status", "healthy"),
                "cpu": dev.get("cpu_utilization", 20.0),
                "link_to_next": link_info.get("name") if link_info else None,
                "link_latency_ms": round(link_lat, 2),
                "link_loss_pct": round(link_loss, 3),
                "link_utilization_pct": round(link_util, 1),
                "is_healthy": dev.get("status") == "healthy" and link_loss < 1.0 and link_lat < 50.0
            })

        return {
            "source_id": source_id,
            "destination_id": destination_id,
            "path_found": True,
            "path_nodes": path_node_ids,
            "total_hops": len(hops),
            "total_latency_ms": round(cumulative_latency, 2),
            "max_packet_loss_pct": round(max_loss, 3),
            "highest_utilization_pct": round(highest_utilization, 1),
            "bottleneck_device": bottleneck_device or path_node_ids[-1],
            "hops": hops,
            "sla_compliant": cumulative_latency < 45.0 and max_loss < 0.5
        }

routing_service = RoutingService()
