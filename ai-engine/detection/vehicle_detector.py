"""
Module 1: Vehicle Detection Using Computer Vision
Processes video frames and identifies vehicles (cars, buses, trucks, motorcycles, bicycles).
"""

import logging
import numpy as np
from typing import List, Dict, Any, Tuple

try:
    import cv2
except ImportError:
    cv2 = None

try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except ImportError:
    ULTRALYTICS_AVAILABLE = False

from config import YOLO_MODEL_NAME, CONFIDENCE_THRESHOLD, IOU_THRESHOLD, COCO_VEHICLE_CLASSES

logger = logging.getLogger("VehicleDetector")

class VehicleDetector:
    def __init__(self, model_path: str = YOLO_MODEL_NAME, conf_thresh: float = CONFIDENCE_THRESHOLD):
        self.conf_thresh = conf_thresh
        self.iou_thresh = IOU_THRESHOLD
        self.model = None
        self.is_real_model = False

        if ULTRALYTICS_AVAILABLE:
            try:
                logger.info(f"Loading YOLO model: {model_path}...")
                self.model = YOLO(model_path)
                self.is_real_model = True
                logger.info("YOLO model loaded successfully.")
            except Exception as e:
                logger.warning(f"Could not load YOLO model ({e}). Using simulation fallback.")
        else:
            logger.info("Ultralytics library not installed. Running in high-fidelity simulation mode.")

    def detect_vehicles(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detects vehicles in a given BGR video frame.
        Returns a list of detected objects:
        [
            {
                "bbox": [x1, y1, x2, y2],
                "class_id": int,
                "class_name": str,
                "confidence": float
            },
            ...
        ]
        """
        if self.is_real_model and self.model is not None:
            results = self.model.predict(
                frame,
                conf=self.conf_thresh,
                iou=self.iou_thresh,
                classes=list(COCO_VEHICLE_CLASSES.keys()),
                verbose=False
            )
            detections = []
            if len(results) > 0:
                boxes = results[0].boxes
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    xyxy = box.xyxy[0].tolist()
                    class_name = COCO_VEHICLE_CLASSES.get(cls_id, "unknown")
                    detections.append({
                        "bbox": [round(coord, 2) for coord in xyxy],
                        "class_id": cls_id,
                        "class_name": class_name,
                        "confidence": round(conf, 3)
                    })
            return detections
        else:
            # Fallback for synthetic/development testing
            return self._synthetic_detect(frame)

    def _synthetic_detect(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Generates realistic vehicle bounding boxes based on frame dimensions.
        """
        h, w = frame.shape[:2] if frame is not None else (480, 640)
        # Synthetic mock vehicles for visualization testing
        return [
            {"bbox": [int(w * 0.2), int(h * 0.4), int(w * 0.35), int(h * 0.6)], "class_id": 2, "class_name": "car", "confidence": 0.94},
            {"bbox": [int(w * 0.45), int(h * 0.3), int(w * 0.6), int(h * 0.55)], "class_id": 5, "class_name": "bus", "confidence": 0.91},
            {"bbox": [int(w * 0.7), int(h * 0.5), int(w * 0.8), int(h * 0.7)], "class_id": 3, "class_name": "motorcycle", "confidence": 0.87}
        ]

    def draw_detections(self, frame: np.ndarray, detections: List[Dict[str, Any]]) -> np.ndarray:
        """
        Draws bounding boxes and labels on the frame.
        """
        if cv2 is None or frame is None:
            return frame

        annotated = frame.copy()
        color_map = {
            "car": (0, 255, 0),        # Green
            "bus": (255, 165, 0),      # Orange/Cyan in BGR: (0, 165, 255)
            "truck": (0, 0, 255),      # Red
            "motorcycle": (255, 255, 0),# Cyan in BGR: (255, 255, 0)
            "bicycle": (255, 0, 255),  # Magenta
            "ambulance": (0, 0, 255)   # Red
        }

        for det in detections:
            x1, y1, x2, y2 = [int(v) for v in det["bbox"]]
            cls_name = det.get("class_name", "vehicle")
            conf = det.get("confidence", 0.0)
            track_id = det.get("track_id", None)

            color = color_map.get(cls_name, (0, 255, 0))
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

            label = f"{cls_name} {conf:.2f}"
            if track_id is not None:
                label = f"#{track_id} {label}"

            # Label background banner
            (t_w, t_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(annotated, (x1, y1 - 20), (x1 + t_w + 4, y1), color, -1)
            cv2.putText(annotated, label, (x1 + 2, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)

        return annotated
