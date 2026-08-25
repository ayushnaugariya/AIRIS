"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Download, FileSearch, Plane, ShoppingBag, Sun, TrendingUp } from "lucide-react";
import type { Anomaly } from "@/types";
import { SeverityBadge } from "./severity-badge";
import { Button } from "@/components/ui/button";
import { ConfidenceMeter } from "@/components/forecasts/confidence-meter";
import { Term } from "@/components/ui/term";
import { formatPct } from "@/lib/format";

const FACTOR_ICONS: Record<string, typeof Plane> = {
  "Capacity reduction": Plane,
  "Capacity reallocation": Plane,
  "High booking velocity": TrendingUp,
  "Booking velocity": TrendingUp,
  "Holiday demand": Sun,
  "Seasonal tourism surge": Sun,
  "Seasonal demand peak": Sun,
};

const CONTRIBUTOR_COLORS = ["#EF4444", "#F59E0B", "#38BDF8"];

/**
 * Explainable-AI panel: why was this flagged, what was expected vs observed,
 * which factors contributed and how confident the model is.
 */
export function AnomalyDetail({
  anomaly,
  onAcknowledge,
}: {
  anomaly: Anomaly | null;
  onAcknowledge?: (id: string) => void;
}) {
  return (
    <div className="relative h-full">
      <AnimatePresence mode="wait">
        {anomaly ? (
          <motion.div
            key={anomaly.id}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <p className="label-xs mb-1">{anomaly.id} &middot; {anomaly.dayLabel} {anomaly.timeLabel}</p>
                <h4 className="text-lg font-semibold tracking-tight num">{anomaly.routeLabel}</h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Fare impact ≈ +{formatINRLite(anomaly.fareMoveINR)} on median observed fare
                </p>
              </div>
              <SeverityBadge severity={anomaly.severity} />
            </div>

            {/* Why flagged */}
            <div className="mt-4 rounded-md border border-primary/25 bg-primary/[0.06] p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                <FileSearch className="h-3.5 w-3.5" /> Why was this flagged?
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">{anomaly.explanation}</p>
            </div>

            {/* Expected vs observed */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Bar
                label="Expected"
                value={anomaly.expectedPct}
                max={Math.max(anomaly.actualPct, anomaly.expectedPct) * 1.15}
                color="#64748B"
              />
              <Bar
                label="Observed"
                value={anomaly.actualPct}
                max={Math.max(anomaly.actualPct, anomaly.expectedPct) * 1.15}
                color={anomaly.severity === "critical" ? "#EF4444" : "#F59E0B"}
              />
            </div>

            <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2">
              <span className="text-xs text-muted-foreground"><Term t="deviation-pp">Deviation</Term></span>
              <span className="text-sm font-bold text-danger num">+{anomaly.deviationPp.toFixed(1)} pp</span>
            </div>

            {/* Contributors */}
            <div className="mt-5">
              <p className="label-xs mb-2"><Term t="contributors">Potential contributors</Term> &middot; model-attributed</p>
              <ul className="space-y-2.5">
                {anomaly.contributors.map((c, i) => {
                  const Icon = FACTOR_ICONS[c.factor] ?? ActivityIcon;
                  return (
                    <li key={c.factor}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
                          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: CONTRIBUTOR_COLORS[i % 3] }} />
                          <span className="truncate">{c.factor}</span>
                        </span>
                        <span className="shrink-0 text-xs font-semibold num" style={{ color: CONTRIBUTOR_COLORS[i % 3] }}>
                          {c.impactPct}%
                        </span>
                      </div>
                      <div className="mt-1 ml-5 h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.impactPct}%` }}
                          transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: CONTRIBUTOR_COLORS[i % 3] }}
                        />
                      </div>
                      <p className="mt-1 ml-5 truncate text-[10px] text-muted-foreground">{c.detail}</p>
                    </li>
                  );
                })}
              </ul>
            </div>

            {anomaly.flightsInScope.length > 0 && (
              <div className="mt-3 rounded-md border border-border bg-background/50 px-3 py-2">
                <p className="label-xs mb-1">
                  <Term t="flight-number">Flights in scope</Term>
                </p>
                <p className="flex flex-wrap gap-1.5">
                  {anomaly.flightsInScope.map((f) => (
                    <span key={f} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold num">
                      {f}
                    </span>
                  ))}
                </p>
              </div>
            )}

            {/* Confidence */}
            <div className="mt-5">
              <ConfidenceMeter value={anomaly.confidencePct} label="Model confidence" info="confidence" />
            </div>

            {/* Actions */}
            <div className="mt-auto flex items-center gap-2 pt-4">
              <Button size="sm" variant={anomaly.status === "open" ? "default" : "secondary"} onClick={() => onAcknowledge?.(anomaly.id)}>
                <BadgeCheck className="h-3.5 w-3.5" />
                {anomaly.status === "open" ? "Acknowledge" : anomaly.status === "acknowledged" ? "Acknowledged" : "Resolved"}
              </Button>
              <Button size="sm" variant="outline" disabled>
                <Download className="h-3.5 w-3.5" /> Export brief
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-md border border-dashed border-border p-6 text-center"
          >
            <FileSearch className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">Select an anomaly</p>
            <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
              Pick a detection from the table to see the expected band, observed movement and model attribution.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="label-xs mb-2">{label}</p>
      <p className="text-xl font-semibold leading-none num" style={{ color }}>
        {formatPct(value)}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function ActivityIcon(props: React.ComponentProps<typeof Sun>) {
  return <ShoppingBag {...props} />;
}

function formatINRLite(v: number): string {
  return `₹${v.toLocaleString("en-IN")}`;
}
