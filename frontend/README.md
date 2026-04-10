# Frontend - SmartBin
# 💻 SmartBin – Frontend Dashboard

## 🔹 Overview

This folder contains the frontend implementation of the **SmartBin – IoT-Based Smart Waste Bin Monitoring System**.

The frontend is a **web-based dashboard** that provides real-time visualization and monitoring of multiple smart waste bins. It displays bin status, fill levels, location, alerts, and analytics in a clean, user-friendly interface.

---

## 🔹 Tech Stack

* **React (Functional Components)**
* **Tailwind CSS**
* **JavaScript (ES6+)**
* **Chart.js / Recharts** (for analytics)
* **Google Maps API** (for location visualization)

---

## 🔹 Key Features

### 1. 📊 Dashboard Overview

* Displays all bins in a card layout
* Shows:

  * Bin ID
  * Fill percentage
  * Status (Low / Medium / Full)
* Color-coded indicators:

  * 🟢 Green (0–50%)
  * 🟡 Yellow (50–80%)
  * 🔴 Red (80%+)

---

### 2. 🗺️ Map View

* Displays bin locations using latitude & longitude
* Interactive map with markers
* Clicking a marker shows:

  * Bin ID
  * Fill level
  * Last updated time

---

### 3. 📈 Analytics

* Line chart → Waste level over time
* Bar chart → Comparison between bins
* Helps analyze waste patterns and trends

---

### 4. 🚨 Alerts Panel

* Displays real-time alerts for bins that are full
* Example:

  * “BIN_02 is 85% full”
* Includes timestamp
* Highlights critical alerts

---

### 5. 🌗 Theme Toggle

* Supports **Light Mode & Dark Mode**
* Toggle available in navbar
* Ensures readability and modern UI experience

---

## 🔹 Data Handling & Integration

* Uses a centralized API service (`services/api.js`)
* Simulates backend using async functions
* Easily replaceable with real APIs:

  * ThingSpeak API
  * Firebase
  * Custom backend

### Sample Data Format:

```json
{
  "id": "BIN_01",
  "fillLevel": 75,
  "status": "medium",
  "lidStatus": "closed",
  "lastUpdated": "2026-04-03T10:30:00Z",
  "location": {
    "lat": 28.2715766,
    "lng": 77.069847
  }
}
```

---

## 🔹 Project Structure

```
frontend/
│
├── components/
│   ├── Sidebar.jsx
│   ├── Navbar.jsx
│   ├── BinCard.jsx
│   ├── MapView.jsx
│   ├── Charts.jsx
│   └── AlertsPanel.jsx
│
├── pages/
│   └── Dashboard.jsx
│
├── services/
│   └── api.js
│
└── App.jsx
```

---

## 🔹 Setup Instructions

1. Navigate to frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

   or

   ```bash
   npm start
   ```

4. Open in browser:

   ```
   http://localhost:3000
   ```

---

## 🔹 API Integration

To connect with real backend:

* Replace mock API in `services/api.js` with:

  * ThingSpeak API:

    ```
    https://api.thingspeak.com/channels/YOUR_CHANNEL_ID/feeds.json
    ```
* Map response data to frontend format

---

## 🔹 Deployment

* Build project:

  ```bash
  npm run build
  ```

* Deploy using:

  * Vercel
  * Netlify

---

## 🔹 Expected Output

* Real-time bin monitoring dashboard
* Interactive map with bin locations
* Live alerts for full bins
* Analytics for waste trends
* Smooth and responsive UI

---

## 🔹 Notes

* Designed for easy backend integration
* Uses mock data for development
* Can support real-time updates via polling or Firebase

---

## 🔹 Future Improvements

* Add authentication (admin panel)
* Real-time updates using WebSockets
* Advanced analytics (AI-based predictions)
* Mobile responsiveness optimization

---

## 👩‍💻 Developed As Part of

SmartBin – IoT-Based Smart Waste Management System