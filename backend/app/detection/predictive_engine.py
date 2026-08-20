import math
from typing import List, Dict, Any, Optional

class PredictiveEngine:
    """
    Time-series trend analyzer and predictive capacity exhaustion engine:
    - Calculates linear slope and velocity for continuous telemetry metrics
    - Estimates time-to-saturation / threshold breach
    - Generates proactive predictive risk warnings before SLA violations occur
    """
    def __init__(self):
        pass

    def calculate_trend_and_forecast(
        self,
        device_id: str,
        device_name: str,
        metric_name: str,
        values: List[float],
        warning_threshold: float = 80.0,
        critical_threshold: float = 95.0,
        sample_interval_sec: float = 2.0
    ) -> Optional[Dict[str, Any]]:
        if len(values) < 6:
            return None

        # Linear regression slope: y = m*x + c
        n = len(values)
        x_vals = list(range(n))
        x_mean = sum(x_vals) / n
        y_mean = sum(values) / n

        numerator = sum((x_vals[i] - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((x_vals[i] - x_mean) ** 2 for i in range(n))

        if denominator == 0:
            return None

        slope = numerator / denominator  # delta units per sample tick
        current_val = values[-1]

        # If metric is already critical or trend is steady/declining, skip predictive forecast
        if current_val >= critical_threshold or slope <= 0.05:
            return None

        # Estimate samples until critical threshold
        remaining_gap = critical_threshold - current_val
        samples_to_breach = remaining_gap / slope
        seconds_to_breach = samples_to_breach * sample_interval_sec
        minutes_to_breach = max(1, int(seconds_to_breach / 60))

        # Risk classification
        if current_val >= 75.0 or minutes_to_breach <= 30:
            risk = "HIGH"
            urgency = "critical"
        elif current_val >= 60.0 or minutes_to_breach <= 60:
            risk = "MEDIUM"
            urgency = "warning"
        else:
            risk = "LOW"
            urgency = "info"

        return {
            "device_id": device_id,
            "device_name": device_name,
            "metric": metric_name,
            "current_value": round(current_val, 1),
            "trend": "Increasing rapidly" if slope > 0.5 else "Increasing",
            "slope_per_min": round(slope * (60.0 / sample_interval_sec), 2),
            "estimated_breach_minutes": minutes_to_breach,
            "risk": risk,
            "urgency": urgency,
            "title": f"Predictive Warning: {device_name} {metric_name.upper()} Saturation",
            "suggested_action": f"Preemptively shed non-critical load or re-route flows before {metric_name} breaches {critical_threshold}% in ~{minutes_to_breach} mins."
        }

predictive_engine = PredictiveEngine()
