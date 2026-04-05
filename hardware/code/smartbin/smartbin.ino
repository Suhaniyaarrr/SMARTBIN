#include <ESP32Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define TRIG_PIN 5
#define ECHO_PIN 18
#define SERVO_PIN 13
#define BUZZER_PIN 12

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:3001/api/bin/data";

const char* binId = "BIN_01";

Servo myServo;

long duration;
int distance;
bool lidOpen = false;
unsigned long lastUpdate = 0;
const unsigned long updateInterval = 10000;

void connectWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed");
  }
}

int getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  duration = pulseIn(ECHO_PIN, HIGH);
  distance = duration * 0.034 / 2;

  return distance;
}

void sendDataToBackend(int dist, const char* lidStatus) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\"binId\":\"";
    jsonPayload += binId;
    jsonPayload += "\",\"distance\":";
    jsonPayload += String(dist);
    jsonPayload += ",\"lidStatus\":\"";
    jsonPayload += lidStatus;
    jsonPayload += "\"}";

    Serial.println("Sending data: " + jsonPayload);
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response: " + String(httpResponseCode));
      Serial.println("Response: " + response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi not connected, skipping data send");
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  myServo.attach(SERVO_PIN);
  myServo.write(0);

  connectWiFi();

  sendDataToBackend(getDistance(), "closed");
}

void loop() {
  int dist = getDistance();
  Serial.println("Distance: " + String(dist));

  if (dist > 0 && dist < 20) {
    if (!lidOpen) {
      Serial.println("Opening Lid");

      digitalWrite(BUZZER_PIN, HIGH);
      delay(200);
      digitalWrite(BUZZER_PIN, LOW);

      myServo.write(90);
      lidOpen = true;

      sendDataToBackend(dist, "open");

      delay(3000);

      myServo.write(0);
      lidOpen = false;
      Serial.println("Closing Lid");

      sendDataToBackend(getDistance(), "closed");
    }
  } else {
    lidOpen = false;
  }

  unsigned long currentTime = millis();
  if (currentTime - lastUpdate > updateInterval) {
    sendDataToBackend(dist, lidOpen ? "open" : "closed");
    lastUpdate = currentTime;
  }

  delay(200);
}
