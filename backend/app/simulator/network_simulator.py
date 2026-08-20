import asyncio
import copy
import math
import random
import time
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import uuid

from app.core.config import settings
from app.core.logging_config import logger
from app.simulator.topology_generator import generate_default_network_topology
from app.simulator.scenarios import SCENARIOS, ScenarioDefinition
from app.detection.anomaly_detector import anomaly_detector
from app.detection.correlation_engine import incident_correlator
from app.detection.predictive_engine import predictive_engine
from app.services.health_service import health_service
from app.websocket.connection_manager import connection_manager

class NetworkSimulator:
    """
    Core Autonomous Network Simulation & Digital Twin Engine:
    - Maintains the live digital state of all network devices, links, interfaces
    - Generates realistic continuous telemetry (CPU, Memory, Bandwidth, Latency, Loss, Errors)
    - Injects failure scenarios and recovers state upon completion
    - Performs live deterministic alert management with deduplication, lifecycle states (OPEN, ACKNOWLEDGED, RESOLVED), and history
    - Broadcasts high-frequency state updates to frontend clients over WebSockets
    """
    def __init__(self):
        self.is_running: bool = False
        self.is_paused: bool = False
        self.tick_count: int = 0
        self.simulated_time_seconds: int = 0
        self.events_generated: int = 0
        self.alerts_generated: int = 0
        self.current_scenario: str = "normal"
        self.scenario_start_time: Optional[float] = None
        self.scenario_duration: int = 0
        self.active_injections: List[Dict[str, Any]] = []

        # In-memory digital twin model
        self.devices: Dict[str, Dict[str, Any]] = {}
        self.interfaces: Dict[str, Dict[str, Any]] = {}
        self.links: Dict[str, Dict[str, Any]] = {}
        
        # Alerts state: active keyed by condition, history list
        self.active_alerts: Dict[str, Dict[str, Any]] = {}
        self.alert_history: List[Dict[str, Any]] = []
        
        # Digital Twin events log
        self.events: List[Dict[str, Any]] = []
        self.incidents: List[Dict[str, Any]] = []
        self.notifications: List[Dict[str, Any]] = []
        self.telemetry_history: Dict[str, List[Dict[str, Any]]] = {}
        
        # Diurnal load curve state
        self._time_offset = random.uniform(0, 1000)

    @property
    def alerts(self) -> List[Dict[str, Any]]:
        """Returns all currently active (OPEN / ACKNOWLEDGED) alerts."""
        return list(self.active_alerts.values())

    def get_all_alerts(self, severity: Optional[str] = None, status: Optional[str] = None, device_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns active and historical alerts filtered by criteria."""
        combined = list(self.active_alerts.values()) + list(self.alert_history)
        # Sort newest first
        combined.sort(key=lambda a: str(a.get("created_at", "")), reverse=True)

        results = combined
        if severity:
            sev_clean = severity.strip().lower()
            results = [a for a in results if str(a.get("severity", "")).lower() == sev_clean]
        if status:
            st_clean = status.strip().lower()
            if st_clean == "new":
                st_clean = "open"
            results = [a for a in results if str(a.get("status", "")).lower() == st_clean or (st_clean == "open" and str(a.get("status", "")).lower() == "new")]
        if device_id:
            results = [a for a in results if a.get("device_id") == device_id]

        return results

    def add_event(self, event_type: str, message: str, severity: str = "info", entity_id: Optional[str] = None):
        """Records a discrete state event into the Digital Twin event log."""
        self.events_generated += 1
        ev = {
            "id": f"EVT-{self.events_generated:06d}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": event_type,
            "message": message,
            "severity": severity,
            "entity_id": entity_id
        }
        self.events.insert(0, ev)
        if len(self.events) > 500:
            self.events.pop()

    def initialize_topology(self):
        """Initializes the baseline network graph topology."""
        raw = generate_default_network_topology()
        now_utc = datetime.now(timezone.utc)

        self.devices = {}
        for d in raw["devices"]:
            d_obj = dict(d)
            d_obj.setdefault("uptime_seconds", 864000)
            d_obj.setdefault("health_score", 100.0)
            d_obj.setdefault("last_seen_at", now_utc)
            self.devices[d["id"]] = d_obj

        self.interfaces = {}
        for i in raw["interfaces"]:
            i_obj = dict(i)
            i_obj.setdefault("last_updated", now_utc)
            self.interfaces[i["id"]] = i_obj

        self.links = {}
        for l in raw["links"]:
            l_obj = dict(l)
            l_obj.setdefault("last_updated", now_utc)
            self.links[l["id"]] = l_obj

        self.active_alerts = {}
        self.alert_history = []
        self.incidents = []
        self.notifications = []
        self.events = []
        self.telemetry_history = {d_id: [] for d_id in self.devices}

        self.add_event("system", "Digital Twin network topology initialized with 36 devices and 60 links.", "info")
        incident_correlator.build_topology_graph(list(self.devices.values()), list(self.links.values()))
        logger.info(f"Digital Twin initialized with {len(self.devices)} devices, {len(self.links)} links, {len(self.interfaces)} interfaces.")

    async def start(self):
        if self.is_running:
            return
        if not self.devices:
            self.initialize_topology()

        self.is_running = True
        logger.info("Network Simulator loop starting in background...")
        asyncio.create_task(self._simulation_loop())

    def stop(self):
        self.is_running = False
        logger.info("Network Simulator stopped.")

    def reset(self):
        logger.info("Resetting Digital Twin to baseline healthy state...")
        self.current_scenario = "normal"
        self.active_injections.clear()
        self.initialize_topology()

    def set_scenario(self, scenario_key: str, target_id: str = None, duration_seconds: int = 60, custom_params: dict = None) -> Dict[str, Any]:
        scenario = SCENARIOS.get(scenario_key)
        if not scenario:
            scenario_key = "normal"
            scenario = SCENARIOS["normal"]

        self.current_scenario = scenario_key
        self.scenario_start_time = time.time()
        self.scenario_duration = duration_seconds
        target = target_id or scenario.default_target

        injection = {
            "scenario": scenario_key,
            "target": target,
            "duration": duration_seconds,
            "start_time": time.time(),
            "custom_params": custom_params or {}
        }
        self.active_injections = [injection]

        logger.info(f"Activated simulation scenario '{scenario_key}' on target '{target}' for {duration_seconds}s.")
        
        self.add_event("scenario_applied", f"Simulation scenario '{scenario.name}' started on target '{target}'.", "warning" if scenario_key != "normal" else "info", target)
        
        self.add_notification(
            notif_type="simulation",
            title=f"Simulation Started: {scenario.name}",
            message=f"Injected scenario '{scenario.name}' on {target}. Expected duration: {duration_seconds}s.",
            severity="warning" if scenario_key != "normal" else "info"
        )
        return injection

    def add_notification(self, notif_type: str, title: str, message: str, severity: str = "info"):
        notif = {
            "id": f"NOTIF-{uuid.uuid4().hex[:8].upper()}",
            "type": notif_type,
            "title": title,
            "message": message,
            "severity": severity,
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.notifications.insert(0, notif)
        if len(self.notifications) > 100:
            self.notifications.pop()

    async def _simulation_loop(self):
        while self.is_running:
            try:
                if not self.is_paused:
                    self._tick()
                    await self._broadcast_live_state()
            except Exception as e:
                logger.error(f"Error in simulation loop tick: {e}", exc_info=True)
            
            await asyncio.sleep(settings.SIMULATION_INTERVAL_SECONDS)

    def _tick(self):
        self.tick_count += 1
        self.simulated_time_seconds += int(settings.SIMULATION_INTERVAL_SECONDS)
        now_utc = datetime.now(timezone.utc)

        # Check scenario timeout
        if self.scenario_start_time and self.scenario_duration > 0:
            elapsed = time.time() - self.scenario_start_time
            if elapsed >= self.scenario_duration:
                logger.info(f"Scenario '{self.current_scenario}' expired after {self.scenario_duration}s. Reverting to normal operation.")
                self.current_scenario = "normal"
                self.active_injections.clear()
                self._recover_devices_and_links()

        # Realistic diurnal factor for traffic patterns
        diurnal_factor = 0.5 + 0.5 * math.sin((self.simulated_time_seconds + self._time_offset) * 0.05)

        # Update devices
        for dev_id, dev in self.devices.items():
            if dev.get("status") == "offline":
                dev["cpu_utilization"] = 0.0
                dev["temperature_celsius"] = 24.0
                continue

            # Base CPU variation
            base_cpu = 15.0 if dev.get("tier") in ["access", "workload"] else 25.0
            noise = random.uniform(-2.5, 2.5)
            dev["cpu_utilization"] = max(5.0, min(99.0, base_cpu + (diurnal_factor * 15.0) + noise))
            
            # Base Memory variation
            base_mem = 35.0
            dev["memory_utilization"] = max(20.0, min(95.0, base_mem + (diurnal_factor * 10.0) + random.uniform(-1.0, 1.0)))

            # Temperature
            dev["temperature_celsius"] = max(25.0, 35.0 + (dev["cpu_utilization"] * 0.25) + random.uniform(-0.5, 0.5))
            dev["uptime_seconds"] = dev.get("uptime_seconds", 864000) + int(settings.SIMULATION_INTERVAL_SECONDS)
            dev["last_seen_at"] = now_utc

        # Update links
        for link_id, link in self.links.items():
            if link.get("status") == "down":
                link["utilization_pct"] = 0.0
                link["current_bandwidth_mbps"] = 0.0
                link["packet_loss_pct"] = 100.0
                continue

            cap = link.get("capacity_mbps", 10000)
            base_util = 18.0 + (diurnal_factor * 22.0) + random.uniform(-3.0, 3.0)
            link["utilization_pct"] = max(2.0, min(98.0, base_util))
            link["current_bandwidth_mbps"] = (link["utilization_pct"] / 100.0) * cap
            link["latency_ms"] = max(1.2, 2.5 + random.uniform(-0.4, 0.6) + (link["utilization_pct"] * 0.05))
            link["packet_loss_pct"] = max(0.0, round(random.uniform(0.001, 0.02), 4))
            link["jitter_ms"] = max(0.1, round(random.uniform(0.2, 0.8), 2))
            link["last_updated"] = now_utc

        # Update interfaces
        for if_id, iface in self.interfaces.items():
            if iface.get("status") == "down" or iface.get("admin_status") == "down":
                iface["utilization_pct"] = 0.0
                continue
            
            speed = iface.get("speed_mbps", 1000)
            iface["utilization_pct"] = max(1.0, min(95.0, 12.0 + (diurnal_factor * 20.0) + random.uniform(-2.0, 2.0)))
            delta_bytes = int((iface["utilization_pct"] / 100.0) * (speed * 125000) * settings.SIMULATION_INTERVAL_SECONDS)
            iface["rx_bytes"] = iface.get("rx_bytes", 0) + delta_bytes
            iface["tx_bytes"] = iface.get("tx_bytes", 0) + int(delta_bytes * 0.95)
            iface["rx_packets"] = iface.get("rx_packets", 0) + int(delta_bytes / 1400)
            iface["tx_packets"] = iface.get("tx_packets", 0) + int(delta_bytes / 1450)
            iface["last_updated"] = now_utc

        # Apply active scenario effects
        self._apply_active_scenario_effects()

        # Recalculate health scores per device
        for dev_id, dev in self.devices.items():
            health_sc, _ = health_service.calculate_device_health(
                status=dev.get("status", "healthy"),
                cpu=dev.get("cpu_utilization", 20.0),
                memory=dev.get("memory_utilization", 40.0)
            )
            dev["health_score"] = health_sc

            # Store telemetry history buffer
            point = {
                "timestamp": now_utc.isoformat(),
                "device_id": dev_id,
                "cpu": round(dev["cpu_utilization"], 1),
                "memory": round(dev["memory_utilization"], 1),
                "bandwidth_in_mbps": round(dev["cpu_utilization"] * 12.0, 1),
                "bandwidth_out_mbps": round(dev["cpu_utilization"] * 10.5, 1),
                "latency_ms": round(random.uniform(2.0, 4.0), 2),
                "packet_loss_pct": 0.0 if dev["status"] == "healthy" else 5.0,
                "temperature_celsius": round(dev["temperature_celsius"], 1),
                "status": dev["status"]
            }
            hist = self.telemetry_history.setdefault(dev_id, [])
            hist.append(point)
            if len(hist) > settings.TELEMETRY_HISTORY_LIMIT:
                hist.pop(0)

        # Deterministic Alert Evaluation with deduplication and state lifecycle
        self._evaluate_deterministic_alerts()

    def _apply_active_scenario_effects(self):
        scenario = self.current_scenario
        if scenario == "normal":
            return

        target_dev = "CORE-RTR-01"
        target_link = "LINK-INET-GW-01-FW-CORE-01"

        if self.active_injections:
            target = self.active_injections[0].get("target")
            if target in self.devices:
                target_dev = target
            if target in self.links:
                target_link = target

        if scenario == "router_failure":
            if target_dev in self.devices:
                self.devices[target_dev]["status"] = "offline"
                self.devices[target_dev]["cpu_utilization"] = 0.0
                self.devices[target_dev]["health_score"] = 0.0
            for l_id, l in self.links.items():
                if l["source_device_id"] == target_dev or l["target_device_id"] == target_dev:
                    l["status"] = "down"
                    l["utilization_pct"] = 0.0
                    l["packet_loss_pct"] = 100.0

        elif scenario == "switch_failure":
            target_sw = target_dev if target_dev in self.devices else "DIST-SW-01"
            if target_sw in self.devices:
                self.devices[target_sw]["status"] = "offline"
                self.devices[target_sw]["cpu_utilization"] = 0.0
                self.devices[target_sw]["health_score"] = 0.0
            for l_id, l in self.links.items():
                if l["source_device_id"] == target_sw or l["target_device_id"] == target_sw:
                    l["status"] = "down"
                    l["packet_loss_pct"] = 100.0

        elif scenario == "link_failure":
            if target_link in self.links:
                self.links[target_link]["status"] = "down"
                self.links[target_link]["utilization_pct"] = 0.0
                self.links[target_link]["packet_loss_pct"] = 100.0

        elif scenario == "congestion":
            if target_link in self.links:
                self.links[target_link]["status"] = "congested"
                self.links[target_link]["utilization_pct"] = 98.4
                self.links[target_link]["packet_loss_pct"] = 6.8
                self.links[target_link]["latency_ms"] = 145.0
                self.links[target_link]["jitter_ms"] = 18.2

        elif scenario == "high_cpu":
            target_cpu_dev = target_dev if target_dev in self.devices else "CORE-RTR-02"
            if target_cpu_dev in self.devices:
                self.devices[target_cpu_dev]["status"] = "critical"
                self.devices[target_cpu_dev]["cpu_utilization"] = 96.8
                self.devices[target_cpu_dev]["temperature_celsius"] = 72.5

        elif scenario == "packet_loss":
            loss_link = target_link if target_link in self.links else "LINK-ACC-SW-02-SRV-DB-PRIMARY"
            if loss_link in self.links:
                self.links[loss_link]["status"] = "degraded"
                self.links[loss_link]["packet_loss_pct"] = 12.8
                self.links[loss_link]["latency_ms"] = 48.0

        elif scenario == "latency_spike":
            lat_link = target_link if target_link in self.links else "LINK-INET-GW-01-FW-CORE-01"
            if lat_link in self.links:
                self.links[lat_link]["status"] = "degraded"
                self.links[lat_link]["latency_ms"] = 245.0
                self.links[lat_link]["jitter_ms"] = 42.0

        elif scenario == "custom":
            params = self.active_injections[0].get("custom_params", {}) if self.active_injections else {}
            if target_dev in self.devices:
                if "cpu" in params:
                    self.devices[target_dev]["cpu_utilization"] = float(params["cpu"])
                if "memory" in params:
                    self.devices[target_dev]["memory_utilization"] = float(params["memory"])
                if "status" in params:
                    self.devices[target_dev]["status"] = str(params["status"])

    def _recover_devices_and_links(self):
        for dev in self.devices.values():
            if dev["status"] in ["offline", "critical", "warning"]:
                dev["status"] = "healthy"
                dev["cpu_utilization"] = 20.0
                dev["memory_utilization"] = 40.0
        for link in self.links.values():
            if link["status"] in ["down", "congested", "degraded"]:
                link["status"] = "up"
                link["utilization_pct"] = 22.0
                link["packet_loss_pct"] = 0.01
                link["latency_ms"] = 3.5
        self.add_event("recovery", "All digital twin devices and links recovered to nominal state.", "info")

    def _evaluate_deterministic_alerts(self):
        """
        Evaluates deterministic alert rules for all devices and links.
        Maintains ongoing alerts without duplicating IDs or resetting acknowledged statuses.
        Automatically transitions resolved conditions to RESOLVED status with history tracking.
        """
        current_detected_conditions: Dict[str, Dict[str, Any]] = {}
        now_iso = datetime.now(timezone.utc).isoformat()

        # 1. Device Offline Rule (CRITICAL)
        for dev_id, dev in self.devices.items():
            if dev.get("status") == "offline":
                cond_key = f"{dev_id}:device_reachability"
                current_detected_conditions[cond_key] = {
                    "device_id": dev_id,
                    "device_name": dev["name"],
                    "severity": "critical",
                    "metric_name": "device_reachability",
                    "metric_value": 0.0,
                    "threshold_value": 1.0,
                    "title": f"CRITICAL: {dev['name']} is Offline",
                    "description": f"Chassis heartbeat failed. Device {dev['name']} ({dev['ip_address']}) is unreachable in the Digital Twin.",
                    "suggested_action": "Check upstream power feed, supervisor module, and out-of-band console."
                }

        # 2. High CPU Rule (CRITICAL >= 90%, WARNING >= 75%)
        for dev_id, dev in self.devices.items():
            cpu = dev.get("cpu_utilization", 0.0)
            if dev.get("status") != "offline" and cpu >= 75.0:
                sev = "critical" if cpu >= 90.0 else "warning"
                cond_key = f"{dev_id}:cpu"
                current_detected_conditions[cond_key] = {
                    "device_id": dev_id,
                    "device_name": dev["name"],
                    "severity": sev,
                    "metric_name": "cpu",
                    "metric_value": round(cpu, 1),
                    "threshold_value": 90.0 if sev == "critical" else 75.0,
                    "title": f"{sev.upper()}: {dev['name']} High CPU Load ({cpu:.1f}%)",
                    "description": f"Control plane CPU utilization is elevated at {cpu:.1f}%.",
                    "suggested_action": "Inspect high-CPU routing processes, control-plane policing, or traffic bursts."
                }

        # 3. High Memory Rule (HIGH >= 90%, WARNING >= 80%)
        for dev_id, dev in self.devices.items():
            mem = dev.get("memory_utilization", 0.0)
            if dev.get("status") != "offline" and mem >= 80.0:
                sev = "high" if mem >= 90.0 else "warning"
                cond_key = f"{dev_id}:memory"
                current_detected_conditions[cond_key] = {
                    "device_id": dev_id,
                    "device_name": dev["name"],
                    "severity": sev,
                    "metric_name": "memory",
                    "metric_value": round(mem, 1),
                    "threshold_value": 90.0 if sev == "high" else 80.0,
                    "title": f"{sev.upper()}: {dev['name']} High Memory Usage ({mem:.1f}%)",
                    "description": f"System RAM utilization is elevated at {mem:.1f}%.",
                    "suggested_action": "Verify BGP routing table size, memory leak diagnostics, or restart daemon."
                }

        # 4. Link Down Rule (CRITICAL)
        for link_id, link in self.links.items():
            if link.get("status") == "down":
                cond_key = f"{link_id}:link_state"
                current_detected_conditions[cond_key] = {
                    "device_id": link["source_device_id"],
                    "device_name": self.devices.get(link["source_device_id"], {}).get("name", link["source_device_id"]),
                    "link_id": link_id,
                    "severity": "critical",
                    "metric_name": "link_state",
                    "metric_value": 0.0,
                    "threshold_value": 1.0,
                    "title": f"CRITICAL: Link {link['name']} is Down",
                    "description": f"Physical/logical link carrier down between {link['source_device_id']} and {link['target_device_id']}.",
                    "suggested_action": "Check transceiver link state, physical patch, and SFP optics."
                }

        # 5. Link Congestion / High Utilization Rule (HIGH >= 90%, WARNING >= 80%)
        for link_id, link in self.links.items():
            util = link.get("utilization_pct", 0.0)
            if link.get("status") != "down" and util >= 80.0:
                sev = "high" if util >= 90.0 else "warning"
                cond_key = f"{link_id}:bandwidth"
                current_detected_conditions[cond_key] = {
                    "device_id": link["source_device_id"],
                    "device_name": self.devices.get(link["source_device_id"], {}).get("name", link["source_device_id"]),
                    "link_id": link_id,
                    "severity": sev,
                    "metric_name": "bandwidth",
                    "metric_value": round(util, 1),
                    "threshold_value": 90.0 if sev == "high" else 80.0,
                    "title": f"{sev.upper()}: High Bandwidth on {link['name']} ({util:.1f}%)",
                    "description": f"Link bandwidth utilization is near saturation capacity at {util:.1f}%.",
                    "suggested_action": "Enable QoS shaping, re-route bulk traffic, or upgrade capacity."
                }

        # 6. High Latency Rule (HIGH >= 100ms, WARNING >= 50ms)
        for link_id, link in self.links.items():
            lat = link.get("latency_ms", 0.0)
            if link.get("status") != "down" and lat >= 50.0:
                sev = "high" if lat >= 100.0 else "warning"
                cond_key = f"{link_id}:latency"
                current_detected_conditions[cond_key] = {
                    "device_id": link["source_device_id"],
                    "device_name": self.devices.get(link["source_device_id"], {}).get("name", link["source_device_id"]),
                    "link_id": link_id,
                    "severity": sev,
                    "metric_name": "latency",
                    "metric_value": round(lat, 1),
                    "threshold_value": 100.0 if sev == "high" else 50.0,
                    "title": f"{sev.upper()}: Latency Spike on {link['name']} ({lat:.1f}ms)",
                    "description": f"Round-trip latency on link has degraded to {lat:.1f}ms.",
                    "suggested_action": "Investigate queue buffering, transit provider jitter, or route flap."
                }

        # 7. Packet Loss Rule (CRITICAL >= 5%, WARNING >= 2%)
        for link_id, link in self.links.items():
            loss = link.get("packet_loss_pct", 0.0)
            if link.get("status") != "down" and loss >= 2.0:
                sev = "critical" if loss >= 5.0 else "warning"
                cond_key = f"{link_id}:packet_loss"
                current_detected_conditions[cond_key] = {
                    "device_id": link["source_device_id"],
                    "device_name": self.devices.get(link["source_device_id"], {}).get("name", link["source_device_id"]),
                    "link_id": link_id,
                    "severity": sev,
                    "metric_name": "packet_loss",
                    "metric_value": round(loss, 2),
                    "threshold_value": 5.0 if sev == "critical" else 2.0,
                    "title": f"{sev.upper()}: Packet Loss on {link['name']} ({loss:.1f}%)",
                    "description": f"CRC frame drops / buffer overruns observed with {loss:.1f}% packet drop rate.",
                    "suggested_action": "Inspect interface input errors, cable degradation, and CRC counter."
                }

        # --- Reconcile active alerts vs current detected conditions ---
        # 1. Update existing active alerts or create new ones
        for cond_key, cond_data in current_detected_conditions.items():
            if cond_key in self.active_alerts:
                # Update continuous metric value without resetting status or id
                existing = self.active_alerts[cond_key]
                existing["metric_value"] = cond_data["metric_value"]
                existing["severity"] = cond_data["severity"]
            else:
                # Brand new alert
                self.alerts_generated += 1
                new_id = f"ALT-{self.alerts_generated:05d}"
                alert_obj = {
                    "id": new_id,
                    "device_id": cond_data["device_id"],
                    "device_name": cond_data.get("device_name"),
                    "link_id": cond_data.get("link_id"),
                    "interface_id": cond_data.get("interface_id"),
                    "severity": cond_data["severity"],
                    "metric_name": cond_data["metric_name"],
                    "metric_value": cond_data.get("metric_value"),
                    "threshold_value": cond_data.get("threshold_value"),
                    "title": cond_data["title"],
                    "description": cond_data["description"],
                    "suggested_action": cond_data.get("suggested_action"),
                    "status": "open",
                    "created_at": now_iso,
                    "resolved_at": None
                }
                self.active_alerts[cond_key] = alert_obj
                self.add_event("alert_triggered", f"Alert triggered: {cond_data['title']}", cond_data["severity"], cond_data["device_id"])

        # 2. Check for resolved conditions
        resolved_keys = [k for k in self.active_alerts.keys() if k not in current_detected_conditions]
        for r_key in resolved_keys:
            resolved_alert = self.active_alerts.pop(r_key)
            resolved_alert["status"] = "resolved"
            resolved_alert["resolved_at"] = now_iso
            self.alert_history.insert(0, resolved_alert)
            if len(self.alert_history) > 200:
                self.alert_history.pop()
            self.add_event("alert_resolved", f"Alert resolved: {resolved_alert['title']}", "info", resolved_alert.get("device_id"))

        # 3. Incident Correlation
        active_list = list(self.active_alerts.values())
        if len(active_list) > 0:
            incident = incident_correlator.correlate_alerts(active_list)
            if incident:
                self.incidents = [incident]
        else:
            self.incidents = []

    def update_alert_status(self, alert_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        """Updates alert status between OPEN, ACKNOWLEDGED, and RESOLVED."""
        status_clean = new_status.strip().lower()
        if status_clean == "new":
            status_clean = "open"

        # Check active alerts
        for cond_key, alert in list(self.active_alerts.items()):
            if alert["id"] == alert_id:
                if status_clean == "resolved":
                    resolved = self.active_alerts.pop(cond_key)
                    resolved["status"] = "resolved"
                    resolved["resolved_at"] = datetime.now(timezone.utc).isoformat()
                    self.alert_history.insert(0, resolved)
                    self.add_event("alert_resolved", f"Alert manually resolved: {alert['title']}", "info", alert.get("device_id"))
                    return resolved
                else:
                    alert["status"] = status_clean
                    self.add_event("alert_updated", f"Alert status changed to {status_clean.upper()}: {alert['title']}", "info", alert.get("device_id"))
                    return alert

        # Check history
        for alert in self.alert_history:
            if alert["id"] == alert_id:
                alert["status"] = status_clean
                return alert

        return None

    async def _broadcast_live_state(self):
        health_data = health_service.calculate_global_health(
            list(self.devices.values()),
            list(self.links.values())
        )

        global_frame = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "network_health_score": health_data["overall_score"],
            "health_classification": health_data["classification"],
            "availability_pct": health_data["availability_pct"],
            "breakdown": health_data["breakdown"],
            "total_devices": len(self.devices),
            "healthy_devices": health_data["summary"]["healthy_devices"],
            "warning_devices": health_data["summary"]["warning_devices"],
            "critical_devices": health_data["summary"]["critical_devices"],
            "offline_devices": health_data["summary"]["offline_devices"],
            "total_interfaces": len(self.interfaces),
            "total_links": len(self.links),
            "total_bandwidth_gbps": round(sum(l.get("current_bandwidth_mbps", 0) for l in self.links.values()) / 1000.0, 2),
            "avg_latency_ms": health_data["summary"]["avg_latency_ms"],
            "avg_packet_loss_pct": health_data["summary"]["avg_packet_loss_pct"],
            "active_alerts_count": len(self.active_alerts),
            "critical_alerts_count": sum(1 for a in self.active_alerts.values() if a["severity"] == "critical"),
            "open_incidents_count": len(self.incidents),
            "current_scenario": self.current_scenario,
            "twin_sync_rate_pct": 99.8,
            "twin_accuracy_pct": 98.7
        }

        await connection_manager.broadcast_telemetry({
            "type": "TELEMETRY_UPDATE",
            "data": global_frame,
            "device_sample": [
                {
                    "id": d["id"],
                    "name": d["name"],
                    "type": d["type"],
                    "status": d["status"],
                    "cpu": round(d["cpu_utilization"], 1),
                    "memory": round(d["memory_utilization"], 1),
                    "health_score": d.get("health_score", 100.0)
                }
                for d in list(self.devices.values())[:10]
            ]
        })

        if self.active_alerts or self.alert_history:
            await connection_manager.broadcast_alert({
                "type": "ALERTS_UPDATE",
                "alerts": list(self.active_alerts.values()),
                "incidents": self.incidents
            })

    def restart_device(self, device_id: str) -> Dict[str, Any]:
        dev = self.devices.get(device_id)
        if not dev:
            return {"success": False, "message": f"Device {device_id} not found."}
        
        dev["status"] = "healthy"
        dev["cpu_utilization"] = 18.0
        dev["memory_utilization"] = 35.0
        dev["uptime_seconds"] = 12
        
        self.add_event("device_restarted", f"Device {dev['name']} ({dev['ip_address']}) restarted successfully in Digital Twin.", "info", device_id)
        
        self.add_notification(
            notif_type="system",
            title=f"Device Restarted: {dev['name']}",
            message=f"Simulated hardware reboot executed successfully on digital twin {dev['name']}.",
            severity="info"
        )
        return {"success": True, "message": f"Device {device_id} successfully restarted in Digital Twin."}

    def set_interface_status(self, if_id: str, status: str) -> Dict[str, Any]:
        iface = self.interfaces.get(if_id)
        if not iface:
            return {"success": False, "message": f"Interface {if_id} not found."}
        
        iface["status"] = status
        iface["admin_status"] = status
        
        self.add_event("interface_state_change", f"Interface {iface['name']} on device {iface['device_id']} set to {status.upper()}.", "warning" if status == "down" else "info", iface["device_id"])
        
        self.add_notification(
            notif_type="system",
            title=f"Interface {status.upper()}: {iface['name']}",
            message=f"Interface {if_id} state modified to '{status}' in Digital Twin.",
            severity="warning" if status == "down" else "info"
        )
        return {"success": True, "message": f"Interface {if_id} state set to {status}."}

simulator = NetworkSimulator()
