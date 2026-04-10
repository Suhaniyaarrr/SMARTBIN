"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { type Bin, getStatusColor, formatTimestamp } from "@/services/api";
import { X, Trash2, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  bins: Bin[];
  isLoading?: boolean;
}

export function MapView({ bins, isLoading }: MapViewProps) {
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);

  // Calculate positions for bins on the map (normalized to viewport)
  const getBinPosition = (bin: Bin, index: number) => {
    // Distribute bins across the map area
    const positions = [
      { top: "20%", left: "25%" },
      { top: "35%", left: "65%" },
      { top: "55%", left: "35%" },
      { top: "25%", left: "75%" },
      { top: "65%", left: "55%" },
      { top: "45%", left: "20%" },
    ];
    return positions[index % positions.length];
  };

  if (isLoading) {
    return (
      <div className="flex h-125 items-center justify-center rounded-2xl border border-border bg-card">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {/* Map Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Bin Locations</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-112.5 bg-secondary/30">
        {/* Grid Pattern Background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Map placeholder text */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-xs text-muted-foreground/50">
            Connect Google Maps API for real map integration
          </p>
        </div>

        {/* Bin Markers */}
        {bins.map((bin, index) => {
          const position = getBinPosition(bin, index);
          const isSelected = selectedBin?.id === bin.id;

          return (
            <button
              key={bin.id}
              onClick={() => setSelectedBin(isSelected ? null : bin)}
              className="absolute z-10 -translate-x-1/2 -translate-y-full transform transition-all duration-200 hover:scale-110"
              style={{ top: position.top, left: position.left }}
            >
              <div className="relative">
                {/* Pulse effect for high fill bins */}
                {bin.status === "high" && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
                )}
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 border-card shadow-lg transition-all",
                    bin.status === "low" && "bg-emerald-500",
                    bin.status === "medium" && "bg-amber-500",
                    bin.status === "high" && "bg-red-500",
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-card"
                  )}
                >
                  <Trash2 className="h-5 w-5 text-card" />
                </div>
                {/* Pin tail */}
                <div
                  className={cn(
                    "mx-auto -mt-1 h-3 w-3 rotate-45 transform",
                    bin.status === "low" && "bg-emerald-500",
                    bin.status === "medium" && "bg-amber-500",
                    bin.status === "high" && "bg-red-500"
                  )}
                />
              </div>
            </button>
          );
        })}

        {/* Selected Bin Info Panel */}
        {selectedBin && (
          <div className="absolute bottom-4 left-4 right-4 z-20 overflow-hidden rounded-xl border border-border bg-card/95 shadow-xl backdrop-blur sm:left-auto sm:w-80">
            <div className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      selectedBin.status === "low" && "bg-emerald-500/20",
                      selectedBin.status === "medium" && "bg-amber-500/20",
                      selectedBin.status === "high" && "bg-red-500/20"
                    )}
                  >
                    <Trash2 className={cn("h-5 w-5", getStatusColor(selectedBin.status))} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">{selectedBin.id}</h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedBin.location.lat.toFixed(4)}, {selectedBin.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBin(null)}
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fill Level</span>
                  <span className={cn("text-sm font-semibold", getStatusColor(selectedBin.status))}>
                    {selectedBin.fillLevel}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      selectedBin.status === "low" && "bg-emerald-500",
                      selectedBin.status === "medium" && "bg-amber-500",
                      selectedBin.status === "high" && "bg-red-500"
                    )}
                    style={{ width: `${selectedBin.fillLevel}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-muted-foreground">Lid Status</span>
                  <span className="text-sm font-medium capitalize text-card-foreground">{selectedBin.lidStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium text-card-foreground">{formatTimestamp(selectedBin.lastUpdated)}</span>
                </div>
              </div>

              {/* Open in Google Maps Button */}
              <div className="mt-4 border-t border-border pt-3">
                <Button
                  asChild
                  className="w-full gap-2"
                  size="sm"
                >
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedBin.location.lat},${selectedBin.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Google Maps
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
