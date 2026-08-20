from typing import List, Dict, Any, Tuple

class HealthService:
    """
    Network Health Engine:
    Formula:
        Health Score = 30% Availability + 20% CPU + 15% Memory + 15% Bandwidth + 10% Latency + 10% Packet Loss
    Classification:
        90 - 100 -> Excellent (Green / Emerald)
        75 - 89  -> Healthy (Cyan / Blue)
        60 - 74  -> Warning (Yellow / Amber)
        40 - 59  -> Degraded (Orange)
        0  - 39  -> Critical (Red / Rose)
    """

    @staticmethod
    def classify_score(score: float) -> str:
        if score >= 90.0:
            return "Excellent"
        elif score >= 75.0:
            return "Healthy"
        elif score >= 60.0:
            return "Warning"
        elif score >= 40.0:
            return "Degraded"
        else:
            return "Critical"

    @classmethod
    def calculate_device_health(
        cls,
        status: str,
        cpu: float,
        memory: float,
        bandwidth_util_pct: float = 20.0,
        latency_ms: float = 3.0,
        packet_loss_pct: float = 0.0
    ) -> Tuple[float, Dict[str, float]]:
        # 1. Availability Score (0 - 100)
        if status == "offline":
            avail_score = 0.0
        elif status == "critical":
            avail_score = 25.0
        elif status == "warning" or status == "maintenance":
            avail_score = 70.0
        else:
            avail_score = 100.0

        # 2. CPU Score (0 - 100)
        # Optimal < 60%, drops between 60-100%
        if cpu <= 60.0:
            cpu_score = 100.0 - (cpu * 0.1)
        elif cpu <= 85.0:
            cpu_score = 94.0 - ((cpu - 60.0) * 1.5)
        else:
            cpu_score = max(0.0, 56.5 - ((cpu - 85.0) * 3.7))

        # 3. Memory Score (0 - 100)
        if memory <= 60.0:
            mem_score = 100.0 - (memory * 0.08)
        elif memory <= 85.0:
            mem_score = 95.2 - ((memory - 60.0) * 1.4)
        else:
            mem_score = max(0.0, 60.2 - ((memory - 85.0) * 4.0))

        # 4. Bandwidth Utilization Score (0 - 100)
        if bandwidth_util_pct <= 70.0:
            bw_score = 100.0 - (bandwidth_util_pct * 0.1)
        elif bandwidth_util_pct <= 90.0:
            bw_score = 93.0 - ((bandwidth_util_pct - 70.0) * 2.0)
        else:
            bw_score = max(0.0, 53.0 - ((bandwidth_util_pct - 90.0) * 5.0))

        # 5. Latency Score (0 - 100)
        # Baseline SLA is 10ms. > 100ms drops sharply.
        if latency_ms <= 15.0:
            lat_score = 100.0 - (latency_ms * 0.5)
        elif latency_ms <= 80.0:
            lat_score = max(20.0, 92.5 - ((latency_ms - 15.0) * 1.0))
        else:
            lat_score = max(0.0, 27.5 - ((latency_ms - 80.0) * 0.3))

        # 6. Packet Loss Score (0 - 100)
        # Baseline SLA < 0.1%. > 5% is critical.
        if packet_loss_pct <= 0.05:
            loss_score = 100.0
        elif packet_loss_pct <= 1.0:
            loss_score = 100.0 - (packet_loss_pct * 25.0)
        elif packet_loss_pct <= 5.0:
            loss_score = 75.0 - ((packet_loss_pct - 1.0) * 15.0)
        else:
            loss_score = max(0.0, 15.0 - ((packet_loss_pct - 5.0) * 3.0))

        # Weighted calculation
        total_score = (
            (0.30 * avail_score) +
            (0.20 * cpu_score) +
            (0.15 * mem_score) +
            (0.15 * bw_score) +
            (0.10 * lat_score) +
            (0.10 * loss_score)
        )

        total_score = round(max(0.0, min(100.0, total_score)), 1)

        breakdown = {
            "availability": round(avail_score, 1),
            "cpu": round(cpu_score, 1),
            "memory": round(mem_score, 1),
            "bandwidth": round(bw_score, 1),
            "latency": round(lat_score, 1),
            "packet_loss": round(loss_score, 1)
        }

        return total_score, breakdown

    @classmethod
    def calculate_global_health(
        cls,
        devices: List[Dict[str, Any]],
        links: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not devices:
            return {
                "overall_score": 100.0,
                "classification": "Excellent",
                "breakdown": {
                    "availability": 100.0,
                    "cpu": 100.0,
                    "memory": 100.0,
                    "bandwidth": 100.0,
                    "latency": 100.0,
                    "packet_loss": 100.0
                }
            }

        total_devices = len(devices)
        healthy_devices = sum(1 for d in devices if d.get("status") == "healthy")
        warning_devices = sum(1 for d in devices if d.get("status") == "warning")
        critical_devices = sum(1 for d in devices if d.get("status") == "critical")
        offline_devices = sum(1 for d in devices if d.get("status") == "offline")

        avg_cpu = sum(d.get("cpu_utilization", 20.0) for d in devices) / total_devices
        avg_mem = sum(d.get("memory_utilization", 40.0) for d in devices) / total_devices
        
        avg_bw = sum(l.get("utilization_pct", 20.0) for l in links) / max(1, len(links))
        avg_lat = sum(l.get("latency_ms", 3.0) for l in links) / max(1, len(links))
        avg_loss = sum(l.get("packet_loss_pct", 0.0) for l in links) / max(1, len(links))

        # Availability percentage
        avail_ratio = ((healthy_devices * 1.0) + (warning_devices * 0.7) + (critical_devices * 0.25)) / total_devices
        avail_score = avail_ratio * 100.0

        # CPU score
        if avg_cpu <= 60.0:
            cpu_score = 100.0 - (avg_cpu * 0.1)
        else:
            cpu_score = max(0.0, 94.0 - ((avg_cpu - 60.0) * 2.0))

        # Memory score
        if avg_mem <= 60.0:
            mem_score = 100.0 - (avg_mem * 0.08)
        else:
            mem_score = max(0.0, 95.2 - ((avg_mem - 60.0) * 1.8))

        # Bandwidth score
        if avg_bw <= 70.0:
            bw_score = 100.0 - (avg_bw * 0.1)
        else:
            bw_score = max(0.0, 93.0 - ((avg_bw - 70.0) * 2.5))

        # Latency score
        lat_score = max(0.0, min(100.0, 100.0 - (avg_lat * 0.8)))

        # Packet loss score
        loss_score = max(0.0, min(100.0, 100.0 - (avg_loss * 20.0)))

        overall = (
            (0.30 * avail_score) +
            (0.20 * cpu_score) +
            (0.15 * mem_score) +
            (0.15 * bw_score) +
            (0.10 * lat_score) +
            (0.10 * loss_score)
        )
        overall = round(max(0.0, min(100.0, overall)), 1)
        classification = cls.classify_score(overall)

        return {
            "overall_score": overall,
            "classification": classification,
            "availability_pct": round(avail_ratio * 100.0, 2),
            "breakdown": {
                "availability": round(avail_score, 1),
                "cpu": round(cpu_score, 1),
                "memory": round(mem_score, 1),
                "bandwidth": round(bw_score, 1),
                "latency": round(lat_score, 1),
                "packet_loss": round(loss_score, 1)
            },
            "summary": {
                "total_devices": total_devices,
                "healthy_devices": healthy_devices,
                "warning_devices": warning_devices,
                "critical_devices": critical_devices,
                "offline_devices": offline_devices,
                "avg_cpu": round(avg_cpu, 1),
                "avg_memory": round(avg_mem, 1),
                "avg_bandwidth_util": round(avg_bw, 1),
                "avg_latency_ms": round(avg_lat, 2),
                "avg_packet_loss_pct": round(avg_loss, 3)
            }
        }

health_service = HealthService()
