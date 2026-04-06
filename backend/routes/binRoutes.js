const express = require('express');
const router = express.Router();
const binController = require('../controllers/binController');

// 1. ESP32 Input Endpoint
// Hardware uses this to broadcast its sensor status
router.post('/bin-data', binController.receiveBinData);

// 2. Dashboard Output Endpoint
// Frontend UI uses this to display the map and cards
router.get('/bins', binController.getAllBins);

// 3. Alerts Endpoint
// Optional. Used if the dashboard wants a quick list of only full bins
router.get('/alerts', binController.getAlerts);

module.exports = router;
