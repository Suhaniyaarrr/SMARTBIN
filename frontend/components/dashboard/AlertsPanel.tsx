"use client";

import { cn } from "@/lib/utils";
import { type Alert, formatTimestamp } from "@/services/api";
import { AlertTriangle, AlertCircle, Info, Bell, X } from "lucide-react";

interface AlertsPanelProps {
  alerts: Alert[];
  isLoading?: boolean;
  fullPage?: boolean;
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case "critical":
      return AlertTriangle;
    case "warning":
      return AlertCircle;
    default:
      return Info;
  }
};

const getAlertStyles = (type: string) => {
  switch (type) {
    case "critical":
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        icon: "text-red-400",
        text: "text-red-400",
      };
    case "warning":
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        icon: "text-amber-400",
        text: "text-amber-400",
      };
    default:
      return {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        icon: "text-blue-400",
        text: "text-blue-400",
      };
  }
};

export function AlertsPanel({ alerts, isLoading, fullPage = false }: AlertsPanelProps) {
  // Sort alerts by type (critical first) and then by timestamp
  const sortedAlerts = [...alerts].sort((a, b) => {
    const typeOrder = { critical: 0, warning: 1, info: 2 };
    const typeCompare = typeOrder[a.type] - typeOrder[b.type];
    if (typeCompare !== 0) return typeCompare;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const displayAlerts = fullPage ? sortedAlerts : sortedAlerts.slice(0, 5);

  if (isLoading) {
    return (
      <div className={cn("overflow-hidden rounded-2xl border border-border bg-card", fullPage && "h-full")}>
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Alerts</h3>
        </div>
        <div className="space-y-3 p-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className={cn("overflow-hidden rounded-2xl border border-border bg-card", fullPage && "h-full")}>
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Alerts</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <h4 className="mb-1 font-medium text-card-foreground">All Clear</h4>
          <p className="text-sm text-muted-foreground">No active alerts at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card", fullPage && "h-full")}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Alerts</h3>
          <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
            {alerts.length}
          </span>
        </div>
        {!fullPage && alerts.length > 5 && (
          <span className="text-xs text-muted-foreground">+{alerts.length - 5} more</span>
        )}
      </div>

      <div className={cn("space-y-3 p-4", fullPage && "max-h-[calc(100vh-200px)] overflow-y-auto")}>
        {displayAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const styles = getAlertStyles(alert.type);

          return (
            <div
              key={alert.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:shadow-md",
                styles.bg,
                styles.border
              )}
            >
              <div className="flex gap-3">
                <div className={cn("mt-0.5 shrink-0", styles.icon)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-card-foreground">{alert.message}</p>
                    <button className="shrink-0 rounded-lg p-1 opacity-0 transition-opacity hover:bg-card group-hover:opacity-100">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={cn("font-medium capitalize", styles.text)}>{alert.type}</span>
                    <span className="text-muted-foreground">{formatTimestamp(alert.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
