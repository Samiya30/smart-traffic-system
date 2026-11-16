"""
Module 2: Vehicle Tracking (ByteTrack / SORT-inspired Tracker)
Maintains unique track IDs across consecutive video frames to prevent duplicate counting.
"""

import math
from typing import List, Dict, Any, Tuple

class SimpleTracker:
    """
    Centroid & IoU-based tracking algorithm for robust vehicle continuity across frames.
    Compatible with ByteTrack interface.
    """
    def __init__(self, max_lost: int = 15, iou_threshold: float = 0.3):
        self.next_id = 1
        self.tracks: Dict[int, Dict[str, Any]] = {}
        self.max_lost = max_lost
        self.iou_threshold = iou_threshold

    @staticmethod
    def calculate_iou(boxA, boxB) -> float:
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])

        interArea = max(0, xB - xA) * max(0, yB - yA)
        boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
        boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

        denom = float(boxAArea + boxBArea - interArea)
        return interArea / denom if denom > 0 else 0.0

    @staticmethod
    def get_centroid(box) -> Tuple[float, float]:
        return ((box[0] + box[2]) / 2.0, (box[1] + box[3]) / 2.0)

    def update(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Matches incoming detections with existing tracks.
        Updates centroids, increases lost counter for unmatched tracks, and spawns new tracks.
        """
        # Mark all existing tracks as unassigned
        matched_track_ids = set()
        matched_det_indices = set()

        # Perform Hungarian / greedy IoU matching
        for track_id, track in list(self.tracks.items()):
            best_iou = 0.0
            best_det_idx = -1
            for idx, det in enumerate(detections):
                if idx in matched_det_indices:
                    continue
                # Class match requirement
                if det.get("class_name") != track.get("class_name"):
                    continue

                iou = self.calculate_iou(track["bbox"], det["bbox"])
                if iou > best_iou:
                    best_iou = iou
                    best_det_idx = idx

            if best_iou >= self.iou_threshold and best_det_idx >= 0:
                # Update existing track
                det = detections[best_det_idx]
                prev_centroid = track["centroid"]
                curr_centroid = self.get_centroid(det["bbox"])
                
                track["prev_centroid"] = prev_centroid
                track["centroid"] = curr_centroid
                track["bbox"] = det["bbox"]
                track["confidence"] = det.get("confidence", 0.0)
                track["lost_frames"] = 0
                track["history"].append(curr_centroid)
                if len(track["history"]) > 30:
                    track["history"].pop(0)

                matched_track_ids.add(track_id)
                matched_det_indices.add(best_det_idx)
                det["track_id"] = track_id
            else:
                track["lost_frames"] += 1

        # Remove dead tracks
        for track_id in list(self.tracks.keys()):
            if self.tracks[track_id]["lost_frames"] > self.max_lost:
                del self.tracks[track_id]

        # Register new detections
        for idx, det in enumerate(detections):
            if idx not in matched_det_indices:
                new_id = self.next_id
                self.next_id += 1
                c = self.get_centroid(det["bbox"])
                self.tracks[new_id] = {
                    "id": new_id,
                    "bbox": det["bbox"],
                    "class_name": det.get("class_name", "car"),
                    "class_id": det.get("class_id", 2),
                    "confidence": det.get("confidence", 0.0),
                    "centroid": c,
                    "prev_centroid": c,
                    "history": [c],
                    "lost_frames": 0,
                    "counted": False
                }
                det["track_id"] = new_id

        # Return active detections with track IDs
        tracked_results = []
        for det in detections:
            if "track_id" in det:
                tracked_results.append(det)

        return tracked_results
