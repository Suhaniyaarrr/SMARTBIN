require('dotenv').config();
const express = require('express');
const cors = require('cors');
const binRoutes = require('./routes/binRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow your Vercel frontend (and fallback for dev)
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN, // from env
  'http://localhost:3000'
].filter(Boolean);

// ✅ CORS setup (clean + safe)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, ESP32, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json({ limit: '100kb' }));

// Routes
app.use('/api', binRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'smartbin-backend',
    message: 'SmartBin backend is running',
    endpoints: {
      health: '/health',
      bins: '/api/bins',
      alerts: '/api/alerts',
      binData: '/api/bin-data',
      status: '/api/status',
    },
  });
});

// Health route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Handle invalid JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

// 404 fallback
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});