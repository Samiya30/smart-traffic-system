"""
Configuration file for AI Traffic Management Engine
"""

import os

# Server Settings
AI_SERVICE_HOST = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", 8000))

# YOLO Model Settings
# COCO class IDs for vehicles: 1: bicycle, 2: car, 3: motorcycle, 5: bus, 7: truck
YOLO_MODEL_NAME = os.getenv("YOLO_MODEL_NAME", "yolov8n.pt")
CONFIDENCE_THRESHOLD = 0.40
IOU_THRESHOLD = 0.45

COCO_VEHICLE_CLASSES = {
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}

# Passenger Car Unit (PCU) equivalence factors for traffic engineering
VEHICLE_PCU_WEIGHTS = {
    "bicycle": 0.5,
    "motorcycle": 0.75,
    "car": 1.0,
    "bus": 2.5,
    "truck": 3.0,
    "ambulance": 1.0,
    "fire_truck": 3.0,
    "police": 1.0
}

# Density classification thresholds (PCU or equivalent count in queue area)
DENSITY_THRESHOLDS = {
    "LOW": (0, 10),
    "MEDIUM": (11, 25),
    "HIGH": (26, 50),
    "VERY_HIGH": 51
}

# Signal Timing Parameters (in seconds)
DEFAULT_SIGNAL_CONFIG = {
    "g_min": 10,        # Minimum green light duration (s)
    "g_max": 60,        # Maximum green light duration (s)
    "yellow_time": 3,   # Yellow transition duration (s)
    "all_red_time": 2,  # All-red clearance duration (s)
    "weight_vehicles": 0.5,  # Weight for normalized vehicle count
    "weight_queue": 0.3,     # Weight for normalized queue length
    "weight_waiting": 0.2,   # Weight for normalized waiting time
    "starvation_threshold": 90  # Maximum waiting time (s) before forcing green
}

# Direction Approaching intersection
DIRECTIONS = ["North", "South", "East", "West"]
