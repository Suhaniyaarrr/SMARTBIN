const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    unique: true,
    default: 'BIN_01'
  },
  location: {
    lat: { type: Number, default: 28.4595 },
    lng: { type: Number, default: 77.0266 }
  },
  maxDistance: {
    type: Number,
    default: 30
  },
  name: {
    type: String,
    default: 'Smart Bin 01'
  }
}, { timestamps: true });

module.exports = mongoose.model('Bin', binSchema);
