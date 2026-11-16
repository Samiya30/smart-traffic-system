"""
Module 2 (Continued): Vehicle Counter with Virtual Line Tripwires
Counts vehicles crossing a designated boundary line per direction and lane.
"""

from typing import List, Dict, Any, Tuple

class VehicleCounter:
    def __init__(self, line_coords: Tuple[Tuple[int, int], Tuple[int, int]] = ((0, 240), (640, 240))):
        self.line = line_coords  # ((x1, y1), (x2, y2))
        self.counted_ids = set()
        self.counts_by_type = {
            "car": 0,
            "motorcycle": 0,
            "bus": 0,
            "truck": 0,
            "bicycle": 0,
            "total": 0
        }

    def set_line(self, pt1: Tuple[int, int], pt2: Tuple[int, int]):
        self.line = (pt1, pt2)

    def _has_crossed_line(self, p1: Tuple[float, float], p2: Tuple[float, float]) -> bool:
        """
        Determines if movement from p1 to p2 crosses the tripwire line segment.
        Uses 2D cross-product orientation test.
        """
        (lx1, ly1), (lx2, ly2) = self.line

        def ccw(A, B, C):
            return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0])

        A = (lx1, ly1)
        B = (lx2, ly2)
        C = p1
        D = p2

        return ccw(A, C, D) != ccw(B, C, D) and ccw(A, B, C) != ccw(A, B, D)

    def update_counts(self, tracked_detections: List[Dict[str, Any]], tracker_state: Dict[int, Any] = None) -> Dict[str, Any]:
        """
        Evaluates tracked vehicles against the virtual line.
        """
        for det in tracked_detections:
            t_id = det.get("track_id")
            if not t_id or t_id in self.counted_ids:
                continue

            # Check if tracker state provides previous centroid
            if tracker_state and t_id in tracker_state:
                prev_c = tracker_state[t_id].get("prev_centroid")
                curr_c = tracker_state[t_id].get("centroid")
                if prev_c and curr_c:
                    if self._has_crossed_line(prev_c, curr_c):
                        self.counted_ids.add(t_id)
                        cls = det.get("class_name", "car")
                        self.counts_by_type[cls] = self.counts_by_type.get(cls, 0) + 1
                        self.counts_by_type["total"] += 1
            else:
                # If single-frame estimation, count when centroid passes y threshold
                y_center = (det["bbox"][1] + det["bbox"][3]) / 2.0
                line_y = (self.line[0][1] + self.line[1][1]) / 2.0
                if abs(y_center - line_y) < 15:
                    self.counted_ids.add(t_id)
                    cls = det.get("class_name", "car")
                    self.counts_by_type[cls] = self.counts_by_type.get(cls, 0) + 1
                    self.counts_by_type["total"] += 1

        return self.get_summary()

    def get_summary(self) -> Dict[str, Any]:
        return {
            "total": self.counts_by_type["total"],
            "breakdown": {
                "car": self.counts_by_type.get("car", 0),
                "motorcycle": self.counts_by_type.get("motorcycle", 0),
                "bus": self.counts_by_type.get("bus", 0),
                "truck": self.counts_by_type.get("truck", 0),
                "bicycle": self.counts_by_type.get("bicycle", 0)
            }
        }
