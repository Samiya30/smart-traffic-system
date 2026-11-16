const db = require('../config/db');

exports.getAllIntersections = (req, res) => {
  res.json(db.getIntersections());
};

exports.getIntersectionById = (req, res) => {
  const item = db.getIntersectionById(req.params.id);
  if (!item) return res.status(404).json({ error: "Intersection not found" });
  res.json({
    ...item,
    cameras: db.getCamerasByIntersection(item.id)
  });
};

exports.addIntersection = (req, res) => {
  const { name, location, latitude, longitude } = req.body;
  if (!name || !location) {
    return res.status(400).json({ error: "Name and location are required" });
  }
  const newInt = {
    id: `int-${Date.now()}`,
    name,
    location,
    status: "ONLINE",
    latitude: latitude || 12.9716,
    longitude: longitude || 77.5946,
    created_at: new Date().toISOString()
  };
  db.data.intersections.push(newInt);
  db.save();
  res.status(201).json(newInt);
};
