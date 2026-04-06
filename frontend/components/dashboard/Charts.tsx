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

// Color palette
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
        setHistoryData(data || []);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setHistoryData([]);
      } finally {
        setHistoryLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // 🔥 SAFE LINE CHART DATA (FIXED)
  const lineChartData =
    historyData?.length > 0 && historyData[0]?.data
      ? historyData[0].data.map((_, index) => {
          const point: Record<string, string | number> = {
            time: new Date(
              historyData[0].data[index]?.timestamp
            ).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          historyData.forEach((history) => {
            point[history.binId] = Math.round(
              history.data?.[index]?.fillLevel || 0
            );
          });

          return point;
        })
      : [];

  // Bar chart data (safe)
  const barChartData =
    bins?.length > 0
      ? bins.map((bin, index) => ({
          name: bin.id,
          fillLevel: bin.fillLevel,
          fill:
            Object.values(chartColors)[
              index % Object.values(chartColors).length
            ],
        }))
      : [];

  const lineChartConfig = bins.reduce((acc, bin, index) => {
    acc[bin.id] = {
      label: bin.id,
      color:
        Object.values(chartColors)[
          index % Object.values(chartColors).length
        ],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const barChartConfig = {
    fillLevel: {
      label: "Fill Level (%)",
      color: "#10b981",
    },
  };

  // 🔥 LOADING STATE
  if (isLoading || historyLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-[400px] animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  // 🔥 EMPTY STATE (IMPORTANT FIX)
  if (!lineChartData.length) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No chart data available yet...
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Line Chart */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Fill Level Trends</h3>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </div>
        </div>

        <div className="p-5">
          <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />

              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />

              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />

              {bins.slice(0, 4).map((bin, index) => (
                <Line
                  key={bin.id}
                  type="monotone"
                  dataKey={bin.id}
                  stroke={
                    Object.values(chartColors)[
                      index % Object.values(chartColors).length
                    ]
                  }
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Current Fill Levels</h3>
          </div>
        </div>

        <div className="p-5">
          <ChartContainer config={barChartConfig} className="h-[300px] w-full">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />

              <ChartTooltip content={<ChartTooltipContent />} />

              <Bar dataKey="fillLevel" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}