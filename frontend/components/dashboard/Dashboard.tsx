"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BinCard } from "./BinCard";
import { MapView } from "./MapView";
import { Charts } from "./Charts";
import { AlertsPanel } from "./AlertsPanel";
import { api, type Bin, type Alert } from "@/services/api";
import { Trash2, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [bins, setBins] = useState<Bin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [binsData, alertsData, connectionStatus] = await Promise.all([
        api.getBins(),
        api.getAlerts(),
        api.getConnectionStatus(),
      ]);
      setBins(binsData);
      setAlerts(alertsData);
      setIsConnected(connectionStatus.connected);
      setLastSync(connectionStatus.lastSync);
      setErrorMessage(null);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setIsConnected(false);
      setErrorMessage("Unable to reach backend. Check backend server, API URL, and CORS settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh data every 3 seconds so console-driven changes show up quickly.
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculate summary stats
  const totalBins = bins.length;
  const criticalBins = bins.filter((b) => b.status === "high").length;
  const averageFill = bins.length > 0 ? Math.round(bins.reduce((acc, b) => acc + b.fillLevel, 0) / bins.length) : 0;
  const healthyBins = bins.filter((b) => b.status === "low").length;

  const summaryCards = [
    {
      title: "Total Bins",
      value: totalBins,
      icon: Trash2,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Average Fill",
      value: `${averageFill}%`,
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      title: "Critical",
      value: criticalBins,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    {
      title: "Healthy",
      value: healthyBins,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  const renderContent = () => {
    switch (activeView) {
      case "map":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Map View</h2>
            <MapView bins={bins} isLoading={isLoading} />
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
            <Charts bins={bins} isLoading={isLoading} />
          </div>
        );
      case "alerts":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Alerts</h2>
            <AlertsPanel alerts={alerts} isLoading={isLoading} fullPage />
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {errorMessage && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{card.title}</p>
                        <p className="mt-1 text-2xl font-bold text-card-foreground">{card.value}</p>
                      </div>
                      <div className={cn("rounded-xl p-3", card.bg)}>
                        <Icon className={cn("h-6 w-6", card.color)} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bin Cards Grid */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Bin Status</h2>
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-48 animate-pulse rounded-2xl bg-card" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {bins.map((bin) => (
                    <BinCard key={bin.id} bin={bin} />
                  ))}
                </div>
              )}
            </div>

            {/* Map and Alerts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <MapView bins={bins} isLoading={isLoading} />
              <AlertsPanel alerts={alerts} isLoading={isLoading} />
            </div>

            {/* Charts */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Analytics Overview</h2>
              <Charts bins={bins} isLoading={isLoading} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        bins={bins}
        activeView={activeView}
        onViewChange={setActiveView}
        isLoading={isLoading}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />
      <Navbar
        isConnected={isConnected}
        lastSync={lastSync}
        alertCount={alerts.filter((a) => a.type === "critical" || a.type === "warning").length}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}
