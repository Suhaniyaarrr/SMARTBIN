require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const binRoutes = require('./routes/bin');
const alertsRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

connectDB();

app.get('/api/health', (req, res) => {
  res.json({
    connected: true,
    lastSync: new Date().toISOString()
  });
});

app.use('/api/bin', binRoutes);
app.use('/api/alerts', alertsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`SmartBin API running on port ${PORT}`);
});

module.exports = app;
