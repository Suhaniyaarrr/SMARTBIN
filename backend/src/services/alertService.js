const Alert = require('../models/Alert');

const calculateFillLevel = (distance, maxDistance = 30) => {
  const fillLevel = ((maxDistance - distance) / maxDistance) * 100;
  return Math.max(0, Math.min(100, Math.round(fillLevel)));
};

const getStatus = (fillLevel) => {
  if (fillLevel <= 50) return 'low';
  if (fillLevel <= 80) return 'medium';
  return 'high';
};

const checkAndCreateAlert = async (binId, fillLevel, previousFillLevel) => {
  const currentStatus = getStatus(fillLevel);
  const previousStatus = getStatus(previousFillLevel || 0);

  if (currentStatus === 'high' && previousStatus !== 'high') {
    await Alert.create({
      binId,
      message: `${binId} is ${fillLevel}% full - immediate collection required`,
      type: 'critical'
    });
    return;
  }

  if (currentStatus === 'medium' && previousStatus === 'low') {
    await Alert.create({
      binId,
      message: `${binId} is ${fillLevel}% full - schedule collection soon`,
      type: 'warning'
    });
    return;
  }

  if (fillLevel >= 90) {
    await Alert.create({
      binId,
      message: `${binId} is approaching maximum capacity at ${fillLevel}%`,
      type: 'critical'
    });
  }
};

module.exports = {
  calculateFillLevel,
  getStatus,
  checkAndCreateAlert
};
