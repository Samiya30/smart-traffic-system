const db = require('../config/db');
const trafficEngine = require('../services/trafficEngine');

exports.getAlerts = (req, res) => {
  res.json({
    alerts: db.getAlerts(),
    emergencyAlerts: db.data.emergency_alerts
  });
};

exports.createEmergency = (req, res) => {
  const { direction, vehicleType } = req.body;
  if (!direction) return res.status(400).json({ error: "Direction is required" });
  const result = trafficEngine.triggerEmergency(direction, vehicleType || "ambulance");
  res.status(201).json(result);
};

exports.clearEmergency = (req, res) => {
  const result = trafficEngine.clearEmergency();
  res.json(result);
};
