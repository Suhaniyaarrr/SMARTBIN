"use client";

import { Bell, Wifi, WifiOff, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  isConnected: boolean;
  lastSync: string | null;
  alertCount: number;
  sidebarCollapsed?: boolean;
}

export function Navbar({ isConnected, lastSync, alertCount, sidebarCollapsed }: NavbarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-64"
      )}
    >
      <div>
        <h1 className="text-lg font-semibold text-foreground">Smart Waste Monitoring Dashboard</h1>
        <p className="text-xs text-muted-foreground">Real-time IoT bin monitoring system</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <Wifi className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Connected</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <WifiOff className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Offline</span>
            </>
          )}
        </div>

        {/* Last Sync */}
        <div className="hidden text-xs text-muted-foreground sm:block">
          Last sync: {formatLastSync(lastSync)}
        </div>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              {resolvedTheme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
              <Sun className="h-4 w-4" />
              <span>Light</span>
              {theme === "light" && <span className="ml-auto text-primary">Active</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark</span>
              {theme === "dark" && <span className="ml-auto text-primary">Active</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
              <Monitor className="h-4 w-4" />
              <span>System</span>
              {theme === "system" && <span className="ml-auto text-primary">Active</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification Bell */}
        <button className="relative rounded-lg p-2 transition-colors hover:bg-accent">
          <Bell className="h-5 w-5 text-foreground" />
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
