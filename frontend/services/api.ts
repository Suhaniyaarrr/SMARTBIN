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

interface BackendBinResponse {
  id: string;
  fillLevel: number;
  lidStatus: "open" | "closed";
  lastUpdated: string;
  location: BinLocation;
}

// 🔥 FIXED BASE URL (IMPORTANT)
const BASE_URL =
  typeof window === "undefined"
    ? "http://127.0.0.1:5000"
    : "http://localhost:5000";

// API Service Functions
export const api = {
  /**
   * 🔥 Fetch all bins (CONNECTED TO BACKEND)
   */
  async getBins(): Promise<Bin[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/bins`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch bins: ${res.status}`);
      }

      const data = (await res.json()) as BackendBinResponse[];

      return data.map((bin) => ({
        id: bin.id,
        fillLevel: bin.fillLevel,
        status:
          bin.fillLevel <= 50
            ? "low"
            : bin.fillLevel <= 80
            ? "medium"
            : "high",
        lidStatus: bin.lidStatus,
        lastUpdated: bin.lastUpdated,
        location: bin.location,
      }));
    } catch (error) {
      console.error("❌ Error fetching bins:", error);
      return [];
    }
  },

  /**
   * Fetch single bin
   */
  async getBinById(id: string): Promise<Bin | undefined> {
    const bins = await this.getBins();
    return bins.find((bin) => bin.id === id);
  },

  /**
   * 🔥 Fetch alerts (CONNECTED TO BACKEND)
   */
  async getAlerts(): Promise<Alert[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/alerts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch alerts: ${res.status}`);
      }

      const data = (await res.json()) as BackendBinResponse[];

      return data.map((bin, index: number) => ({
        id: `ALERT_${index}`,
        binId: bin.id,
        message: `${bin.id} is ${bin.fillLevel}% full`,
        type: bin.fillLevel >= 80 ? "critical" : "warning",
        timestamp: bin.lastUpdated,
      }));
    } catch (error) {
      console.error("❌ Error fetching alerts:", error);
      return [];
    }
  },

  /**
   * Mock chart data (safe)
   */
  async getFillLevelHistory(binId: string): Promise<FillLevelHistory> {
    const data = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

      data.push({
        timestamp: timestamp.toISOString(),
        fillLevel: Math.min(
          100,
          Math.max(0, 20 + Math.random() * 60 + i * 2)
        ),
      });
    }

    return { binId, data };
  },

  /**
   * Mock comparison data
   */
  async getAllBinsHistory(): Promise<FillLevelHistory[]> {
    const bins = await this.getBins();
    return bins.map((bin) => this.getFillLevelHistory(bin.id));
  },

  /**
   * 🔥 Connection status (REAL CHECK)
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    lastSync: string;
  }> {
    try {
      const res = await fetch(`${BASE_URL}/api/bins`);
      return {
        connected: res.ok,
        lastSync: new Date().toISOString(),
      };
    } catch {
      return {
        connected: false,
        lastSync: new Date().toISOString(),
      };
    }
  },
};

// UI Helpers
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

export const getFillLevelStatus = (
  fillLevel: number
): "low" | "medium" | "high" => {
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