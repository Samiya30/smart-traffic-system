"""
Script to generate a synthetic traffic simulation video for testing vehicle detection pipelines.
"""

import sys
import numpy as np

try:
    import cv2
except ImportError:
    print("OpenCV is not installed. Run: pip install opencv-python")
    sys.exit(0)

def generate_sample_traffic_video(filename="sample_traffic.mp4", num_frames=300, width=640, height=480):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filename, fourcc, 30.0, (width, height))

    cars = [
        {"x": 100, "y": 50, "speed": 3, "color": (0, 200, 0), "type": "car", "w": 40, "h": 70},
        {"x": 160, "y": 200, "speed": 4, "color": (255, 0, 0), "type": "bus", "w": 50, "h": 110},
        {"x": 220, "y": 120, "speed": 2, "color": (0, 165, 255), "type": "truck", "w": 48, "h": 90},
        {"x": 280, "y": 300, "speed": 5, "color": (200, 200, 0), "type": "motorcycle", "w": 20, "h": 35},
    ]

    for f in range(num_frames):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        # Draw road
        cv2.rectangle(frame, (80, 0), (320, height), (50, 50, 50), -1)
        # Lane divider lines
        for y in range(0, height, 40):
            cv2.line(frame, (200, y), (200, y + 20), (255, 255, 255), 2)

        # Draw tripwire virtual line
        cv2.line(frame, (80, 240), (320, 240), (0, 0, 255), 2)
        cv2.putText(frame, "VIRTUAL COUNTING LINE", (90, 235), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 255), 1)

        # Update & draw vehicles
        for c in cars:
            c["y"] = (c["y"] + c["speed"]) % height
            cv2.rectangle(frame, (c["x"], c["y"]), (c["x"] + c["w"], c["y"] + c["h"]), c["color"], -1)
            cv2.putText(frame, c["type"], (c["x"], c["y"] - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

        out.write(frame)

    out.release()
    print(f"Sample traffic video generated: {filename}")

if __name__ == "__main__":
    generate_sample_traffic_video()
