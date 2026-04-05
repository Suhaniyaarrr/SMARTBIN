const validateBinData = (req, res, next) => {
  const { binId, distance, lidStatus } = req.body;

  if (!binId) {
    return res.status(400).json({ error: 'binId is required' });
  }

  if (distance === undefined || typeof distance !== 'number') {
    return res.status(400).json({ error: 'distance must be a number' });
  }

  if (distance < 0 || distance > 500) {
    return res.status(400).json({ error: 'distance must be between 0 and 500 cm' });
  }

  if (lidStatus && !['open', 'closed'].includes(lidStatus)) {
    return res.status(400).json({ error: 'lidStatus must be "open" or "closed"' });
  }

  next();
};

module.exports = validateBinData;
