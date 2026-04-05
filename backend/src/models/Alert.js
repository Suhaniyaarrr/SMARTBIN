const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['warning', 'critical', 'info'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

alertSchema.index({ binId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
