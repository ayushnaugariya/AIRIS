"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Moon, RotateCcw, Sun, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/components/providers/theme-provider";
import { useLive } from "@/components/providers/live-provider";
import { cn } from "@/lib/utils";

/**
 * Persistent application shell: collapsible sidebar + sticky topbar +
 * scrollable content region. State survives route changes.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-screen">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[68px]" : "lg:pl-[248px]")}>
          <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-[1560px] flex-1 px-4 py-5 lg:px-6 lg:py-6">{children}</main>
          <footer className="border-t border-border px-4 py-3 lg:px-6">
            <p className="text-[10px] text-muted-foreground">
              AIRIS &middot; AI-Powered Real-Time Airfare Intelligence &amp; Price Index System &middot; Smart India Hackathon 2026
              &middot; Problem SIH26056
            </p>
          </footer>
        </div>
        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </TooltipProvider>
  );
}

function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, setTheme } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);
  const pathname = usePathname();
  const { pushToast } = useLive();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-1/2 top-24 z-[61] w-[min(92vw,420px)] -translate-x-1/2 rounded-lg border border-border bg-popover p-4 shadow-raised"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight">Settings</h3>
              <button onClick={onClose} aria-label="Close settings" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="label-xs mb-1.5">Appearance</p>
                <div className="flex gap-1 rounded-md bg-muted p-0.5">
                  {(["dark", "light"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      aria-pressed={theme === t}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium capitalize transition-colors",
                        theme === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setReducedMotion((r) => !r)}
                className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left transition-colors hover:bg-muted/60"
                aria-pressed={reducedMotion}
              >
                <span>
                  <span className="block text-xs font-medium">Reduce motion</span>
                  <span className="block text-[10px] text-muted-foreground">Minimize transitions across the interface</span>
                </span>
                <span
                  className={cn(
                    "flex h-4 w-7 items-center rounded-full border transition-colors",
                    reducedMotion ? "border-primary bg-primary/30" : "border-border bg-muted"
                  )}
                >
                  <span className={cn("h-3 w-3 rounded-full transition-transform", reducedMotion ? "translate-x-[14px] bg-primary" : "translate-x-0.5 bg-muted-foreground")} />
                </span>
              </button>

              <div>
                <p className="label-xs mb-1.5">Demo controls</p>
                <button
                  onClick={() => {
                    window.localStorage.clear();
                    pushToast({ title: "Demo data reset", body: "Local preferences were cleared. Reload to restore defaults." , tone: "success"});
                    setTimeout(() => window.location.reload(), 600);
                  }}
                  className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/60"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" /> Reset demo state
                  <Check className="ml-auto h-3.5 w-3.5 text-transparent" />
                </button>
              </div>

              <p className="border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">
                Current view: <span className="num">{pathname}</span>. AIRIS runs fully on deterministic mock services until the FastAPI backend is connected.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
