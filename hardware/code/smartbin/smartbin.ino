#include <WiFi.h>
#include <HTTPClient.h>

#if __has_include(<ESP32Servo.h>)
#include <ESP32Servo.h>
#else
#error "ESP32Servo library is required. Install it from Library Manager."
#endif

#if __has_include(<TinyGPSPlus.h>)
#include <TinyGPSPlus.h>
#define GPS_LIB_AVAILABLE 1
#else
#define GPS_LIB_AVAILABLE 0
#endif

// ----------------------
// Network configuration
// ----------------------
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverName = "http://192.168.1.100:5000/api/bin-data";

// ----------------------
// Bin/device identifiers
// ----------------------
const char* BIN_ID = "BIN_01";

// ----------------------
// Hardware pin mapping
// ----------------------
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const int IR_PIN = 19;
const int SERVO_PIN = 13;

// ----------------------
// Sensor and servo tuning
// ----------------------
const float BIN_DEPTH_CM = 30.0f;
const int SERVO_CLOSED_ANGLE = 0;
const int SERVO_OPEN_ANGLE = 90;
const unsigned long LID_OPEN_MS = 2500;

// ----------------------
// Telemetry timings
// ----------------------
const unsigned long SEND_INTERVAL_MS = 10000;
const unsigned long WIFI_RETRY_INTERVAL_MS = 5000;

Servo lidServo;
unsigned long lastSendAt = 0;
unsigned long lastWifiRetryAt = 0;
unsigned long lidOpenedAt = 0;
bool lidIsOpen = false;

#if GPS_LIB_AVAILABLE
const bool USE_GPS = false;
TinyGPSPlus gps;
HardwareSerial GPSSerial(1);
const int GPS_RX_PIN = 16;
const int GPS_TX_PIN = 17;
#endif

float clampf(float value, float minValue, float maxValue) {
  if (value < minValue) return minValue;
  if (value > maxValue) return maxValue;
  return value;
}

void connectWiFiIfNeeded() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  unsigned long now = millis();
  if (now - lastWifiRetryAt < WIFI_RETRY_INTERVAL_MS) {
    return;
  }

  lastWifiRetryAt = now;
  Serial.print("[WiFi] Connecting to ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
}

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(3);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration <= 0) {
    return -1.0f;
  }

  float distanceCm = (duration * 0.0343f) / 2.0f;
  return distanceCm;
}

float readFillLevelPercent() {
  float distance = readDistanceCm();
  if (distance < 0.0f) {
    Serial.println("[Sensor] Ultrasonic read timeout, keeping last safe value 0%");
    return 0.0f;
  }

  float filledCm = BIN_DEPTH_CM - distance;
  float fillPercent = (filledCm / BIN_DEPTH_CM) * 100.0f;
  return clampf(fillPercent, 0.0f, 100.0f);
}

void updateLidByIR() {
  int irState = digitalRead(IR_PIN);
  bool objectDetected = (irState == LOW);

  if (objectDetected && !lidIsOpen) {
    lidServo.write(SERVO_OPEN_ANGLE);
    lidIsOpen = true;
    lidOpenedAt = millis();
    Serial.println("[LID] Object detected -> opening lid");
  }

  if (lidIsOpen && (millis() - lidOpenedAt >= LID_OPEN_MS)) {
    lidServo.write(SERVO_CLOSED_ANGLE);
    lidIsOpen = false;
    Serial.println("[LID] Closing lid after timeout");
  }
}

String getLidStatus() {
  return lidIsOpen ? "open" : "closed";
}

void sendData(float fillLevel) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Skipped: WiFi not connected");
    return;
  }

  float lat = 0.0f;
  float lng = 0.0f;

#if GPS_LIB_AVAILABLE
  if (USE_GPS) {
    while (GPSSerial.available() > 0) {
      gps.encode(GPSSerial.read());
    }
    if (gps.location.isValid()) {
      lat = gps.location.lat();
      lng = gps.location.lng();
    }
  }
#endif

  HTTPClient http;
  http.begin(serverName);
  http.setConnectTimeout(5000);
  http.setTimeout(5000);
  http.addHeader("Content-Type", "application/json");

  String json = "{";
  json += "\"id\":\"" + String(BIN_ID) + "\",";
  json += "\"fillLevel\":" + String(fillLevel, 1) + ",";
  json += "\"lidStatus\":\"" + getLidStatus() + "\",";
  json += "\"lat\":" + String(lat, 6) + ",";
  json += "\"lng\":" + String(lng, 6) + ",";
  json += "\"wifiRssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"deviceUptimeMs\":" + String(millis());
  json += "}";

  int responseCode = http.POST(json);
  Serial.print("[HTTP] POST /api/bin-data -> ");
  Serial.println(responseCode);

  if (responseCode > 0) {
    String responseBody = http.getString();
    Serial.print("[HTTP] Response: ");
    Serial.println(responseBody);
  } else {
    Serial.print("[HTTP] Error: ");
    Serial.println(http.errorToString(responseCode));
  }

  http.end();
}

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(IR_PIN, INPUT_PULLUP);

  lidServo.attach(SERVO_PIN);
  lidServo.write(SERVO_CLOSED_ANGLE);

#if GPS_LIB_AVAILABLE
  if (USE_GPS) {
    GPSSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  }
#endif

  Serial.println("\n=== SmartBin Boot ===");
  Serial.println("[Init] Starting WiFi connection...");
  connectWiFiIfNeeded();
}

void loop() {
  connectWiFiIfNeeded();
  updateLidByIR();

  unsigned long now = millis();
  if (now - lastSendAt >= SEND_INTERVAL_MS) {
    float fillLevel = readFillLevelPercent();
    Serial.print("[Sensor] Fill level (%): ");
    Serial.println(fillLevel, 1);
    sendData(fillLevel);
    lastSendAt = now;
  }

  delay(50);
}