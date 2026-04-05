"use client";

import { cn } from "@/lib/utils";
import { type Bin, getStatusColor, getStatusBgColor, formatTimestamp } from "@/services/api";
import { Trash2, DoorOpen, DoorClosed, Clock } from "lucide-react";

interface BinCardProps {
  bin: Bin;
}

export function BinCard({ bin }: BinCardProps) {
  const statusLabel = bin.status === "low" ? "Low" : bin.status === "medium" ? "Medium" : "High";
  
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* Fill Level Background Indicator */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 opacity-20 transition-all duration-500",
          bin.status === "low" && "bg-emerald-500",
          bin.status === "medium" && "bg-amber-500",
          bin.status === "high" && "bg-red-500"
        )}
        style={{ height: `${bin.fillLevel}%` }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("rounded-lg p-2", getStatusBgColor(bin.status))}>
              <Trash2 className={cn("h-5 w-5", getStatusColor(bin.status))} />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">{bin.id}</h3>
              <p className="text-xs text-muted-foreground">Waste Bin</p>
            </div>
          </div>
          <div className={cn("rounded-full px-2 py-0.5 text-xs font-medium", getStatusBgColor(bin.status), getStatusColor(bin.status))}>
            {statusLabel}
          </div>
        </div>

        {/* Fill Level */}
        <div className="mb-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-card-foreground">{bin.fillLevel}%</span>
            <span className="text-sm text-muted-foreground">Fill Level</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                bin.status === "low" && "bg-emerald-500",
                bin.status === "medium" && "bg-amber-500",
                bin.status === "high" && "bg-red-500"
              )}
              style={{ width: `${bin.fillLevel}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              {bin.lidStatus === "open" ? (
                <DoorOpen className="h-4 w-4" />
              ) : (
                <DoorClosed className="h-4 w-4" />
              )}
              <span>Lid Status</span>
            </div>
            <span className={cn("font-medium capitalize", bin.lidStatus === "open" ? "text-amber-400" : "text-card-foreground")}>
              {bin.lidStatus}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last Updated</span>
            </div>
            <span className="font-medium text-card-foreground">{formatTimestamp(bin.lastUpdated)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
