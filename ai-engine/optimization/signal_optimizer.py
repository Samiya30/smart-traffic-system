"""
Module 4: Dynamic Traffic Signal Optimization
Computes priority scores and dynamic green allocations using multi-factor traffic metrics.
"""

from typing import List, Dict, Any, Tuple
from config import DEFAULT_SIGNAL_CONFIG

class SignalOptimizer:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = {**DEFAULT_SIGNAL_CONFIG, **(config or {})}
        self.current_phase = "North"
        self.phase_state = "GREEN"  # "GREEN", "YELLOW", "ALL_RED"
        self.phase_time_elapsed = 0
        self.current_allocated_green = self.config["g_min"]

    def update_config(self, new_config: Dict[str, Any]):
        self.config.update(new_config)

    def calculate_priority_scores(self, approaches_data: Dict[str, Dict[str, Any]]) -> Dict[str, float]:
        """
        Calculates priority score for each direction using:
        P_i = w_v * V_i + w_q * Q_i + w_w * W_i
        """
        w_v = self.config["weight_vehicles"]
        w_q = self.config["weight_queue"]
        w_w = self.config["weight_waiting"]

        # Collect raw values
        vehicles = {d: data.get("vehicle_count", 0) for d, data in approaches_data.items()}
        queues = {d: data.get("queue_length_meters", 0.0) for d, data in approaches_data.items()}
        waits = {d: data.get("waiting_time_seconds", 0.0) for d, data in approaches_data.items()}

        max_v = max(max(vehicles.values(), default=1), 1)
        max_q = max(max(queues.values(), default=1.0), 1.0)
        max_w = max(max(waits.values(), default=1.0), 1.0)

        scores = {}
        for d in approaches_data.keys():
            # Normalized values in [0, 1]
            norm_v = vehicles[d] / max_v
            norm_q = queues[d] / max_q
            norm_w = waits[d] / max_w

            # Anti-starvation boost
            if waits[d] >= self.config["starvation_threshold"]:
                norm_w = norm_w * 2.0

            p_i = (w_v * norm_v) + (w_q * norm_q) + (w_w * norm_w)
            scores[d] = round(max(p_i, 0.05), 4)

        return scores

    def calculate_green_durations(self, priority_scores: Dict[str, float]) -> Dict[str, int]:
        """
        Calculates green durations:
        G_i = G_min + (P_i / sum(P_j)) * (G_max - G_min)
        Clamped between [G_min, G_max]
        """
        g_min = self.config["g_min"]
        g_max = self.config["g_max"]
        total_score = sum(priority_scores.values())

        durations = {}
        if total_score <= 0:
            for d in priority_scores:
                durations[d] = g_min
            return durations

        for d, score in priority_scores.items():
            ratio = score / total_score
            calculated_g = g_min + ratio * (g_max - g_min)
            # Clamp between G_min and G_max
            clamped_g = int(round(max(g_min, min(g_max, calculated_g))))
            durations[d] = clamped_g

        return durations

    def get_next_recommended_phase(
        self,
        approaches_data: Dict[str, Dict[str, Any]],
        emergency_direction: str = None
    ) -> Dict[str, Any]:
        """
        Evaluates current traffic state and returns the optimal phase and green time.
        If emergency_direction is active, triggers immediate priority preemption.
        """
        # Emergency preemption overrides regular cycle
        if emergency_direction and emergency_direction in approaches_data:
            return {
                "selected_direction": emergency_direction,
                "allocated_green": self.config["g_max"],
                "reason": f"EMERGENCY VEHICLE PREEMPTION on {emergency_direction}",
                "is_emergency": True,
                "all_scores": {d: 1.0 if d == emergency_direction else 0.1 for d in approaches_data},
                "all_green_times": {d: self.config["g_max"] if d == emergency_direction else self.config["g_min"] for d in approaches_data}
            }

        scores = self.calculate_priority_scores(approaches_data)
        durations = self.calculate_green_durations(scores)

        # Pick approach with highest priority score
        best_direction = max(scores, key=scores.get)

        return {
            "selected_direction": best_direction,
            "allocated_green": durations[best_direction],
            "reason": f"Highest priority score ({scores[best_direction]}) based on traffic density & wait time",
            "is_emergency": False,
            "all_scores": scores,
            "all_green_times": durations,
            "yellow_time": self.config["yellow_time"],
            "all_red_time": self.config["all_red_time"]
        }
