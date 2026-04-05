# 🗑️ Smart Dustbin with GPS Tracking & Level Monitoring using ESP32

## 📌 Overview

This project is an **IoT-based Smart Dustbin** that automatically opens its lid when an object comes near it. It also includes **real-time garbage level monitoring** and **GPS tracking**, making it ideal for smart city and waste management systems.

The system uses an **ESP32 microcontroller**, **ultrasonic sensors**, **servo motor**, **buzzer**, and a **GPS module** to provide a smart, hygienic, and trackable waste management solution.

---

## 🚀 Features

* 🖐️ Automatic lid opening using ultrasonic sensor
* 🔊 Buzzer alert on object detection
* 📊 Garbage level monitoring (full/empty detection)
* 📍 Real-time GPS location tracking
* 🌐 IoT-ready system (can be integrated with web/app dashboard)
* 🔋 Battery-powered and portable

---

## 🛠️ Components Used

* ESP32 DevKit V1 (WROOM)
* HC-SR04 Ultrasonic Sensor (for lid detection)
* Ultrasonic Sensor / IR Sensor (for garbage level)
* SG90 Servo Motor
* Buzzer (Active)
* GPS Module (NEO-6M recommended)
* Battery / Power Supply (5V)
* Jumper Wires
* Breadboard (optional)

---

## 🔌 Circuit Connections

### 🔹 Ultrasonic Sensor (Lid Detection)

* VCC → 5V
* GND → GND
* TRIG → GPIO 5
* ECHO → GPIO 18 *(use voltage divider)*

---

### 🔹 Garbage Level Sensor (Ultrasonic/IR)

* VCC → 5V
* GND → GND
* TRIG → GPIO 19
* ECHO → GPIO 21

---

### 🔹 Servo Motor

* Red → 5V (external power recommended)
* Brown → GND
* Orange → GPIO 13

---

### 🔹 Buzzer

* Positive → GPIO 12
* Negative → GND

---

### 🔹 GPS Module (NEO-6M)

* VCC → 3.3V / 5V
* GND → GND
* TX → GPIO 16 (RX2)
* RX → GPIO 17 (TX2)

---

## ⚠️ Important Notes

* Use **voltage divider** for ultrasonic ECHO pins
* Servo requires **external power supply**
* Ensure **common ground connection**
* GPS requires **open sky for accurate signal**

---

## 💻 Installation & Setup

### 1. Install ESP32 Board

* File → Preferences → Add:
  https://dl.espressif.com/dl/package_esp32_index.json
* Install ESP32 from Board Manager

---

### 2. Install Required Libraries

* ESP32Servo
* TinyGPSPlus

---

### 3. Upload Code

* Select Board: ESP32 Dev Module
* Select correct COM Port
* Upload code

---

## 🧾 Code (Basic Combined Example)

```cpp
#include <ESP32Servo.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>

#define TRIG1 5
#define ECHO1 18
#define TRIG2 19
#define ECHO2 21
#define SERVO_PIN 13
#define BUZZER 12

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

Servo myServo;

long duration;
int distance;

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);

  pinMode(TRIG1, OUTPUT);
  pinMode(ECHO1, INPUT);
  pinMode(TRIG2, OUTPUT);
  pinMode(ECHO2, INPUT);
  pinMode(BUZZER, OUTPUT);

  myServo.attach(SERVO_PIN);
  myServo.write(0);
}

int getDistance(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  duration = pulseIn(echo, HIGH);
  return duration * 0.034 / 2;
}

void loop() {
  int lidDist = getDistance(TRIG1, ECHO1);
  int levelDist = getDistance(TRIG2, ECHO2);

  // Lid Control
  if (lidDist < 20) {
    digitalWrite(BUZZER, HIGH);
    delay(200);
    digitalWrite(BUZZER, LOW);

    myServo.write(90);
    delay(3000);
    myServo.write(0);
  }

  // Garbage Level Alert
  if (levelDist < 10) {
    Serial.println("Dustbin FULL!");
  }

  // GPS Data
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
    if (gps.location.isUpdated()) {
      Serial.print("Lat: ");
      Serial.println(gps.location.lat(), 6);
      Serial.print("Lng: ");
      Serial.println(gps.location.lng(), 6);
    }
  }

  delay(500);
}
```

---

## ⚙️ Working Principle

1. Ultrasonic sensor detects hand → lid opens
2. Second sensor measures garbage level
3. If bin is full → alert generated
4. GPS module continuously tracks location
5. Data can be sent to IoT dashboard

---

## 📈 Future Improvements

* Mobile app for live tracking
* SMS alert when bin is full
* AI-based waste classification
* Solar-powered system

---

## 🎯 Applications

* Smart cities
* Municipal waste management
* Public areas (parks, malls)
* Hospitals

---

## 👨‍💻 Author

**Suhani Gupta**
B.Tech CSE (AI & ML) - 2401730139

**Gaurav Chauhan**
B.Tech CSE (AI & ML) - 2401730146

**Rudransh Gupta**
B.Tech CSE (AI & ML) - 2401730199

**Divayam Yadav**
B.Tech CSE (AI & ML) - 2401730220

**Saksham**
B.Tech CSE (AI & ML) - 2401730275

---

## 📜 License

Open-source project for educational and research purposes.
