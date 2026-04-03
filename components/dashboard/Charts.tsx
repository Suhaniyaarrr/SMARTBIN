"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { TrendingUp, BarChart3 } from "lucide-react";
import { api, type FillLevelHistory, type Bin } from "@/services/api";

interface ChartsProps {
  bins: Bin[];
  isLoading?: boolean;
}

// Color palette for charts - using computed hex values
const chartColors = {
  bin1: "#10b981",
  bin2: "#f59e0b",
  bin3: "#ef4444",
  bin4: "#3b82f6",
  bin5: "#8b5cf6",
  bin6: "#06b6d4",
};

export function Charts({ bins, isLoading }: ChartsProps) {
  const [historyData, setHistoryData] = useState<FillLevelHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await api.getAllBinsHistory();
        setHistoryData(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setHistoryLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Transform history data for line chart (fill level over time)
  const lineChartData = historyData[0]?.data.map((_, index) => {
    const point: Record<string, string | number> = {
      time: new Date(historyData[0].data[index].timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    historyData.forEach((history) => {
      point[history.binId] = Math.round(history.data[index]?.fillLevel || 0);
    });
    return point;
  }) || [];

  // Transform bin data for bar chart (current fill levels comparison)
  const barChartData = bins.map((bin, index) => ({
    name: bin.id,
    fillLevel: bin.fillLevel,
    fill: Object.values(chartColors)[index % Object.values(chartColors).length],
  }));

  const lineChartConfig = bins.reduce((acc, bin, index) => {
    acc[bin.id] = {
      label: bin.id,
      color: Object.values(chartColors)[index % Object.values(chartColors).length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const barChartConfig = {
    fillLevel: {
      label: "Fill Level (%)",
      color: "#10b981",
    },
  };

  if (isLoading || historyLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-[400px] animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Line Chart - Fill Level Over Time */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-card-foreground">Fill Level Trends</h3>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </div>
        </div>
        <div className="p-5">
          <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
            <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {bins.slice(0, 4).map((bin, index) => (
                <Line
                  key={bin.id}
                  type="monotone"
                  dataKey={bin.id}
                  stroke={Object.values(chartColors)[index % Object.values(chartColors).length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      {/* Bar Chart - Current Fill Level Comparison */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-card-foreground">Current Fill Levels</h3>
            <p className="text-xs text-muted-foreground">Comparison across all bins</p>
          </div>
        </div>
        <div className="p-5">
          <ChartContainer config={barChartConfig} className="h-[300px] w-full">
            <BarChart data={barChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              />
              <Bar
                dataKey="fillLevel"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
