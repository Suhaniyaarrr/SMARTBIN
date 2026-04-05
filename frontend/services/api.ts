const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const mockBins: Bin[] = [
  {
    id: "BIN_01",
    fillLevel: 65,
    status: "medium",
    lidStatus: "closed",
    lastUpdated: new Date().toISOString(),
    location: { lat: 28.4595, lng: 77.0266 },
  },
];

const mockAlerts: Alert[] = [
  {
    id: "ALERT_01",
    binId: "BIN_01",
    message: "BIN_01 is at 65% capacity",
    type: "warning",
    timestamp: new Date().toISOString(),
  },
];

const generateFillLevelHistory = (binId: string): FillLevelHistory => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      fillLevel: Math.min(100, Math.max(0, 30 + Math.random() * 50 + i * 1.5)),
    });
  }
  return { binId, data };
};

const fetchWithFallback = async (url: string, options?: RequestInit, fallbackData?: any) => {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`API unavailable, using fallback data for ${url}`);
    return fallbackData;
  }
};

export const api = {
  async getBins(): Promise<Bin[]> {
    return fetchWithFallback('/api/bin', undefined, mockBins);
  },

  async getBinById(id: string): Promise<Bin | undefined> {
    const bins = await fetchWithFallback('/api/bin', undefined, mockBins);
    return bins.find((bin: Bin) => bin.id === id);
  },

  async getAlerts(): Promise<Alert[]> {
    return fetchWithFallback('/api/alerts', undefined, mockAlerts);
  },

  async getFillLevelHistory(binId: string): Promise<FillLevelHistory> {
    const history = await fetchWithFallback('/api/bin/history?hours=24', undefined, [generateFillLevelHistory(binId)]);
    return history.find((h: FillLevelHistory) => h.binId === binId) || generateFillLevelHistory(binId);
  },

  async getAllBinsHistory(): Promise<FillLevelHistory[]> {
    return fetchWithFallback('/api/bin/history?hours=24', undefined, mockBins.map((bin) => generateFillLevelHistory(bin.id)));
  },

  async getConnectionStatus(): Promise<{ connected: boolean; lastSync: string }> {
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      if (!response.ok) throw new Error('Not connected');
      const data = await response.json();
      return { connected: true, lastSync: data.lastSync };
    } catch {
      return {
        connected: false,
        lastSync: new Date().toISOString(),
      };
    }
  },
};
