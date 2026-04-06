require('dotenv').config();
const express = require('express');
const cors = require('cors');
const binRoutes = require('./routes/binRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// cors() enables the frontend React app to safely fetch data from this backend
app.use(cors());

// express.json() allows us to read incoming JSON payloads from the ESP32
app.use(express.json());

// Main Routes
app.use('/api', binRoutes);

// Fallback Route for unmatched requests
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`SmartBin Backend running on port ${PORT}`);
});
