const express = require('express');
const router = express.Router();
const signalController = require('../controllers/signalController');

router.get('/status', signalController.getSignalStatus);
router.put('/config', signalController.updateSignalConfig);
router.post('/manual-override', signalController.manualOverride);

module.exports = router;
