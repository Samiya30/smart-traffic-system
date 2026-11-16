const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/', alertController.getAlerts);
router.post('/emergency', alertController.createEmergency);
router.post('/emergency/clear', alertController.clearEmergency);

module.exports = router;
