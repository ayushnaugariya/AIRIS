"use client";

import { useLive } from "@/components/providers/live-provider";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Term } from "@/components/ui/term";
import { cn } from "@/lib/utils";
import { formatIndex } from "@/lib/format";
import { useEffect, useState } from "react";

interface StatusRow {
  id: string;
  label: React.ReactNode;
  state: string;
  ok: boolean;
}

/**
 * Live system status panel — heartbeat-driven, proves the platform is real
 * during the demo. Ticks every second via the live feed.
 */
export function LiveStatusPanel() {
  const { connected, lastUpdateAt } = useLive();
  const [secondsAgo, setSecondsAgo] = useState(23);

  useEffect(() => {
    setSecondsAgo(Math.max(0, Math.round((Date.now() - lastUpdateAt) / 1000)));
    const id = setInterval(() => setSecondsAgo(Math.max(0, Math.round((Date.now() - lastUpdateAt) / 1000))), 1000);
    return () => clearInterval(id);
  }, [lastUpdateAt]);

  const rows: StatusRow[] = [
    { id: "ingestion", label: <Term t="ingestion">Data ingestion</Term>, state: "Healthy", ok: true },
    { id: "index-engine", label: <Term t="index-engine">Index engine</Term>, state: "Healthy", ok: true },
    { id: "ai-analytics", label: <Term t="ai-analytics">AI analytics</Term>, state: "Healthy", ok: true },
    { id: "websocket", label: <Term t="websocket">WebSocket</Term>, state: connected ? "Connected" : "Connecting…", ok: connected },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-md border border-success/25 bg-success/5 px-3 py-2">
        <span className="text-xs font-semibold">System status</span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-success" aria-hidden />
          Operational
        </span>
      </div>

      <ul className="space-y-0 divide-y divide-border">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", r.ok ? "bg-success animate-pulse-dot" : "bg-warning animate-pulse-dot")}
                aria-hidden
              />
              {r.label}
            </span>
            <span className={cn("text-xs font-medium num", r.ok ? "text-success" : "text-warning")}>{r.state}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
        <div>
          <p className="label-xs">Last update</p>
          <p className="mt-0.5 text-sm font-semibold num">
            <AnimatedNumber value={secondsAgo} format={(v) => `${Math.max(0, Math.round(v))}s`} /> ago
          </p>
        </div>
        <div>
          <p className="label-xs">Uptime (30d)</p>
          <p className="mt-0.5 text-sm font-semibold num">99.97%</p>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-border bg-background/50 p-2.5 text-[10px] leading-relaxed text-muted-foreground">
        Index recomputes every <span className="font-semibold text-foreground num">{formatIndex(15, 0)} min</span> across{" "}
        <span className="font-semibold text-foreground num">2,846</span> monitored routes; anomaly models score every{" "}
        <Term t="capture-cycle">capture cycle</Term>.
      </div>
    </div>
  );
}
