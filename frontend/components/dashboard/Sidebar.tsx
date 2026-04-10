"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { type Bin, getStatusDotColor } from "@/services/api";

interface SidebarProps {
  bins: Bin[];
  activeView: string;
  onViewChange: (view: string) => void;
  isLoading?: boolean;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "map", label: "Map View", icon: Map },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "alerts", label: "Alerts", icon: Bell },
];

export function Sidebar({ bins, activeView, onViewChange, isLoading, collapsed, onCollapse }: SidebarProps) {

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header - Simple text only, no icon */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        {!collapsed ? (
          <span className="text-lg font-semibold text-sidebar-foreground">SmartBin</span>
        ) : (
          <span className="mx-auto text-lg font-semibold text-sidebar-foreground">SB</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        <div className={cn("mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground", collapsed && "hidden")}>
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Bin List */}
        {!collapsed && (
          <div className="mt-6">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Bins
            </div>
            <div className="space-y-1">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-sidebar-accent" />
                  ))}
                </div>
              ) : (
                bins.map((bin) => (
                  <div
                    key={bin.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent"
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", getStatusDotColor(bin.status))} />
                      <span>{bin.id}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{bin.fillLevel}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Collapse Button */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => onCollapse(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
