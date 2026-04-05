const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('binId message type createdAt');

    const formattedAlerts = alerts.map(alert => ({
      id: alert._id,
      binId: alert.binId,
      message: alert.message,
      type: alert.type,
      timestamp: alert.createdAt.toISOString()
    }));

    res.json(formattedAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findByIdAndDelete(id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

module.exports = router;
