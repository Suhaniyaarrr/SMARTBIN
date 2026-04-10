const dataService = require('../services/dataService');
const smsService = require('../services/smsService');

const toFiniteNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const normalizePayload = (payload) => {
    const fillLevel = toFiniteNumber(payload.fillLevel);
    const latCandidate = payload.lat ?? (payload.location && payload.location.lat);
    const lngCandidate = payload.lng ?? (payload.location && payload.location.lng);
    const lat = toFiniteNumber(latCandidate);
    const lng = toFiniteNumber(lngCandidate);

    return {
        id: String(payload.id || '').trim(),
        fillLevel,
        lidStatus: payload.lidStatus === 'open' ? 'open' : 'closed',
        timestamp: payload.timestamp || new Date().toISOString(),
        lat,
        lng,
        wifiRssi: toFiniteNumber(payload.wifiRssi),
        deviceUptimeMs: toFiniteNumber(payload.deviceUptimeMs)
    };
};

const processUpdatedBin = async (req, res, { allowCreate = false } = {}) => {
    try {
        let payload = req.body;

        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch {
                return res.status(400).json({ error: 'Invalid JSON payload' });
            }
        }

        if (!payload || !payload.id) {
            return res.status(400).json({ error: 'Invalid payload: "id" is required.' });
        }

        if (payload.fillLevel === undefined || payload.fillLevel === null) {
            return res.status(400).json({ error: 'Invalid payload: "fillLevel" is required.' });
        }

        const normalizedPayload = normalizePayload(payload);

        if (!normalizedPayload.id) {
            return res.status(400).json({ error: 'Invalid payload: "id" must be a non-empty string.' });
        }

        if (normalizedPayload.fillLevel === null) {
            return res.status(400).json({ error: 'Invalid payload: "fillLevel" must be a number between 0 and 100.' });
        }

        let savedData = allowCreate
            ? dataService.upsertBin(normalizedPayload)
            : dataService.updateBin(normalizedPayload.id, normalizedPayload.fillLevel, {
                  location: {
                      lat: normalizedPayload.lat ?? 0,
                      lng: normalizedPayload.lng ?? 0
                  }
              });

        if (savedData && savedData.error) {
            return res.status(404).json({ error: savedData.error });
        }

        if (savedData.fillLevel >= 80) {
            await smsService.sendSMSAlert(savedData);
        } else {
            smsService.resetAlertState(savedData);
        }

        return res.status(200).json({
            message: 'Bin updated successfully!',
            data: savedData,
            bins: dataService.getAllBins()
        });
    } catch (error) {
        console.error('[Controller CRITICAL Error]:', error);
        return res.status(500).json({ error: 'Backend crashed while trying to update bin data' });
    }
};

/**
 * Handle incoming POST requests from ESP32 or Frontend.
 */
const receiveBinData = async (req, res) => {
    console.log('\n--- NEW REQUEST RECEIVED AT /api/bin-data ---');
    console.log('[Controller] Request Body:', req.body);
    return processUpdatedBin(req, res, { allowCreate: true });
};

/**
 * Update an existing bin from the browser console.
 */
const updateBin = async (req, res) => {
    console.log('\n--- NEW REQUEST RECEIVED AT /api/update-bin ---');
    console.log('[Controller] Request Body:', req.body);
    return processUpdatedBin(req, res, { allowCreate: false });
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

const getStatus = (req, res) => {
    const bins = dataService.getAllBins();
    const alertBins = dataService.getAlertBins();

    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        totalBins: bins.length,
        criticalBins: alertBins.length,
        latestUpdate: bins.length ? bins.reduce((latest, current) => {
            return new Date(current.lastUpdated) > new Date(latest.lastUpdated) ? current : latest;
        }).lastUpdated : null
    });
};

module.exports = {
    receiveBinData,
    updateBin,
    getAllBins,
    getAlerts,
    getStatus
};
