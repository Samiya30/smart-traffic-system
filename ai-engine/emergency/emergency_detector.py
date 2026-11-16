"""
Module 5: Emergency Vehicle Detection & Priority Preemption
Detects emergency response vehicles (ambulances, fire engines, police cruisers)
and manages green wave preemption protocols.
"""

from typing import List, Dict, Any
import time

class EmergencyDetector:
    EMERGENCY_CLASSES = ["ambulance", "fire_truck", "police"]

    def __init__(self):
        self.active_emergency = None
        self.emergency_history = []

    def inspect_detections(self, direction: str, detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Inspects incoming frame detections for emergency vehicles.
        """
        found_emergency = None
        for det in detections:
            cls_name = det.get("class_name", "").lower()
            if cls_name in self.EMERGENCY_CLASSES:
                found_emergency = {
                    "direction": direction,
                    "type": cls_name,
                    "confidence": det.get("confidence", 0.95),
                    "bbox": det.get("bbox"),
                    "timestamp": time.time()
                }
                break

        if found_emergency:
            self.active_emergency = found_emergency
            self.emergency_history.append(found_emergency)
            return {
                "detected": True,
                "emergency": found_emergency,
                "action": "TRIGGER_PREEMPTION",
                "message": f"CRITICAL: {found_emergency['type'].upper()} detected on {direction} approach. Clearing conflicting paths."
            }

        return {"detected": False, "emergency": None}

    def manual_trigger(self, direction: str, vehicle_type: str = "ambulance") -> Dict[str, Any]:
        """
        Allows dashboard administrator to manually dispatch or test an emergency priority preemption.
        """
        evt = {
            "direction": direction,
            "type": vehicle_type,
            "confidence": 1.0,
            "bbox": [100, 100, 250, 250],
            "timestamp": time.time(),
            "manual": True
        }
        self.active_emergency = evt
        self.emergency_history.append(evt)
        return {
            "success": True,
            "emergency": evt,
            "message": f"Manual Green Wave corridor opened for {vehicle_type} on {direction}."
        }

    def clear_emergency(self):
        self.active_emergency = None
        return {"status": "CLEARED"}

    def get_status(self) -> Dict[str, Any]:
        return {
            "has_active_emergency": self.active_emergency is not None,
            "active_emergency": self.active_emergency,
            "total_incidents": len(self.emergency_history)
        }
