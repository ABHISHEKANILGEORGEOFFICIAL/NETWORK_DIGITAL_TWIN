import math
from typing import Dict, List, Optional, Tuple

class AnomalyDetector:
    """
    Statistical Anomaly Detection Engine:
    - Maintains sliding window history for continuous metrics
    - Computes rolling mean and standard deviation
    - Evaluates Z-score (deviation in standard errors from baseline)
    - Triggers statistical anomaly when |Z| >= 3.0 or critical threshold is breached
    """
    def __init__(self, window_size: int = 30):
        self.window_size = window_size
        self._metric_history: Dict[str, List[float]] = {}  # key: "device_id:metric"

    def record_and_evaluate(
        self,
        entity_id: str,
        metric_name: str,
        current_value: float,
        warning_threshold: float,
        critical_threshold: float,
        min_std_dev: float = 1.0
    ) -> Tuple[bool, float, Optional[str], Optional[str]]:
        """
        Returns:
            (is_anomaly, z_score, severity, description)
        """
        history_key = f"{entity_id}:{metric_name}"
        if history_key not in self._metric_history:
            self._metric_history[history_key] = []
        
        history = self._metric_history[history_key]
        history.append(current_value)
        if len(history) > self.window_size:
            history.pop(0)

        # Baseline stats
        if len(history) < 5:
            # Not enough samples for statistical Z-Score, evaluate absolute threshold
            if current_value >= critical_threshold:
                return (True, 4.0, "critical", f"{metric_name} exceeded critical threshold {critical_threshold} (Current: {current_value:.1f})")
            elif current_value >= warning_threshold:
                return (True, 2.5, "warning", f"{metric_name} exceeded warning threshold {warning_threshold} (Current: {current_value:.1f})")
            return (False, 0.0, None, None)

        mean = sum(history) / len(history)
        variance = sum((x - mean) ** 2 for x in history) / len(history)
        std_dev = max(math.sqrt(variance), min_std_dev)
        z_score = (current_value - mean) / std_dev

        # Evaluate both absolute and statistical deviation
        if current_value >= critical_threshold or z_score >= 3.5:
            severity = "critical"
            desc = f"{entity_id} {metric_name} severe anomaly (Value: {current_value:.1f}, Z-score: +{z_score:.1f}σ, Baseline: {mean:.1f})"
            return (True, z_score, severity, desc)
        elif current_value >= warning_threshold or z_score >= 2.5:
            severity = "warning"
            desc = f"{entity_id} {metric_name} elevated deviation (Value: {current_value:.1f}, Z-score: +{z_score:.1f}σ, Baseline: {mean:.1f})"
            return (True, z_score, severity, desc)

        return (False, z_score, None, None)

anomaly_detector = AnomalyDetector(window_size=30)
