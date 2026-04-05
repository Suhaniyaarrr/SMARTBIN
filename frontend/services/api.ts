// Types for the Smart Waste Bin Monitoring System
export interface BinLocation {
  lat: number;
  lng: number;
}

export interface Bin {
  id: string;
  fillLevel: number;
  status: "low" | "medium" | "high";
  lidStatus: "open" | "closed";
  lastUpdated: string;
  location: BinLocation;
}

export interface Alert {
  id: string;
  binId: string;
  message: string;
  type: "warning" | "critical" | "info";
  timestamp: string;
}

export interface FillLevelHistory {
  binId: string;
  data: { timestamp: string; fillLevel: number }[];
}

// Mock data following the exact structure specified
const mockBins: Bin[] = [
  {
    id: "BIN_01",
    fillLevel: 75,
    status: "medium",
    lidStatus: "closed",
    lastUpdated: "2026-04-03T10:30:00Z",
    location: { lat: 28.4595, lng: 77.0266 },
  },
  {
    id: "BIN_02",
    fillLevel: 85,
    status: "high",
    lidStatus: "closed",
    lastUpdated: "2026-04-03T10:25:00Z",
    location: { lat: 28.4612, lng: 77.0289 },
  },
  {
    id: "BIN_03",
    fillLevel: 32,
    status: "low",
    lidStatus: "open",
    lastUpdated: "2026-04-03T10:28:00Z",
    location: { lat: 28.4578, lng: 77.0245 },
  },
  {
    id: "BIN_04",
    fillLevel: 92,
    status: "high",
    lidStatus: "closed",
    lastUpdated: "2026-04-03T10:32:00Z",
    location: { lat: 28.4601, lng: 77.0312 },
  },
  {
    id: "BIN_05",
    fillLevel: 45,
    status: "low",
    lidStatus: "closed",
    lastUpdated: "2026-04-03T10:20:00Z",
    location: { lat: 28.4555, lng: 77.0278 },
  },
  {
    id: "BIN_06",
    fillLevel: 68,
    status: "medium",
    lidStatus: "closed",
    lastUpdated: "2026-04-03T10:18:00Z",
    location: { lat: 28.4623, lng: 77.0234 },
  },
];

const mockAlerts: Alert[] = [
  {
    id: "ALERT_01",
    binId: "BIN_04",
    message: "BIN_04 is 92% full - immediate collection required",
    type: "critical",
    timestamp: "2026-04-03T10:32:00Z",
  },
  {
    id: "ALERT_02",
    binId: "BIN_02",
    message: "BIN_02 is 85% full - schedule collection soon",
    type: "warning",
    timestamp: "2026-04-03T10:25:00Z",
  },
  {
    id: "ALERT_03",
    binId: "BIN_03",
    message: "BIN_03 lid is open",
    type: "info",
    timestamp: "2026-04-03T10:28:00Z",
  },
  {
    id: "ALERT_04",
    binId: "BIN_01",
    message: "BIN_01 approaching capacity at 75%",
    type: "warning",
    timestamp: "2026-04-03T10:30:00Z",
  },
];

// Generate mock fill level history for charts
const generateFillLevelHistory = (binId: string): FillLevelHistory => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      fillLevel: Math.min(100, Math.max(0, 20 + Math.random() * 60 + i * 2)),
    });
  }
  return { binId, data };
};

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API Service Functions - Ready for real backend integration
// Replace the mock implementations with actual API calls to ThingSpeak, Firebase, or custom backend

export const api = {
  /**
   * Fetch all bins
   * Replace with: fetch('YOUR_API_ENDPOINT/bins')
   */
  async getBins(): Promise<Bin[]> {
    await delay(500); // Simulated network delay
    return mockBins;
  },

  /**
   * Fetch a single bin by ID
   * Replace with: fetch(`YOUR_API_ENDPOINT/bins/${id}`)
   */
  async getBinById(id: string): Promise<Bin | undefined> {
    await delay(300);
    return mockBins.find((bin) => bin.id === id);
  },

  /**
   * Fetch all alerts
   * Replace with: fetch('YOUR_API_ENDPOINT/alerts')
   */
  async getAlerts(): Promise<Alert[]> {
    await delay(400);
    return mockAlerts;
  },

  /**
   * Fetch fill level history for a specific bin
   * Replace with: fetch(`YOUR_API_ENDPOINT/bins/${binId}/history`)
   */
  async getFillLevelHistory(binId: string): Promise<FillLevelHistory> {
    await delay(600);
    return generateFillLevelHistory(binId);
  },

  /**
   * Fetch fill level history for all bins (for comparison chart)
   * Replace with: fetch('YOUR_API_ENDPOINT/bins/history')
   */
  async getAllBinsHistory(): Promise<FillLevelHistory[]> {
    await delay(800);
    return mockBins.map((bin) => generateFillLevelHistory(bin.id));
  },

  /**
   * Get connection status
   * Replace with actual backend health check
   */
  async getConnectionStatus(): Promise<{ connected: boolean; lastSync: string }> {
    await delay(200);
    return {
      connected: true,
      lastSync: new Date().toISOString(),
    };
  },
};

// Helper functions for status colors
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "low":
      return "text-emerald-400";
    case "medium":
      return "text-amber-400";
    case "high":
      return "text-red-400";
    default:
      return "text-muted-foreground";
  }
};

export const getStatusBgColor = (status: string): string => {
  switch (status) {
    case "low":
      return "bg-emerald-400/20";
    case "medium":
      return "bg-amber-400/20";
    case "high":
      return "bg-red-400/20";
    default:
      return "bg-muted";
  }
};

export const getStatusDotColor = (status: string): string => {
  switch (status) {
    case "low":
      return "bg-emerald-400";
    case "medium":
      return "bg-amber-400";
    case "high":
      return "bg-red-400";
    default:
      return "bg-muted-foreground";
  }
};

export const getFillLevelStatus = (fillLevel: number): "low" | "medium" | "high" => {
  if (fillLevel <= 50) return "low";
  if (fillLevel <= 80) return "medium";
  return "high";
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
