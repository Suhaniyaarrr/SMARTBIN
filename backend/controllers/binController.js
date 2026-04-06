const dataService = require('../services/dataService');
const smsService = require('../services/smsService');

/**
 * Handle incoming POST requests from ESP32 or Frontend.
 */
const receiveBinData = async (req, res) => {
    console.log('\n--- NEW REQUEST RECEIVED AT /api/bin-data ---');
    console.log('[Controller] Request Body:', req.body);

    try {
        let payload = req.body;

        // 1. Edge Case: If the sender didn't include Content-Type: application/json, 
        // the body might arrive as a string or be empty.
        if (typeof payload === 'string') {
            try { payload = JSON.parse(payload); } catch (e) {
                console.log('[Controller] Failed to parse body string as JSON');
            }
        }

        // 2. Clear Validation
        if (!payload || !payload.id) {
            console.error('[Controller Error] Missing "id" in payload!');
            return res.status(400).json({ error: 'Invalid payload: "id" is required.' });
        }
        
        if (payload.fillLevel === undefined || payload.fillLevel === null) {
            console.error('[Controller Error] Missing "fillLevel" in payload!');
            return res.status(400).json({ error: 'Invalid payload: "fillLevel" is required.' });
        }

        // 3. Save into memory explicitly
        console.log('[Controller] Validation passed. Saving data...');
        const savedData = dataService.updateBinData(payload);

        // 4. SMS Alerts Logic
        if (savedData.fillLevel >= 80) {
            await smsService.sendSMSAlert(savedData);
        } else {
            smsService.resetAlertState(savedData);
        }

        console.log('[Controller] Successfully processed request for:', savedData.id);
        res.status(200).json({ message: 'Data saved successfully!', data: savedData });

    } catch (error) {
        console.error('[Controller CRITICAL Error]:', error);
        res.status(500).json({ error: 'Backend crashed while trying to save data' });
    }
};

/**
 * Return all bins to the dashboard
 */
const getAllBins = (req, res) => {
    console.log('\n[Controller] Fetching all bins for GET /api/bins...');
    const bins = dataService.getAllBins();
    console.log(`[Controller] Returning ${bins.length} bins to client.`);
    res.status(200).json(bins);
};

/**
 * Return only bins that need alerting
 */
const getAlerts = (req, res) => {
    const alertBins = dataService.getAlertBins();
    res.status(200).json(alertBins);
};

module.exports = {
    receiveBinData,
    getAllBins,
    getAlerts
};
