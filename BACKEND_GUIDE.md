# SmartBin Backend Guide

This guide explains how to set up and run the SmartBin backend server.

---

## Prerequisites

### Software Requirements
- Node.js (v18 or higher)
- MongoDB connection string

### Install Dependencies

```bash
cd backend
npm install
```

---

## Configuration

### Environment Variables

Create or edit `backend/.env`:

```env
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartbin?retryWrites=true&w=majority
```

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port number | 3001 |
| MONGODB_URI | MongoDB connection string | (required) |

### MongoDB Setup

The backend uses MongoDB Atlas. The connection string is already configured:

```
mongodb+srv://parthkhandelwal:parthcodesop@devcluster.5tuzejk.mongodb.net/?retryWrites=true&w=majority&appName=devCluster
```

---

## Running the Server

### Development Mode

```bash
cd backend
npm run dev
```

This starts the server with auto-reload on file changes.

### Production Mode

```bash
cd backend
npm start
```

---

## Verify Server is Running

### Health Check

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "connected": true,
  "lastSync": "2026-04-06T12:00:00.000Z"
}
```

### Get Bin Data

```bash
curl http://localhost:3001/api/bin
```

Expected response:
```json
[
  {
    "id": "BIN_01",
    "fillLevel": 50,
    "status": "medium",
    "lidStatus": "closed",
    "lastUpdated": "2026-04-06T12:00:00.000Z",
    "location": {
      "lat": 28.4595,
      "lng": 77.0266
    }
  }
]
```

### Get Alerts

```bash
curl http://localhost:3001/api/alerts
```

---

## API Endpoints

### POST /api/bin/data

ESP32 sends sensor data here.

**Request:**
```json
{
  "binId": "BIN_01",
  "distance": 15,
  "lidStatus": "open"
}
```

**Response:**
```json
{
  "success": true,
  "reading": {
    "id": "...",
    "binId": "BIN_01",
    "distance": 15,
    "fillLevel": 50,
    "lidStatus": "open",
    "timestamp": "2026-04-06T12:00:00.000Z"
  }
}
```

### GET /api/bin

Returns current bin status for frontend.

### GET /api/bin/history

Returns fill level history for charts.

Query parameters:
- `hours=24` - Number of hours of history (default: 24)

### GET /api/alerts

Returns all alerts sorted by time.

### GET /api/health

Returns connection status.

---

## Project Structure

```
backend/
├── .env                 # Environment variables
├── package.json         # Dependencies
└── src/
    ├── index.js         # Server entry point
    ├── config/
    │   └── db.js        # MongoDB connection
    ├── models/
    │   ├── Bin.js       # Bin metadata
    │   ├── Reading.js   # Sensor readings
    │   └── Alert.js     # System alerts
    ├── routes/
    │   ├── bin.js       # Bin endpoints
    │   └── alerts.js    # Alert endpoints
    ├── services/
    │   └── alertService.js  # Alert generation logic
    └── middleware/
        └── validateBinData.js  # Request validation
```

---

## Troubleshooting

### Server Won't Start

**Port already in use:**
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

**MongoDB connection failed:**
- Check internet connection
- Verify MONGODB_URI in .env
- Ensure MongoDB Atlas cluster is not paused

### Frontend Can't Connect

1. Check server is running: `curl http://localhost:3001/api/health`
2. Verify frontend .env.local has correct API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
3. If running on different machine, use local IP instead of localhost

### ESP32 Can't Connect

1. Verify both ESP32 and server on same network
2. Check firewall allows port 3001
3. Use computer's local IP (not localhost) in ESP32 code

---

## Adding Multiple Bins

Currently configured for single bin (BIN_01). To add more:

1. Update hardware code with unique `binId` for each ESP32
2. Backend automatically creates new bin records on first data received

---

## Monitoring

### View MongoDB Data

Connect to MongoDB Atlas and check:
- `smartbin.bins` - Bin configurations
- `smartbin.readings` - Sensor history
- `smartbin.alerts` - Generated alerts

---

## Quick Commands

```bash
# Start server
cd backend && npm start

# Check if running
curl http://localhost:3001/api/health

# View all bins
curl http://localhost:3001/api/bin

# View recent alerts
curl http://localhost:3001/api/alerts
```

---

## Need Help?

Check the server console output for error messages. Common issues:
- MongoDB connection errors - check internet/credentials
- Route not found - verify endpoint URL
- CORS errors - ensure cors is configured in index.js
