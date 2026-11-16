"""
Module 3: Traffic Density Estimation
Calculates vehicle density, queue length, occupancy percentage, and congestion level.
"""

from typing import List, Dict, Any
from config import VEHICLE_PCU_WEIGHTS, DENSITY_THRESHOLDS

class DensityEstimator:
    def __init__(self, road_length_meters: float = 120.0, num_lanes: int = 2):
        self.road_length = road_length_meters
        self.num_lanes = num_lanes
        self.average_vehicle_length = 4.5  # meters
        self.safety_gap = 1.5              # meters

    def calculate_density(self, detections: List[Dict[str, Any]], waiting_time_seconds: float = 0.0) -> Dict[str, Any]:
        """
        Takes detected vehicles on a road approach and computes traffic metrics.
        """
        raw_count = len(detections)
        pcu_total = 0.0
        breakdown = {"car": 0, "motorcycle": 0, "bus": 0, "truck": 0, "bicycle": 0}

        for det in detections:
            cls = det.get("class_name", "car")
            breakdown[cls] = breakdown.get(cls, 0) + 1
            weight = VEHICLE_PCU_WEIGHTS.get(cls, 1.0)
            pcu_total += weight

        # Estimate queue length (in meters)
        # Approximate queue length per lane: (vehicles in queue / lanes) * (avg length + gap)
        queue_length = round((raw_count / max(1, self.num_lanes)) * (self.average_vehicle_length + self.safety_gap), 1)
        queue_length = min(self.road_length, queue_length)

        # Occupancy percentage: queue_length / total road_length
        occupancy_pct = round((queue_length / self.road_length) * 100, 1)

        # Classify density level
        if raw_count <= 10:
            level = "Low"
            color = "#10B981"  # Emerald Green
        elif raw_count <= 25:
            level = "Medium"
            color = "#F59E0B"  # Amber
        elif raw_count <= 50:
            level = "High"
            color = "#EF4444"  # Red
        else:
            level = "Very High"
            color = "#7F1D1D"  # Deep Crimson Gridlock

        return {
            "vehicle_count": raw_count,
            "pcu_count": round(pcu_total, 2),
            "density_level": level,
            "color": color,
            "queue_length_meters": queue_length,
            "occupancy_percentage": occupancy_pct,
            "waiting_time_seconds": round(waiting_time_seconds, 1),
            "breakdown": breakdown
        }
