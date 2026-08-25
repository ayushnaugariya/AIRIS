"use client";

import { useRouter } from "next/navigation";
import { MoveRight } from "lucide-react";
import type { RouteForecast } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrendPill } from "@/components/ui/trend-pill";

/** Ranked routes expected to move — links into Route Intelligence. */
export function RisingRoutesList({ routes }: { routes: RouteForecast[] }) {
  const router = useRouter();
  return (
    <ol className="divide-y divide-border">
      {routes.map((r, i) => (
        <li key={r.routeId}>
          <button
            onClick={() => router.push(`/routes?id=${r.routeId}`)}
            className="group flex w-full items-center gap-3 rounded-md px-1 py-2.5 text-left transition-colors hover:bg-muted/60"
          >
            <span className="w-4 text-[11px] font-medium text-muted-foreground num">{i + 1}</span>
            <span className="flex min-w-0 items-center gap-1 text-xs font-semibold tracking-tight">
              {r.routeLabel.split(" → ")[0]}
              <MoveRight className="h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={2.5} />
              {r.routeLabel.split(" → ")[1]}
            </span>
            <StatusBadge level={r.confidencePct >= 80 ? "low" : r.confidencePct >= 65 ? "moderate" : "elevated"} size="sm"
              labelOverride={r.confidencePct >= 80 ? "HIGH CONF" : r.confidencePct >= 65 ? "MED CONF" : "LOW CONF"}
            />
            <span className="ml-auto"><TrendPill value={r.expectedChangePct} size="xs" /></span>
          </button>
        </li>
      ))}
    </ol>
  );
}
