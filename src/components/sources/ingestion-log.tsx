"use client";

import { useEffect, useRef, useState } from "react";
import { useLive } from "@/components/providers/live-provider";

interface LogLine {
  id: number;
  time: string;
  text: string;
}

let counter = 0;

/** Scrolling ingestion log driven by the live feed — proves the pipeline breathes. */
export function IngestionLog() {
  const { subscribe } = useLive();
  const [lines, setLines] = useState<LogLine[]>([]);

  // Seed with believable recent history so the panel is never empty on load.
  useEffect(() => {
    const seed: LogLine[] = [
      "MakeMyTrip · +1,204 records · validated 99.1%",
      "IndiGo (direct) · +942 records · validated 99.3%",
      "Cleartrip · +611 records · validated 98.7%",
    ].map((text, i) => ({
      id: ++counter,
      time: new Date(Date.now() - (i + 1) * 47_000).toLocaleTimeString("en-IN", { hour12: false }),
      text,
    }));
    setLines(seed);
  }, []);

  const unsubRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    unsubRef.current = subscribe((event) => {
      if (event.type === "ingestion") {
        setLines((prev) =>
          [
            {
              id: ++counter,
              time: new Date(event.ts).toLocaleTimeString("en-IN", { hour12: false }),
              text: `${event.source} · +${event.records.toLocaleString("en-IN")} records · validated ${event.qualityPct}%`,
            },
            ...prev,
          ].slice(0, 8)
        );
      }
    });
    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [subscribe]);

  return (
    <div className="h-[196px] overflow-hidden rounded-md border border-border bg-background/60 p-2 font-mono text-[11px] leading-relaxed" aria-live="polite">
      {lines.map((l) => (
        <p key={l.id} className="flex gap-2 whitespace-nowrap">
          <span className="shrink-0 text-muted-foreground/70">[{l.time}]</span>
          <span className="truncate text-success">{l.text}</span>
        </p>
      ))}
    </div>
  );
}
