const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    index: true
  },
  distance: {
    type: Number,
    required: true
  },
  fillLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  lidStatus: {
    type: String,
    enum: ['open', 'closed'],
    default: 'closed'
  }
}, { timestamps: true });

readingSchema.index({ binId: 1, createdAt: -1 });

module.exports = mongoose.model('Reading', readingSchema);
