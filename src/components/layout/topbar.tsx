"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, Moon, ShieldAlert, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { PAGE_TITLES } from "./nav-items";
import { useLive } from "@/components/providers/live-provider";
import { useFilters } from "@/components/providers/filters-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/lib/mock/routes-data";
import { ANOMALIES } from "@/lib/mock/handlers";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onOpenMobileNav: () => void;
}

const RANGES = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "180d", label: "180D" },
] as const;

export function Topbar({ onOpenMobileNav }: TopbarProps) {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] ?? { title: "AIRIS" };
  const { connected, lastUpdateAt, pushToast } = useLive();
  const filters = useFilters();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [unread, setUnread] = useState(3);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setSecondsAgo(Math.max(0, Math.round((Date.now() - lastUpdateAt) / 1000)));
    const id = setInterval(() => setSecondsAgo(Math.max(0, Math.round((Date.now() - lastUpdateAt) / 1000))), 1000);
    return () => clearInterval(id);
  }, [lastUpdateAt]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileNav} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-sm font-semibold tracking-tight">{page.title}</h1>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground md:inline">
            &middot; SIH26056
          </span>
        </div>
        <p className="hidden truncate text-[11px] text-muted-foreground sm:block">{page.subtitle}</p>
      </div>

      {/* Global controls */}
      <div className="ml-auto hidden items-center gap-1.5 xl:flex">
        <Select value={filters.range} onValueChange={(v) => filters.setRange(v as typeof filters.range)}>
          <SelectTrigger className="w-[76px]" aria-label="Date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.region} onValueChange={filters.setRegion}>
          <SelectTrigger className="w-[110px]" aria-label="Region">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            {["North", "West", "South", "East", "Central", "Northeast"].map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.routeId} onValueChange={filters.setRouteId}>
          <SelectTrigger className="w-[130px]" aria-label="Route">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All routes</SelectItem>
            {ROUTES.slice(0, 14).map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {`${r.originCode} → ${r.destinationCode}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.airline} onValueChange={filters.setAirline}>
          <SelectTrigger className="w-[120px]" aria-label="Airline">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All airlines</SelectItem>
            <SelectItem value="6E">IndiGo</SelectItem>
            <SelectItem value="AI">Air India</SelectItem>
            <SelectItem value="UK">Vistara</SelectItem>
            <SelectItem value="QP">Akasa Air</SelectItem>
            <SelectItem value="SG">SpiceJet</SelectItem>
            <SelectItem value="I5">AIX Connect</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-1 xl:ml-2">
        <span className="mr-1 hidden items-center gap-1.5 rounded border border-border bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground sm:flex">
          <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-success animate-pulse-dot" : "bg-warning animate-pulse-dot")} />
          Updated&nbsp;<span className="num">{mounted ? `${secondsAgo}s` : "—"}</span>&nbsp;ago
        </span>

        <StatusBadge level={connected ? "connected" : "connecting"} kind="connection" size="sm" className="hidden md:inline-flex" />

        <NotificationsMenu onOpen={() => setUnread(0)} unread={unread} />

        <TooltiplessIconButton
          label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </TooltiplessIconButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-[10px] font-bold tracking-wide text-accent transition-colors hover:bg-primary/25"
            >
              AR
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Arjun Rao &middot; Economic Analyst</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => pushToast({ title: "Demo mode", body: "Profile management is not wired in this prototype." })}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => pushToast({ title: "Demo mode", body: "Preferences panel is stubbed for the demo." })}>
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => pushToast({ title: "Demo mode", body: "SSO is not configured in this prototype." })}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function TooltiplessIconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label={label}>
      {children}
    </Button>
  );
}

function NotificationsMenu({ unread, onOpen }: { unread: number; onOpen: () => void }) {
  const latest = ANOMALIES.slice(0, 6);
  return (
    <DropdownMenu onOpenChange={(open) => open && onOpen()}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white num"
              >
                {unread}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Anomaly feed</DropdownMenuLabel>
          <StatusBadge level="connected" kind="connection" size="sm" />
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {latest.map((a) => (
            <DropdownMenuItem key={a.id} asChild>
              <Link href={`/anomalies?focus=${a.id}`} className="cursor-pointer">
                <ShieldAlert
                  className={cn(
                    "shrink-0",
                    a.severity === "critical" ? "text-danger" : a.severity === "high" ? "text-warning" : "text-accent"
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">
                    {a.routeLabel}
                    <span className="ml-1.5 num font-semibold text-muted-foreground">
                      {formatPct(a.actualPct)}
                    </span>
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {a.dayLabel} {a.timeLabel} &middot; expected {formatPct(a.expectedPct)}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/anomalies" className="cursor-pointer text-center text-xs font-medium text-primary">
            Open Anomaly Center
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
