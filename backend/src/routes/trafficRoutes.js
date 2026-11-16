const express = require('express');
const router = express.Router();
const trafficController = require('../controllers/trafficController');

router.get('/live', trafficController.getLiveTraffic);
router.get('/stats', trafficController.getTrafficStats);
router.post('/pattern', trafficController.setTrafficPattern);

// Societal & Smart City Endpoints
router.post('/bus-priority', trafficController.triggerBusPriority);
router.post('/pedestrian', trafficController.triggerPedestrian);
router.post('/accident', trafficController.triggerAccident);
router.post('/accident/clear', trafficController.clearAccident);
router.get('/violations', trafficController.getViolations);
router.post('/violations/generate', trafficController.generateViolation);

module.exports = router;
