"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Radio, ShieldAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { liveFeed } from "@/lib/ws/live-feed";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  title: string;
  body: string;
  tone?: "primary" | "warning" | "danger" | "success";
}

interface LiveContextValue {
  connected: boolean;
  lastUpdateAt: number;
  indexValue: number;
  pushToast: (t: Omit<Toast, "id">) => void;
  subscribe: (fn: Parameters<typeof liveFeed.subscribe>[0]) => () => void;
}

const LiveContext = createContext<LiveContextValue>({
  connected: false,
  lastUpdateAt: Date.now(),
  indexValue: 128.6,
  pushToast: () => undefined,
  subscribe: () => () => undefined,
});

export function useLive() {
  return useContext(LiveContext);
}

const TOASE_TONE: Record<string, string> = {
  primary: "bg-primary",
  warning: "bg-warning",
  danger: "bg-danger",
  success: "bg-success",
};

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastUpdateAt, setLastUpdateAt] = useState(() => Date.now());
  const [indexValue, setIndexValue] = useState(128.6);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((list) => [...list.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 6500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((list) => list.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    liveFeed.start();
    setConnected(liveFeed.connected);
    const unsub = liveFeed.subscribe((event) => {
      setLastUpdateAt(event.ts);
      if (event.type === "index.tick") setIndexValue(event.value);
      if (event.type === "anomaly.new") {
        pushToast({
          title: "New anomaly detected",
          body: `${event.anomaly.routeLabel} · ${event.anomaly.actualPct > 0 ? "+" : ""}${event.anomaly.actualPct}% vs expected ${event.anomaly.expectedPct}%`,
          tone: event.anomaly.severity === "critical" ? "danger" : "warning",
        });
      }
    });
    return () => {
      unsub();
      liveFeed.stop();
    };
  }, [pushToast]);

  const value = useMemo<LiveContextValue>(
    () => ({ connected, lastUpdateAt, indexValue, pushToast, subscribe: (fn) => liveFeed.subscribe(fn) }),
    [connected, lastUpdateAt, indexValue, pushToast]
  );

  return (
    <LiveContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="pointer-events-auto overflow-hidden rounded-lg border border-border bg-popover shadow-raised"
              role="status"
            >
              <div className="flex items-start gap-3 p-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted",
                    toast.tone === "danger" && "text-danger",
                    toast.tone === "warning" && "text-warning",
                    !toast.tone || toast.tone === "primary" ? "text-primary" : "",
                    toast.tone === "success" && "text-success"
                  )}
                >
                  {toast.tone === "danger" || toast.tone === "warning" ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : toast.tone === "success" ? (
                    <Radio className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">{toast.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{toast.body}</p>
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className={cn("block h-0.5 w-full", TOASE_TONE[toast.tone ?? "primary"])} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </LiveContext.Provider>
  );
}
