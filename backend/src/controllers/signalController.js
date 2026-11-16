const trafficEngine = require('../services/trafficEngine');

exports.getSignalStatus = (req, res) => {
  res.json({
    activeDirection: trafficEngine.activeDirection,
    phaseState: trafficEngine.phaseState,
    timerRemaining: Math.round(trafficEngine.timerRemaining),
    allocatedGreen: trafficEngine.currentAllocatedGreen,
    isManualMode: trafficEngine.isManualMode,
    approaches: trafficEngine.approaches
  });
};

exports.updateSignalConfig = (req, res) => {
  const result = trafficEngine.updateConfig(req.body);
  res.json(result);
};

exports.manualOverride = (req, res) => {
  const { direction, disable } = req.body;
  if (disable) {
    res.json(trafficEngine.disableManualOverride());
  } else if (direction) {
    res.json(trafficEngine.setManualOverride(direction));
  } else {
    res.status(400).json({ error: "Direction or disable flag required" });
  }
};
