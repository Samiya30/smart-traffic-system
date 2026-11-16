"""
AI Traffic Management Engine - FastAPI Server
Exposes REST and streaming endpoints for detection, tracking, density calculation,
signal optimization, and 4-way intersection simulation.
"""

import time
import io
import asyncio
from typing import Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
import numpy as np

try:
    import cv2
except ImportError:
    cv2 = None

from config import AI_SERVICE_HOST, AI_SERVICE_PORT, DEFAULT_SIGNAL_CONFIG
from detection.vehicle_detector import VehicleDetector
from tracking.byte_track import SimpleTracker
from tracking.vehicle_counter import VehicleCounter
from density.density_estimator import DensityEstimator
from optimization.signal_optimizer import SignalOptimizer
from emergency.emergency_detector import EmergencyDetector
from simulation.intersection_sim import IntersectionSimulator

app = FastAPI(
    title="AI Traffic Management Engine",
    description="Computer Vision & AI-Powered Dynamic Signal Optimization Service",
    version="1.0.0"
)

# Enable CORS for frontend and Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize modules
detector = VehicleDetector()
tracker = SimpleTracker()
counter = VehicleCounter()
density_estimator = DensityEstimator()
optimizer = SignalOptimizer()
emergency_detector = EmergencyDetector()
intersection_sim = IntersectionSimulator()

# Pydantic schemas
class DensityRequest(BaseModel):
    direction: str
    vehicle_count: int
    waiting_time_seconds: Optional[float] = 0.0

class OptimizeRequest(BaseModel):
    approaches: Dict[str, Dict[str, Any]]
    emergency_direction: Optional[str] = None
    custom_config: Optional[Dict[str, Any]] = None

class EmergencyRequest(BaseModel):
    direction: str
    vehicle_type: Optional[str] = "ambulance"

class ConfigUpdateRequest(BaseModel):
    g_min: Optional[int] = None
    g_max: Optional[int] = None
    yellow_time: Optional[int] = None
    all_red_time: Optional[int] = None
    weight_vehicles: Optional[float] = None
    weight_queue: Optional[float] = None
    weight_waiting: Optional[float] = None

@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "AI Traffic Management Engine",
        "yolo_loaded": detector.is_real_model,
        "timestamp": time.time()
    }

@app.get("/ai/state")
def get_current_state():
    """
    Returns full state snapshot from the intersection simulation engine.
    """
    intersection_sim.tick(1.0)
    return intersection_sim.get_full_state()

@app.post("/ai/detect")
async def detect_frame(file: UploadFile = File(...)):
    """
    Accepts an uploaded image frame, runs vehicle detection, and returns bounding boxes.
    """
    contents = await file.read()
    if cv2 is not None:
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    else:
        frame = None

    detections = detector.detect_vehicles(frame)
    tracked = tracker.update(detections)
    
    return {
        "timestamp": time.time(),
        "total_detected": len(detections),
        "detections": tracked
    }

@app.post("/ai/density")
def calculate_density(req: DensityRequest):
    """
    Estimates density and queue metrics for a given approach.
    """
    dummy_dets = [{"class_name": "car"} for _ in range(req.vehicle_count)]
    result = density_estimator.calculate_density(dummy_dets, req.waiting_time_seconds)
    result["direction"] = req.direction
    return result

@app.post("/ai/optimize")
def optimize_signals(req: OptimizeRequest):
    """
    Calculates dynamic green allocations and priority scores based on traffic parameters.
    """
    if req.custom_config:
        optimizer.update_config(req.custom_config)

    result = optimizer.get_next_recommended_phase(req.approaches, req.emergency_direction)
    return result

@app.post("/ai/emergency")
def handle_emergency(req: EmergencyRequest):
    """
    Triggers immediate emergency vehicle preemption corridor.
    """
    result = emergency_detector.manual_trigger(req.direction, req.vehicle_type)
    return result

@app.post("/ai/emergency/clear")
def clear_emergency():
    """
    Clears active emergency and returns to normal adaptive cycle.
    """
    result = emergency_detector.clear_emergency()
    return result

@app.post("/ai/simulation/pattern")
def set_simulation_pattern(pattern: str = Form(...)):
    """
    Changes traffic flow pattern (morning_rush, evening_rush, balanced, unbalanced, night).
    """
    intersection_sim.generator.set_pattern(pattern)
    return {"status": "SUCCESS", "pattern": pattern}

@app.post("/ai/config")
def update_signal_parameters(cfg: ConfigUpdateRequest):
    update_data = {k: v for k, v in cfg.dict().items() if v is not None}
    optimizer.update_config(update_data)
    return {"status": "UPDATED", "config": optimizer.config}

def generate_stream_frames(direction: str):
    """
    Generates video frames showing simulated camera feed with AI bounding boxes.
    """
    if cv2 is None:
        return

    w, h = 480, 320
    colors = {"car": (0, 255, 0), "bus": (0, 165, 255), "truck": (0, 0, 255), "motorcycle": (255, 255, 0)}

    while True:
        frame = np.full((h, w, 3), 35, dtype=np.uint8)
        # Road lane
        cv2.rectangle(frame, (80, 0), (400, h), (55, 55, 55), -1)
        cv2.line(frame, (240, 0), (240, h), (255, 255, 255), 2)
        # Virtual counting line
        cv2.line(frame, (80, 200), (400, 200), (0, 0, 255), 2)
        cv2.putText(frame, f"CAM-{direction.upper()} [AI LIVE]", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 120), 2)

        # Draw vehicle boxes
        approach_data = intersection_sim.approaches.get(direction, {})
        v_count = approach_data.get("vehicle_count", 5)

        for i in range(min(v_count, 8)):
            y_pos = 50 + (i * 32)
            x_pos = 120 if i % 2 == 0 else 270
            cv2.rectangle(frame, (x_pos, y_pos), (x_pos + 60, y_pos + 25), (0, 255, 0), 2)
            cv2.putText(frame, f"car {0.92:.2f}", (x_pos, y_pos - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 0), 1)

        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        time.sleep(0.1)

@app.get("/ai/stream/{direction}")
def stream_camera(direction: str):
    """
    Live MJPEG video stream for camera preview in frontend dashboard.
    """
    if cv2 is None:
        return JSONResponse(status_code=501, content={"error": "OpenCV not installed for streaming"})

    return StreamingResponse(
        generate_stream_frames(direction),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=AI_SERVICE_HOST, port=AI_SERVICE_PORT, reload=True)
