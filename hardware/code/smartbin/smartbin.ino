#include <ESP32Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* ssid = "Suhani";
const char* password = "suhani@123";

// Backend API Configuration
const char* serverAddress = "https://unliterary-unfederatively-eleni.ngrok-free.dev/api/bin-data";  // Change IP to your backend server
const char* binId = "BIN_01";  // Unique identifier for this bin

// GPIO Pins
#define TRIG_PIN 5
#define ECHO_PIN 18
#define SERVO_PIN 13
#define BUZZER_PIN 12

// Sensor Configuration
#define MAX_DISTANCE 50  // cm - bin height
#define MIN_DISTANCE 5   // cm - minimum readable distance
#define CALIBRATION_OFFSET 2  // cm - adjust if needed

Servo myServo;
long duration;
int distance;
int fillLevel = 0;
String lidStatus = "closed";
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 10000;  // Send data every 10 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  myServo.attach(SERVO_PIN);
  myServo.write(0);  // lid closed
  
  Serial.println("\n\n=== SMARTBIN DEVICE STARTING ===");
  Serial.println("Connecting to WiFi...");
  
  connectToWiFi();
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  int attempts = 0;
  
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi Connection Failed!");
  }
}

int getDistance() {
  // Send ultrasonic pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Measure echo duration
  duration = pulseIn(ECHO_PIN, HIGH, 30000);  // 30ms timeout
  
  if (duration == 0) {
    Serial.println("[Sensor] No echo received - sensor error");
    return -1;
  }
  
  // Convert duration to distance (speed of sound = 343 m/s = 0.0343 cm/µs)
  distance = (duration * 0.0343) / 2;
  
  // Basic validation
  if (distance < MIN_DISTANCE || distance > MAX_DISTANCE) {
    Serial.println("[Sensor] Distance out of range: " + String(distance) + "cm");
    return -1;
  }
  
  return distance;
}

int calculateFillLevel(int dist) {
  if (dist < 0) return fillLevel;  // Keep previous value on error
  
  // Calculate fill percentage: (empty - current) / (empty - full) * 100
  // Assuming: empty=MAX_DISTANCE, full=MIN_DISTANCE
  int fill = map(dist, MAX_DISTANCE, MIN_DISTANCE, 0, 100);
  fill = constrain(fill, 0, 100);
  
  return fill;
}

void sendDataToBackend(int distance, int fillPercent) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[API] WiFi not connected, skipping API call");
    return;
  }
  
  HTTPClient http;
  
  // Create JSON payload
  StaticJsonDocument<200> jsonDoc;
  jsonDoc["id"] = binId;
  jsonDoc["fillLevel"] = fillPercent;
  jsonDoc["lidStatus"] = lidStatus;
  jsonDoc["timestamp"] = getTimestamp();
  
  // Location data (Delhi coordinates as example - replace with actual GPS if available)
  jsonDoc["lat"] = 28.6139;  // Latitude
  jsonDoc["lng"] = 77.2090;  // Longitude
  
  String jsonString;
  serializeJson(jsonDoc, jsonString);
  
  Serial.println("[API] Sending payload: " + jsonString);
  
  http.begin(serverAddress);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode == HTTP_CODE_OK || httpCode == 200) {
    Serial.println("[API] ✓ Data sent successfully (HTTP " + String(httpCode) + ")");
    String response = http.getString();
    Serial.println("[API] Response: " + response);
  } else {
    Serial.println("[API] ✗ Failed to send data (HTTP " + String(httpCode) + ")");
  }
  
  http.end();
}

String getTimestamp() {
  // Returns ISO 8601 timestamp (for production, use NTP to get actual time)
  // For now, returns a simple format
  time_t now = time(nullptr);
  struct tm timeinfo = *localtime(&now);
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

void loop() {
  // Read sensor data
  int dist = getDistance();
  
  if (dist >= 0) {
    fillLevel = calculateFillLevel(dist);
    
    Serial.print("[Loop] Distance: ");
    Serial.print(dist);
    Serial.print("cm | Fill Level: ");
    Serial.print(fillLevel);
    Serial.println("%");
    
    // Automatic lid opening when object detected (< 20cm)
    if (dist < 20) {
      Serial.println("[Loop] Object detected - opening lid");
      digitalWrite(BUZZER_PIN, HIGH);
      delay(200);
      digitalWrite(BUZZER_PIN, LOW);
      
      myServo.write(90);  // open lid
      lidStatus = "open";
      delay(3000);
      
      myServo.write(0);   // close lid
      lidStatus = "closed";
      Serial.println("[Loop] Lid closed");
      delay(1000);
    }
  }
  
  // Send data to backend periodically
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = currentTime;
    Serial.println("\n[Loop] Sending data to backend...");
    sendDataToBackend(dist, fillLevel);
    Serial.println();
  }
  
  delay(100);  // 100ms sensor reading interval
}