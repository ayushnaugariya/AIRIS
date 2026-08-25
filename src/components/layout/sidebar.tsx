"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeft, X } from "lucide-react";
import { useEffect } from "react";
import { BrandMark } from "./brand-mark";
import { MAIN_NAV, SYSTEM_NAV } from "./nav-items";
import { useLive } from "@/components/providers/live-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile, onOpenSettings }: SidebarProps) {
  const pathname = usePathname();
  const { connected, lastUpdateAt } = useLive();

  // Close the mobile drawer whenever navigation happens.
  useEffect(() => {
    onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const width = collapsed ? "lg:w-[68px]" : "lg:w-[248px]";

  return (
    <>
      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
              onClick={onCloseMobile}
              aria-hidden
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-border bg-card lg:hidden"
              aria-label="AIRIS navigation"
            >
              <SidebarContent
                pathname={pathname}
                collapsed={false}
                connected={connected}
                lastUpdateAt={lastUpdateAt}
                onNavigate={onCloseMobile}
                onOpenSettings={onOpenSettings}
                mobileClose={
                  <button
                    onClick={onCloseMobile}
                    aria-label="Close navigation"
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                }
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop rail */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
          width.replace("lg:", "")
        )}
        aria-label="AIRIS navigation"
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          connected={connected}
          lastUpdateAt={lastUpdateAt}
          onOpenSettings={onOpenSettings}
          toggle={<SidebarToggleButton collapsed={collapsed} onClick={onToggleCollapse} />}
        />
      </aside>
    </>
  );
}

function SidebarToggleButton({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
      className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:block"
    >
      <ChevronsLeft className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")} />
    </button>
  );
}

interface ContentProps {
  pathname: string;
  collapsed: boolean;
  connected: boolean;
  lastUpdateAt: number;
  onNavigate?: () => void;
  onOpenSettings: () => void;
  toggle?: React.ReactNode;
  mobileClose?: React.ReactNode;
}

function SidebarContent({
  pathname,
  collapsed,
  connected,
  lastUpdateAt,
  onNavigate,
  onOpenSettings,
  toggle,
  mobileClose,
}: ContentProps) {
  const secondsAgo = Math.max(0, Math.round((Date.now() - lastUpdateAt) / 1000));
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={cn("flex h-14 items-center gap-2.5 border-b border-border px-3", collapsed ? "justify-center px-0" : "justify-between")}>
        <Link href="/" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5" aria-label="AIRIS home">
          <BrandMark size={30} />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block text-sm font-bold tracking-[0.14em] leading-none">AIRIS</span>
              <span className="mt-1 block truncate text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                SIH 2026 &middot; SIH26056
              </span>
            </span>
          )}
        </Link>
        {toggle}
        {mobileClose}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3" aria-label="Primary">
        {!collapsed && <p className="label-xs mb-1.5 px-2">Intelligence</p>}
        <ul className="space-y-0.5">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* System footer */}
      <div className="border-t border-border p-2">
        {!collapsed && <p className="label-xs mb-1.5 px-2">System</p>}
        <ul className="space-y-0.5">
          <FooterRow collapsed={collapsed}>
            <StatusDot ok={connected} />
            {!collapsed && <span className="text-xs text-muted-foreground">{connected ? "Live feed connected" : "Connecting…"}</span>}
          </FooterRow>
          <FooterRow collapsed={collapsed} asChild>
            <button onClick={onOpenSettings} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted">
              {(() => {
                const SettingsIcon = SYSTEM_NAV[3].icon;
                return <SettingsIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
              })()}
              {!collapsed && <span className="text-xs text-muted-foreground">Settings</span>}
            </button>
          </FooterRow>
          {!collapsed && (
            <li className="mt-1 rounded-md bg-background/60 px-2 py-1.5">
              <p className="label-xs">Last data update</p>
              <p className="mt-0.5 text-[11px] font-medium num text-foreground">{secondsAgo}s ago</p>
            </li>
          )}
        </ul>
        {!collapsed && (
          <div className="mt-2 px-1 pb-1">
            <StatusBadge level={connected ? "connected" : "connecting"} kind="connection" size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}

function FooterRow({
  children,
  collapsed,
  asChild,
}: {
  children: React.ReactNode;
  collapsed: boolean;
  asChild?: boolean;
}) {
  if (asChild) {
    return <li className={cn(collapsed && "flex justify-center")}>{children}</li>;
  }
  return <li className={cn("flex items-center gap-2 rounded-md px-2 py-1.5", collapsed && "justify-center px-0")}>{children}</li>;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", ok ? "bg-success animate-pulse-dot" : "bg-warning animate-pulse-dot")} />
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: (typeof MAIN_NAV)[number];
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-md px-2 py-2 text-xs font-medium transition-colors",
        active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <span
        className={cn(
          "absolute -left-2 top-1/2 h-5 w-[2.5px] -translate-y-1/2 rounded-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
        )}
      />
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}
