const express = require('express');
const router = express.Router();
const Bin = require('../models/Bin');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');
const validateBinData = require('../middleware/validateBinData');
const { calculateFillLevel, getStatus, checkAndCreateAlert } = require('../services/alertService');

router.post('/data', validateBinData, async (req, res) => {
  try {
    const { binId, distance, lidStatus } = req.body;

    let bin = await Bin.findOne({ binId });
    if (!bin) {
      bin = await Bin.create({ binId });
    }

    const maxDistance = bin.maxDistance || 30;
    const fillLevel = calculateFillLevel(distance, maxDistance);

    const lastReading = await Reading.findOne({ binId }).sort({ createdAt: -1 });
    const previousFillLevel = lastReading ? lastReading.fillLevel : 0;

    const reading = await Reading.create({
      binId,
      distance,
      fillLevel,
      lidStatus: lidStatus || 'closed'
    });

    await checkAndCreateAlert(binId, fillLevel, previousFillLevel);

    res.status(201).json({
      success: true,
      reading: {
        id: reading._id,
        binId: reading.binId,
        distance: reading.distance,
        fillLevel: reading.fillLevel,
        lidStatus: reading.lidStatus,
        timestamp: reading.createdAt
      }
    });
  } catch (error) {
    console.error('Error saving bin data:', error);
    res.status(500).json({ error: 'Failed to save bin data' });
  }
});

router.get('/', async (req, res) => {
  try {
    const bins = await Bin.find();
    
    if (bins.length === 0) {
      const defaultBin = await Bin.create({ binId: 'BIN_01' });
      bins.push(defaultBin);
    }

    const binData = await Promise.all(bins.map(async (bin) => {
      const latestReading = await Reading.findOne({ binId: bin.binId }).sort({ createdAt: -1 });
      
      return {
        id: bin.binId,
        fillLevel: latestReading ? latestReading.fillLevel : 0,
        status: latestReading ? getStatus(latestReading.fillLevel) : 'low',
        lidStatus: latestReading ? latestReading.lidStatus : 'closed',
        lastUpdated: latestReading ? latestReading.createdAt.toISOString() : new Date().toISOString(),
        location: bin.location
      };
    }));

    res.json(binData);
  } catch (error) {
    console.error('Error fetching bins:', error);
    res.status(500).json({ error: 'Failed to fetch bins' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const bins = await Bin.find();
    
    if (bins.length === 0) {
      return res.json([{ binId: 'BIN_01', data: [] }]);
    }

    const result = await Promise.all(bins.map(async (bin) => {
      const readings = await Reading.find({
        binId: bin.binId,
        createdAt: { $gte: startTime }
      }).select('fillLevel createdAt').sort({ createdAt: 1 });

      return {
        binId: bin.binId,
        data: readings.map(r => ({
          timestamp: r.createdAt.toISOString(),
          fillLevel: r.fillLevel
        }))
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const bin = await Bin.findOne({ binId: id });
    if (!bin) {
      return res.status(404).json({ error: 'Bin not found' });
    }

    const latestReading = await Reading.findOne({ binId: id }).sort({ createdAt: -1 });

    res.json({
      id: bin.binId,
      fillLevel: latestReading ? latestReading.fillLevel : 0,
      status: latestReading ? getStatus(latestReading.fillLevel) : 'low',
      lidStatus: latestReading ? latestReading.lidStatus : 'closed',
      lastUpdated: latestReading ? latestReading.createdAt.toISOString() : new Date().toISOString(),
      location: bin.location
    });
  } catch (error) {
    console.error('Error fetching bin:', error);
    res.status(500).json({ error: 'Failed to fetch bin' });
  }
});

module.exports = router;
