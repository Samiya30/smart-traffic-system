"""
Module 9: Traffic Simulation Generator
Generates vehicle arrival streams and patterns (rush hour, unbalanced, night, emergency surge).
"""

import random
from typing import Dict, Any, List

class TrafficGenerator:
    PATTERNS = {
        "balanced": {"North": 15, "South": 15, "East": 15, "West": 15},
        "morning_rush": {"North": 45, "South": 12, "East": 35, "West": 8},
        "evening_rush": {"North": 14, "South": 48, "East": 10, "West": 40},
        "unbalanced": {"North": 50, "South": 5, "East": 8, "West": 2},
        "night": {"North": 3, "South": 2, "East": 4, "West": 2}
    }

    VEHICLE_TYPE_DISTRIBUTION = [
        ("car", 0.60),
        ("motorcycle", 0.20),
        ("bus", 0.10),
        ("truck", 0.08),
        ("bicycle", 0.02)
    ]

    def __init__(self, pattern: str = "morning_rush"):
        self.pattern_name = pattern
        self.base_densities = self.PATTERNS.get(pattern, self.PATTERNS["morning_rush"]).copy()

    def set_pattern(self, pattern_name: str):
        if pattern_name in self.PATTERNS:
            self.pattern_name = pattern_name
            self.base_densities = self.PATTERNS[pattern_name].copy()

    def generate_step(self, time_delta: float = 1.0) -> Dict[str, Dict[str, Any]]:
        """
        Simulates slight fluctuation in arrivals for each direction.
        """
        result = {}
        for direction, base_count in self.base_densities.items():
            # Add stochastic noise +/- 20%
            noise = random.randint(-2, 3)
            current_count = max(1, base_count + noise)
            
            # Generate vehicle sample list
            vehicles = []
            for _ in range(min(current_count, 60)):
                r = random.random()
                cumulative = 0.0
                v_type = "car"
                for t, prob in self.VEHICLE_TYPE_DISTRIBUTION:
                    cumulative += prob
                    if r <= cumulative:
                        v_type = t
                        break
                vehicles.append(v_type)

            result[direction] = {
                "vehicle_count": current_count,
                "vehicles": vehicles
            }

        return result
