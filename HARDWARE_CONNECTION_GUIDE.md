# SmartBin Hardware Connection Guide

This guide explains how to connect the ESP32 hardware to the SmartBin backend.

---

## Prerequisites

### Hardware Requirements
- ESP32 Development Board
- HC-SR04 Ultrasonic Sensor
- SG90 Servo Motor
- Buzzer (optional)
- Jumper wires and breadboard

### Software Requirements
- Arduino IDE with ESP32 board support
- Backend server running

---

## Step 1: Hardware Setup

### Pin Connections

| Component | ESP32 Pin | Notes |
|-----------|-----------|-------|
| Ultrasonic Trig | GPIO 5 | Sensor trigger |
| Ultrasonic Echo | GPIO 18 | Sensor echo |
| Servo Signal | GPIO 13 | Servo control |
| Buzzer | GPIO 12 | Audio feedback |

### Circuit Diagram

```
ESP32          HC-SR04          SG90 Servo
------         --------         ----------
GPIO 5  ─────► TRIG            │
GPIO 18 ◄───── ECHO            │
GPIO 13 ──────────────────────► Signal
GPIO 12 ──────────────────────► Buzzer (+)
                               │
GND ───────────────────────────┴── GND
```

---

## Step 2: Configure WiFi & Server

Open the file `hardware/code/smartbin/smartbin.ino` and update these lines:

```cpp
// WiFi Network Credentials
const char* ssid = "YOUR_WIFI_SSID";          // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";  // Replace with your WiFi password

// Backend Server URL
// Replace YOUR_SERVER_IP with your computer's local IP address
const char* serverUrl = "http://YOUR_SERVER_IP:3001/api/bin/data";
```

### Finding Your Computer IP

**Windows:**
```bash
ipconfig
```
Look for IPv4 Address under your WiFi adapter.

**macOS:**
```bash
ifconfig
```
Look for en0 interface IP address.

**Example:**
If your IP is `192.168.1.100`, the server URL should be:
```cpp
const char* serverUrl = "http://192.168.1.100:3001/api/bin/data";
```

---

## Step 3: Install Required Libraries

In Arduino IDE, go to **Sketch → Include Library → Manage Libraries** and install:

1. **ESP32Servo** - For servo motor control
2. **WiFi** - Built-in with ESP32 board
3. **HTTPClient** - Built-in with ESP32 board

---

## Step 4: Upload Code to ESP32

1. Connect ESP32 to your computer via USB
2. In Arduino IDE, select your board: **Tools → Board → ESP32 Dev Module**
3. Select the correct port: **Tools → Port → COMX**
4. Upload the sketch: **Sketch → Upload**

### Viewing Serial Output

1. Open Serial Monitor: **Tools → Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   - WiFi connection status
   - IP address once connected
   - Distance readings
   - Data transmission confirmations

---

## Step 5: Verify Backend Connection

### Check ESP32 is Sending Data

The ESP32 sends data in these scenarios:

1. **Every 10 seconds** - Regular status update
2. **When lid opens** - Object detected
3. **When lid closes** - After 3 seconds

### Test with curl

```bash
# Check health endpoint
curl http://localhost:3001/api/health

# Check bin data
curl http://localhost:3001/api/bin

# Check alerts
curl http://localhost:3001/api/alerts
```

---

## Step 6: Troubleshooting

### ESP32 Not Connecting to WiFi

1. Verify WiFi credentials are correct
2. Check if WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
3. Ensure network allows new devices

### Backend Not Receiving Data

1. Verify server is running: `curl http://localhost:3001/api/health`
2. Check firewall allows port 3001
3. Verify IP address in code is correct

### Common Issues

| Problem | Solution |
|---------|----------|
| "WiFi connection failed" | Check ssid/password, use 2.4GHz network |
| "Connection refused" | Backend not running, start with `npm start` |
| "Connection timeout" | Wrong IP address, verify local IP |
| "HTTP error -1" | Server unreachable, check firewall |

---

## Data Format

### ESP32 Sends

```json
{
  "binId": "BIN_01",
  "distance": 15,
  "lidStatus": "open"
}
```

### Backend Responds

```json
{
  "success": true,
  "reading": {
    "id": "...",
    "binId": "BIN_01",
    "distance": 15,
    "fillLevel": 50,
    "lidStatus": "open",
    "timestamp": "2026-04-06T12:00:00Z"
  }
}
```

---

## Fill Level Calculation

The backend calculates fill level automatically:

```
Fill Level % = ((30 - distance) / 30) × 100

Example: 15cm distance = ((30-15)/30) × 100 = 50% full
```

| Distance | Fill Level | Status |
|----------|------------|--------|
| 0-15cm   | 50-100%    | HIGH   |
| 15-24cm  | 20-50%     | MEDIUM |
| 24-30cm  | 0-20%      | LOW    |

---

## Quick Reference

```cpp
// Key variables to configure
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://192.168.1.X:3001/api/bin/data";
const char* binId = "BIN_01";
```

---

## Need Help?

If issues persist:
1. Check Serial Monitor for error messages
2. Verify backend is running with `curl http://localhost:3001/api/health`
3. Ensure both ESP32 and computer are on the same network
