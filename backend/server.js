require('dotenv').config();
const express = require('express');
const cors = require('cors');
const binRoutes = require('./routes/binRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

const configuredOrigins = String(FRONTEND_ORIGIN || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const isAllowedPrivateDevOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    if (/^192\.168\./.test(hostname) || /^10\./.test(hostname)) {
      return true;
    }

    const match = hostname.match(/^172\.(\d{1,2})\./);
    if (match) {
      const secondOctet = Number(match[1]);
      return secondOctet >= 16 && secondOctet <= 31;
    }

    return false;
  } catch {
    return false;
  }
};

// Middleware
// Allow configurable frontend origin in production while keeping local dev easy.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (configuredOrigins.length > 0) {
        if (configuredOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      }

      if (isAllowedPrivateDevOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// express.json() allows us to read incoming JSON payloads from the ESP32
app.use(express.json({ limit: '100kb' }));

// Main Routes
app.use('/api', binRoutes);

// Root route so the backend base URL has a friendly response.
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

// Health check for integration and uptime probing.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'smartbin-backend',
    timestamp: new Date().toISOString(),
  });
});

// Centralized handler for invalid JSON bodies from clients.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  return next(err);
});

// Fallback Route for unmatched requests
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Catch-all server error handler to prevent crashes and expose safe messages.
app.use((err, req, res, next) => {
  console.error('Unhandled backend error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server - bind to 0.0.0.0 so ESP32 on the same WiFi can reach it
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n===========================================');
  console.log('   SmartBin Backend is RUNNING');
  console.log('===========================================');
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://0.0.0.0:${PORT}`);
  console.log('');
  console.log('   ESP32 POST endpoint: /api/bin-data');
  console.log('   Frontend GET endpoint: /api/bins');
  console.log('   Alerts GET endpoint: /api/alerts');
  console.log('===========================================\n');
});

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set a different PORT in backend/.env.`);
    process.exit(1);
  }

  console.error('Server failed to start:', error);
  process.exit(1);
});
