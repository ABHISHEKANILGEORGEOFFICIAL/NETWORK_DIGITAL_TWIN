"""
NetTwin Core Integration Contracts & Extension Interfaces

This module defines the clean abstract interfaces and protocols for:
1. Real Network Telemetry Providers (SNMP, gNMI, NetFlow, Streaming Telemetry)
2. Advanced Digital Twin Simulation Engines
3. AI, Anomaly & Predictive Maintenance Engines
4. Notification Providers (Email, Slack, Webhooks, PagerDuty)

Other developers can implement these contracts without modifying core business logic.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Protocol, runtime_checkable
from datetime import datetime


# =====================================================================
# 1. Telemetry Provider Interface (For Real Network Ingestion)
# =====================================================================

@runtime_checkable
class TelemetryProvider(Protocol):
    """
    Interface for real-world network data ingestion (SNMP, gNMI, NetFlow, RESTCONF).
    Implementations collect raw telemetry from physical hardware and feed the Digital Twin.
    """

    async def connect(self, endpoint: str, credentials: Dict[str, Any]) -> bool:
        """Establishes authenticated connection with physical device or collector."""
        ...

    async def poll_device_metrics(self, device_id: str) -> Dict[str, Any]:
        """
        Polls live device counters.
        Returns:
            {
                "cpu_utilization": float,
                "memory_utilization": float,
                "temperature_celsius": float,
                "uptime_seconds": int
            }
        """
        ...

    async def poll_interface_counters(self, device_id: str, interface_id: str) -> Dict[str, Any]:
        """
        Polls live interface MIB counters.
        Returns:
            {
                "rx_bytes": int,
                "tx_bytes": int,
                "rx_errors": int,
                "tx_errors": int,
                "utilization_pct": float,
                "status": "up" | "down"
            }
        """
        ...

    async def stream_telemetry(self, callback) -> None:
        """Subscribes to gNMI / NetFlow push telemetry stream."""
        ...


# =====================================================================
# 2. Advanced Digital Twin Simulation Engine Contract
# =====================================================================

class BaseSimulationEngine(ABC):
    """
    Base contract for advanced physical-digital simulation models.
    Supports continuous state updates, failure injections, and discrete-event simulation.
    """

    @abstractmethod
    def initialize_model(self, topology: Dict[str, Any]) -> None:
        """Initializes graph nodes, links, and baseline properties."""
        pass

    @abstractmethod
    def step_simulation(self, delta_time_seconds: float) -> Dict[str, Any]:
        """Advances the internal simulation model clock and returns updated state."""
        pass

    @abstractmethod
    def inject_failure(self, target_id: str, failure_type: str, parameters: Dict[str, Any]) -> bool:
        """Applies an intentional failure or degradation to a device or link."""
        pass

    @abstractmethod
    def recover_entity(self, target_id: str) -> bool:
        """Reverts failure injections and restores nominal behavior."""
        pass


# =====================================================================
# 3. AI & Predictive Maintenance Contract
# =====================================================================

class BaseAIEngine(ABC):
    """
    Contract for AI/ML inference, root-cause correlation, and capacity forecasting.
    """

    @abstractmethod
    def analyze_anomalies(self, telemetry_buffer: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Evaluates statistical or deep-learning anomaly models."""
        pass

    @abstractmethod
    def correlate_root_cause(self, active_alerts: List[Dict[str, Any]], topology_graph: Any) -> Optional[Dict[str, Any]]:
        """Identifies root-cause failure and isolates cascading symptoms."""
        pass

    @abstractmethod
    def forecast_capacity(self, historical_series: List[float], horizon_hours: int) -> Dict[str, Any]:
        """Predicts time-to-exhaustion or capacity saturation."""
        pass


# =====================================================================
# 4. Notification Provider Contract (Email, Slack, Webhook)
# =====================================================================

class BaseNotificationProvider(ABC):
    """
    Contract for external alert dispatchers (Email, SMS, Webhooks, PagerDuty).
    """

    @abstractmethod
    async def send_alert_notification(
        self,
        alert: Dict[str, Any],
        recipients: List[str],
        channel: str = "email"
    ) -> bool:
        """Dispatches an alert notification payload to external services."""
        pass

    @abstractmethod
    async def send_incident_digest(
        self,
        incident: Dict[str, Any],
        recipients: List[str]
    ) -> bool:
        """Dispatches an executive incident report digest."""
        pass
