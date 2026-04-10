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
  status: "Low" | "Medium" | "Full" | "low" | "medium" | "high";
  lastUpdated: string;
  location: BinLocation;
}

interface BackendStatusResponse {
  status: "ok" | "error";
  timestamp: string;
  totalBins: number;
  criticalBins: number;
  latestUpdate: string | null;
}

const DEFAULT_API_BASE = "http://localhost:5000";

const isLocalHostName = (hostname: string): boolean =>
  hostname === "localhost" || hostname === "127.0.0.1";

const mapLocalhostToCurrentHost = (url: string): string => {
  if (typeof window === "undefined") {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (isLocalHostName(parsed.hostname)) {
      parsed.hostname = window.location.hostname;
      return parsed.toString().replace(/\/$/, "");
    }
  } catch {
    return url;
  }

  return url;
};

const resolveApiBaseUrl = (): string => {
  const envUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    return mapLocalhostToCurrentHost(envUrl.replace(/\/$/, ""));
  }

  // During local development, same-origin avoids hardcoded host mismatches.
  if (typeof window !== "undefined") {
    return "";
  }

  return DEFAULT_API_BASE;
};

const BASE_URL = resolveApiBaseUrl();

const normalizeStatus = (status: BackendBinResponse["status"]): Bin["status"] => {
  const normalized = String(status).toLowerCase();

  if (normalized === "full" || normalized === "high") return "high";
  if (normalized === "medium") return "medium";
  return "low";
};

const parseJson = async <T>(res: Response): Promise<T> => {
  try {
    return (await res.json()) as T;
  } catch {
    throw new Error("Invalid JSON response from backend");
  }
};

// API Service Functions
export const api = {
  /**
   * 🔥 Fetch all bins (CONNECTED TO BACKEND)
   */
  async getBins(): Promise<Bin[]> {
    console.log("[SmartBin API] GET /api/bins ->", `${BASE_URL}/api/bins`);
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

    const data = await parseJson<{ bins?: BackendBinResponse[] } | BackendBinResponse[]>(res);
    console.log("[SmartBin API] /api/bins raw response:", data);

    const bins = Array.isArray(data) ? data : data.bins || [];

    return bins.map((bin) => ({
      id: bin.id,
      fillLevel: bin.fillLevel,
      status: normalizeStatus(bin.status),
      lidStatus: "closed",
      lastUpdated: bin.lastUpdated,
      location: bin.location,
    }));
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
    console.log("[SmartBin API] GET /api/alerts ->", `${BASE_URL}/api/alerts`);
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

    const data = await parseJson<{ bins?: BackendBinResponse[] } | BackendBinResponse[]>(res);
    console.log("[SmartBin API] /api/alerts raw response:", data);

    const alerts = Array.isArray(data) ? data : data.bins || [];

    return alerts.map((bin, index: number) => ({
      id: `ALERT_${index}`,
      binId: bin.id,
      message: `${bin.id} is ${bin.fillLevel}% full`,
      type: bin.fillLevel >= 80 ? "critical" : "warning",
      timestamp: bin.lastUpdated,
    }));
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
    return Promise.all(bins.map((bin) => this.getFillLevelHistory(bin.id)));
  },

  /**
   * 🔥 Connection status (REAL CHECK)
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    lastSync: string;
  }> {
    try {
      console.log("[SmartBin API] GET /api/status ->", `${BASE_URL}/api/status`);
      const res = await fetch(`${BASE_URL}/api/status`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        return {
          connected: false,
          lastSync: new Date().toISOString(),
        };
      }

      const status = await parseJson<BackendStatusResponse>(res);
      console.log("[SmartBin API] /api/status raw response:", status);
      return {
        connected: status.status === "ok",
        lastSync: status.timestamp,
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