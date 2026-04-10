const express = require('express');
const router = express.Router();
const binController = require('../controllers/binController');
const { requireApiKey, rateLimitUpdates } = require('../middleware/security');

// 1. ESP32 Input Endpoint
// Hardware uses this to broadcast its sensor status
router.post('/bin-data', requireApiKey, rateLimitUpdates, binController.receiveBinData);

// 1b. Browser Console Simulation Endpoint
// Allows manual updates from F12 using fetch(.../api/update-bin)
router.post('/update-bin', requireApiKey, rateLimitUpdates, binController.updateBin);

// 2. Dashboard Output Endpoint
// Frontend UI uses this to display the map and cards
router.get('/bins', binController.getAllBins);

// 3. Alerts Endpoint
// Optional. Used if the dashboard wants a quick list of only full bins
router.get('/alerts', binController.getAlerts);

// 4. Status Endpoint
// Quick system state used by health widgets and connectivity checks
router.get('/status', binController.getStatus);

module.exports = router;
