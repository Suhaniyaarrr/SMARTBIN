require('dotenv').config();
const express = require('express');
const cors = require('cors');
const binRoutes = require('./routes/binRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/*
====================================================
✅ SIMPLE + RELIABLE CORS (FIXES YOUR MAIN ISSUE)
====================================================
*/
app.use(
  cors({
    origin: "*", // 🔥 Allow all origins (fixes Vercel + ESP32 issues)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/*
====================================================
✅ MIDDLEWARE
====================================================
*/
app.use(express.json({ limit: '100kb' }));

/*
====================================================
✅ ROUTES
====================================================
*/
app.use('/api', binRoutes);

/*
====================================================
✅ ROOT ROUTE
====================================================
*/
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

/*
====================================================
✅ HEALTH CHECK
====================================================
*/
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/*
====================================================
✅ HANDLE INVALID JSON
====================================================
*/
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

/*
====================================================
✅ 404 HANDLER
====================================================
*/
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/*
====================================================
✅ GLOBAL ERROR HANDLER (IMPORTANT)
====================================================
*/
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

/*
====================================================
✅ START SERVER
====================================================
*/
app.listen(PORT, '0.0.0.0', () => {
  console.log('===========================================');
  console.log('🚀 SmartBin Backend RUNNING');
  console.log(`🌐 Port: ${PORT}`);
  console.log('===========================================');
});