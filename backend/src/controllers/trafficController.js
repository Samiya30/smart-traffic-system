const trafficEngine = require('../services/trafficEngine');
const db = require('../config/db');

exports.getLiveTraffic = (req, res) => {
  res.json(trafficEngine.getSnapshot());
};

exports.getTrafficStats = (req, res) => {
  res.json({
    metrics: trafficEngine.metrics,
    hourly: trafficEngine.hourlyHistory,
    airQuality: trafficEngine.airQuality,
    breakdown: {
      cars: 58,
      motorcycles: 22,
      buses: 12,
      trucks: 6,
      bicycles: 2
    }
  });
};

exports.getVehicleCounts = (req, res) => {
  const counts = {};
  for (const [dir, data] of Object.entries(trafficEngine.approaches)) {
    counts[dir] = {
      count: data.vehicleCount,
      pcu: data.pcuCount,
      queue: data.queueLength,
      density: data.densityLevel
    };
  }
  res.json({ counts, total: Object.values(trafficEngine.approaches).reduce((s, a) => s + a.vehicleCount, 0) });
};

exports.setTrafficPattern = (req, res) => {
  const { pattern } = req.body;
  if (!pattern) return res.status(400).json({ error: "Pattern is required" });
  res.json(trafficEngine.setPattern(pattern));
};

// Societal Feature 1: Public Transit Signal Priority (TSP)
exports.triggerBusPriority = (req, res) => {
  const { direction, route, passengers } = req.body;
  const result = trafficEngine.triggerBusPriority(direction || "East", route || "500D Metro Feeder", passengers || 65);
  res.json(result);
};

// Societal Feature 2: Smart Accessible Pedestrian Crosswalk
exports.triggerPedestrian = (req, res) => {
  const { direction, isElderlyOrDisabled } = req.body;
  const result = trafficEngine.triggerPedestrianCrosswalk(direction || "North", !!isElderlyOrDisabled);
  res.json(result);
};

// Societal Feature 3: Accident Incident Containment
exports.triggerAccident = (req, res) => {
  const { direction, details } = req.body;
  const result = trafficEngine.triggerAccidentIncident(direction || "South", details || "Vehicle Collision");
  res.json(result);
};

exports.clearAccident = (req, res) => {
  const result = trafficEngine.clearAccidentIncident();
  res.json(result);
};

// Societal Feature 4: Violations & e-Challan
exports.getViolations = (req, res) => {
  res.json(db.getViolations());
};

exports.generateViolation = (req, res) => {
  const { direction, violationType } = req.body;
  const item = trafficEngine.generateViolation(direction || "North", violationType || "Red Light Jump");
  res.json(item);
};
