"use client";

import { useMemo, useRef, useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { AIRPORTS } from "@/lib/mock/airports";
import { ROUTES } from "@/lib/mock/routes-data";
import { formatINR, formatIndex, formatPct } from "@/lib/format";
import type { RouteInsight } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PressureLevel } from "@/types";

/* --------------------------- India outline (GeoJSON) ----------------------- */

import indiaOutlineJson from "@/lib/geo/india-outline.json";

interface GeoJson {
  features: { geometry: { type: string; coordinates: number[][][] | number[][][][] } }[];
}

const RINGS: [number, number][][] = (() => {
  const geo = indiaOutlineJson as GeoJson;
  const geom = geo.features[0].geometry;
  const rings: [number, number][][] = [];
  if (geom.type === "Polygon") {
    (geom.coordinates as number[][][]).forEach((ring) => rings.push(ring as [number, number][]));
  } else {
    (geom.coordinates as number[][][][]).forEach((poly) => poly.forEach((ring) => rings.push(ring as [number, number][])));
  }
  return rings;
})();

const ANDAMAN: [number, number][][] = [
  [[92.6, 12.2], [92.9, 12.9], [92.8, 13.6], [92.5, 12.8]],
  [[93.6, 10.9], [93.9, 11.6], [93.7, 12.2], [93.4, 11.4]],
  [[92.4, 8.6], [92.6, 9.2], [92.5, 9.6], [92.3, 9.0]],
];

const DEFAULT_VIEWBOX = { x: 66.5, y: 2.5, w: 32.5, h: 32 };

const ARC_COLORS: Record<PressureLevel, string> = {
  low: "#38BDF8",
  moderate: "#38BDF8",
  elevated: "#F59E0B",
  high: "#EF4444",
};

interface ArcGeom {
  route: RouteInsight;
  d: string;
  mid: [number, number];
}

interface IndiaMapProps {
  focusRouteId?: string | null;
  onSelectRoute?: (id: string) => void;
  className?: string;
}

/**
 * Self-contained SVG India route map — country outline, airports, pressure
 * arcs with animated flow, live tooltips, zoom controls. No tiles, no keys,
 * no canvas sizing quirks.
 */
export function IndiaMap({ focusRouteId, onSelectRoute, className }: IndiaMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState(DEFAULT_VIEWBOX);
  const [minLevel, setMinLevel] = useState<"all" | "elevated" | "high">("all");
  const [hover, setHover] = useState<{ x: number; y: number; route: RouteInsight } | null>(null);

  const airportByCode = useMemo(() => new Map(AIRPORTS.map((a) => [a.code, a])), []);

  const LEVEL_ORDER: Record<PressureLevel, number> = { low: 0, moderate: 1, elevated: 2, high: 3 };
  const arcs = useMemo<ArcGeom[]>(() => {
    const floor = minLevel === "all" ? -1 : LEVEL_ORDER[minLevel];
    return ROUTES.filter((r) => LEVEL_ORDER[r.pressureLevel] > floor).map((route) => {
      const o = airportByCode.get(route.originCode);
      const d = airportByCode.get(route.destinationCode);
      if (!o || !d) return null;
      const x1 = o.lon;
      const y1 = 38 - o.lat; // flip lat → svg y
      const x2 = d.lon;
      const y2 = 38 - d.lat;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.18;
      return {
        route,
        d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`,
        mid: [mx, (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.09] as [number, number],
      };
    }).filter((a): a is ArcGeom => a !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minLevel, airportByCode]);

  const isFocus = (id: string) => Boolean(focusRouteId) && id === focusRouteId;

  const zoom = (factor: number) => {
    setViewBox((v) => {
      const w = Math.min(40, Math.max(9, v.w * factor));
      const h = w * (DEFAULT_VIEWBOX.h / DEFAULT_VIEWBOX.w);
      const cx = v.x + v.w / 2;
      const cy = v.y + v.h / 2;
      return { x: cx - w / 2, y: cy - h / 2, w, h };
    });
  };

  const handleMove = (e: React.PointerEvent, route: RouteInsight) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ x: e.clientX - rect.left, y: e.clientY - rect.top, route });
  };

  return (
    <div className={`relative overflow-hidden rounded-lg border border-border bg-[#0A1526] ${className ?? ""}`}>
      <div ref={wrapRef} className="relative h-[320px] w-full sm:h-[420px] lg:h-[500px] xl:h-[560px]">
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="India route pressure map"
        >
          <defs>
            <radialGradient id="indiaFill" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#14264A" />
              <stop offset="100%" stopColor="#0E1B33" />
            </radialGradient>
          </defs>

          {/* graticule */}
          {Array.from({ length: 7 }, (_, i) => 70 + i * 4).map((lon) => (
            <line key={lon} x1={lon} y1={viewBox.y} x2={lon} y2={viewBox.y + viewBox.h} stroke="#1E2C4A" strokeWidth="0.04" />
          ))}
          {Array.from({ length: 8 }, (_, i) => 8 + i * 4).map((lat) => (
            <line key={lat} x1={viewBox.x} y1={38 - lat} x2={viewBox.x + viewBox.w} y2={38 - lat} stroke="#1E2C4A" strokeWidth="0.04" />
          ))}

          {/* India landmass — accurate Natural Earth outline */}
          {RINGS.map((ring, i) => (
            <polygon
              key={i}
              points={ring.map(([lon, lat]) => `${lon},${38 - lat}`).join(" ")}
              fill={i === 0 ? "url(#indiaFill)" : "none"}
              stroke="#3B82F6"
              strokeOpacity="0.85"
              strokeWidth="0.14"
              strokeLinejoin="round"
            />
          ))}
          {ANDAMAN.map((poly, i) => (
            <polygon
              key={i}
              points={poly.map(([lon, lat]) => `${lon},${38 - lat}`).join(" ")}
              fill="url(#indiaFill)"
              stroke="#3B82F6"
              strokeOpacity="0.6"
              strokeWidth="0.1"
            />
          ))}

          {/* pressure arcs */}
          {arcs.map(({ route, d }) => {
            const focused = isFocus(route.id);
            const dimmed = Boolean(focusRouteId) && !focused;
            return (
              <g key={route.id}>
                <path d={d} fill="none" stroke="transparent" strokeWidth="1.1" style={{ pointerEvents: "stroke", cursor: "pointer" }}
                  onPointerMove={(e) => handleMove(e, route)}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => onSelectRoute?.(route.id)}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={focused ? "#F8FAFC" : ARC_COLORS[route.pressureLevel]}
                  strokeWidth={focused ? 0.34 : 0.1 + (route.pressureScore / 100) * 0.16}
                  strokeOpacity={dimmed ? 0.16 : focused ? 1 : 0.8}
                  strokeLinecap="round"
                  pointerEvents="none"
                  className={focused ? "arc-flow" : undefined}
                />
              </g>
            );
          })}

          {/* live plane on focused route */}
          {focusRouteId &&
            arcs
              .filter((a) => a.route.id === focusRouteId)
              .slice(0, 1)
              .map(({ d, route }) => (
                <g key={`plane-${route.id}`} pointerEvents="none">
                  {[0, 2.6].map((begin) => (
                    <circle key={begin} r="0.26" fill="#7DD3FC" stroke="#0A1526" strokeWidth="0.06">
                      <animateMotion dur="5.2s" begin={`${begin}s`} repeatCount="indefinite" path={d} />
                    </circle>
                  ))}
                </g>
              ))}

          {/* airports */}
          {AIRPORTS.map((a) => {
            const x = a.lon;
            const y = 38 - a.lat;
            return (
              <g key={a.code} pointerEvents="none">
                <circle
                  cx={x}
                  cy={y}
                  r={a.tier === 1 ? 0.24 : a.tier === 2 ? 0.19 : 0.15}
                  fill={a.tier === 1 ? "#38BDF8" : "#94A3B8"}
                  stroke="#0A1526"
                  strokeWidth="0.07"
                />
                <text
                  x={x}
                  y={y - 0.55}
                  textAnchor="middle"
                  fontSize={a.tier === 1 ? 0.62 : 0.52}
                  fontWeight={700}
                  fill={a.tier === 1 ? "#E2E8F0" : "#8FA3BF"}
                  style={{ fontFamily: "Inter, system-ui, sans-serif", letterSpacing: "0.02em" }}
                >
                  {a.code}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend + filter */}
      <div className="absolute left-3 top-3 z-10 rounded-md border border-border bg-card/90 p-2.5 backdrop-blur-sm">
        <p className="label-xs mb-1.5">Price pressure</p>
        <ul className="space-y-1 text-[10px] text-muted-foreground">
          <LegendRow color="#38BDF8" label="Normal / moderate" />
          <LegendRow color="#F59E0B" label="Elevated" />
          <LegendRow color="#EF4444" label="High" />
        </ul>
        <div className="mt-2 border-t border-border pt-2">
          <Select value={minLevel} onValueChange={(v) => setMinLevel(v as typeof minLevel)}>
            <SelectTrigger className="h-6 w-[130px] px-1.5 text-[10px]" aria-label="Filter routes by pressure">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All pressures</SelectItem>
              <SelectItem value="elevated">Elevated &amp; above</SelectItem>
              <SelectItem value="high">High only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
        <Button variant="secondary" size="iconSm" onClick={() => zoom(0.8)} aria-label="Zoom in" className="bg-card/90 backdrop-blur-sm">
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button variant="secondary" size="iconSm" onClick={() => zoom(1.25)} aria-label="Zoom out" className="bg-card/90 backdrop-blur-sm">
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button variant="secondary" size="iconSm" onClick={() => setViewBox(DEFAULT_VIEWBOX)} aria-label="Reset view" className="bg-card/90 backdrop-blur-sm">
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <span className="absolute bottom-3 left-3 z-10 hidden rounded border border-border bg-card/85 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-sm sm:block">
        Hover an arc for live fares · click to {onSelectRoute ? "analyze" : "trace flights"}
      </span>

      {/* Hover tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute z-20 min-w-[200px] rounded-lg border border-border bg-popover/95 p-3 shadow-raised backdrop-blur-sm"
          style={{
            left: Math.min(hover.x + 14, (wrapRef.current?.clientWidth ?? 400) - 220),
            top: Math.max(hover.y - 10, 8),
          }}
        >
          <p className="text-[13px] font-bold tracking-tight num">
            {hover.route.originCode} → {hover.route.destinationCode}
          </p>
          <p className="mb-2 text-[10px] text-muted-foreground">
            {hover.route.originCity} → {hover.route.destinationCity}
          </p>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <TipRow label="Current fare" value={formatINR(hover.route.currentFare)} strong />
              {hover.route.flights[0] && (
                <TipRow label="Cheapest flight" value={`${hover.route.flights[0].flightNo} · ${formatINR(hover.route.flights[0].bestFare)}`} />
              )}
              <TipRow label="Index" value={formatIndex(hover.route.indexValue)} />
              <TipRow label="7D change" value={formatPct(hover.route.change7dPct)} />
              <TipRow label="Pressure" value={hover.route.pressureLevel.toUpperCase()} />
              <TipRow label="Flights today" value={String(hover.route.flights.length)} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TipRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <tr>
      <td className="py-px pr-3 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{label}</td>
      <td className={`py-px text-right ${strong ? "text-[13px] font-bold" : "text-[11px] font-semibold"} num`}>{value}</td>
    </tr>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className="inline-block h-0.5 w-4 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </li>
  );
}

