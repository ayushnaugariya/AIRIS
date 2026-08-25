"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Deck, MapView } from "@deck.gl/core";
import { ArcLayer, BitmapLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import type { MapViewState, PickingInfo } from "@deck.gl/core";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { AIRPORTS } from "@/lib/mock/airports";
import { ROUTES } from "@/lib/mock/routes-data";
import { PRESSURE_ARC_COLORS } from "@/lib/colors";
import { formatINR, formatIndex, formatPct } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PressureLevel, RouteInsight } from "@/types";

const INDIA_VIEW: MapViewState = { longitude: 80.2, latitude: 22.8, zoom: 3.55, pitch: 18, bearing: 0, maxZoom: 8, minZoom: 2.4 };
const BASEMAP = "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png";

interface ArcDatum {
  route: RouteInsight;
  o: [number, number];
  d: [number, number];
}

const LEVEL_ORDER: Record<PressureLevel, number> = { low: 0, moderate: 1, elevated: 2, high: 3 };

interface RouteMapProps {
  /** Route selected in the global topbar filter — highlighted & centered. */
  focusRouteId?: string | null;
}

export default function RouteMap({ focusRouteId }: RouteMapProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<Deck<MapView[]> | null>(null);
  const [ready, setReady] = useState(false);
  const [viewState, setViewState] = useState({...INDIA_VIEW});
  const [minLevel, setMinLevel] = useState<"all" | "elevated" | "high">("all");

  const arcs = useMemo<ArcDatum[]>(() => {
    const airportByCode = new Map(AIRPORTS.map((a) => [a.code, a]));
    return ROUTES.map((route) => {
      const o = airportByCode.get(route.originCode);
      const d = airportByCode.get(route.destinationCode);
      if (!o || !d) return null;
      return { route, o: [o.lon, o.lat] as [number, number], d: [d.lon, d.lat] as [number, number] };
    }).filter((x): x is ArcDatum => x !== null);
  }, []);

  const filteredArcs = useMemo(() => {
    const floor = minLevel === "all" ? -1 : LEVEL_ORDER[minLevel];
    return arcs.filter((a) => LEVEL_ORDER[a.route.pressureLevel] > floor);
  }, [arcs, minLevel]);

  const isFocus = (d: ArcDatum) => Boolean(focusRouteId) && d.route.id === focusRouteId;
  const arcColor = (d: ArcDatum): [number, number, number, number] => {
    const base = PRESSURE_ARC_COLORS[d.route.pressureLevel];
    if (isFocus(d)) return [248, 250, 252, 255];
    if (focusRouteId) return [base[0], base[1], base[2], Math.round(base[3] * 0.3)];
    return base;
  };

  // Initialize deck once
  useEffect(() => {
    if (!containerRef.current || deckRef.current) return;
    const deck = new Deck({
      parent: containerRef.current,
      views: [new MapView({ id: "main", repeat: false, controller: true })],
      initialViewState: { main: {...INDIA_VIEW } },
      getTooltip,
      layers: [],
    });
    deckRef.current = deck;
    setReady(true);

    // Guarantee the canvas always matches its container, even if CSS settles late.
    const resize = () => (deck as unknown as { resize: () => void }).resize();
    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current);
    const t = setTimeout(resize, 60);
    window.addEventListener("resize", resize);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      deck.finalize();
      deckRef.current = null;
    };
  }, []);

  // Sync layers
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const basemap = new TileLayer({
      id: "carto-basemap",
      data: BASEMAP,
      pickable: false,
      tileSize: 256,
      minZoom: 1,
      maxZoom: 19,
      opacity: 0.9,
      renderSubLayers: (props) => {
        const bbox: number[][] = props.tile.boundingBox as unknown as number[][];
        const [[west, south], [east, north]] = bbox;
        return [
          new BitmapLayer(props, {
            data: undefined,
            image: props.data as unknown as string,
            bounds: [west, south, east, north],
          }),
        ];
      },
    });

    const arcLayer = new ArcLayer<ArcDatum>({
      id: "pressure-arcs",
      data: filteredArcs,
      pickable: true,
      autoHighlight: true,
      highlightColor: [56, 189, 248, 90],
      getSourcePosition: (d) => d.o,
      getTargetPosition: (d) => d.d,
      getSourceColor: (d) => arcColor(d),
      getTargetColor: (d) => arcColor(d),
      getWidth: (d) => (isFocus(d) ? 5.4 : 0.6 + (d.route.pressureScore / 100) * 3.2),
      getHeight: (d) => 0.45 + (d.route.pressureScore / 100) * 0.5,
      greatCircle: true,
      widthUnits: "pixels",
      onClick: (info: PickingInfo<ArcDatum>) => {
        if (info.object) {
          router.push(`/routes?id=${info.object.route.id}`);
          return true;
        }
        return false;
      },
    });

    const airportLayer = new ScatterplotLayer({
      id: "airports",
      data: AIRPORTS,
      pickable: true,
      radiusUnits: "pixels",
      getPosition: (a) => [a.lon, a.lat],
      getRadius: (a) => (a.tier === 1 ? 5 : a.tier === 2 ? 4 : 3),
      getFillColor: (a) => (a.tier === 1 ? [56, 189, 248, 235] : [148, 163, 184, 200]),
      getLineColor: [11, 18, 32, 255],
      stroked: true,
      lineWidthUnits: "pixels",
      getLineWidth: 1.5,
      radiusMinPixels: 2.5,
      radiusMaxPixels: 6,
    });

    const labelLayer = new TextLayer({
      id: "airport-labels",
      data: AIRPORTS,
      getPosition: (a) => [a.lon, a.lat],
      getText: (a) => a.code,
      getSize: (a) => (a.tier === 1 ? 11 : 9),
      getColor: [203, 213, 225, 230],
      getPixelOffset: [0, -10],
      fontWeight: 600,
      fontFamily: "Inter, system-ui, sans-serif",
      fontSettings: { sdf: true },
      outlineWidth: 2,
      outlineColor: [11, 18, 32, 220],
      pickable: false,
      characterSet: "AUTO",
    });

    deck.setProps({
      onViewStateChange: (params: { viewState: unknown }) => setViewState(params.viewState as MapViewState),
      layers: [basemap, arcLayer, airportLayer, labelLayer],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredArcs, ready, router, focusRouteId]);

  // Center + emphasize the globally selected route.
  useEffect(() => {
    if (!focusRouteId) return;
    const arc = arcs.find((a) => a.route.id === focusRouteId);
    const deck = deckRef.current;
    if (!arc || !deck) return;
    const next: MapViewState = {
      ...INDIA_VIEW,
      longitude: (arc.o[0] + arc.d[0]) / 2,
      latitude: (arc.o[1] + arc.d[1]) / 2,
      zoom: 4.5,
    };
    setViewState(next);
    deck.setProps({ initialViewState: { main: next } });
  }, [focusRouteId, arcs]);

  const zoomBy = (delta: number) => {
    const next = { ...viewState, zoom: Math.min(8, Math.max(2.4, viewState.zoom + delta)) };
    setViewState(next);
    deckRef.current?.setProps({ initialViewState: { main: next } });
  };

  const resetView = () => {
    setViewState({...INDIA_VIEW});
    deckRef.current?.setProps({ initialViewState: { main: {...INDIA_VIEW} } });
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-navy-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: "radial-gradient(120% 90% at 50% 0%, rgba(29,78,216,0.12), transparent 55%)" }}
      />
      <div className="relative h-[300px] w-full sm:h-[420px] lg:h-[500px] xl:h-[560px]" role="application" aria-label="India route pressure map">
        <div ref={containerRef} className="absolute inset-0" />
      </div>

      {/* Legend */}
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

      {/* Controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
        <Button variant="secondary" size="iconSm" onClick={() => zoomBy(0.5)} aria-label="Zoom in" className="bg-card/90 backdrop-blur-sm">
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button variant="secondary" size="iconSm" onClick={() => zoomBy(-0.5)} aria-label="Zoom out" className="bg-card/90 backdrop-blur-sm">
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button variant="secondary" size="iconSm" onClick={resetView} aria-label="Reset to India view" className="bg-card/90 backdrop-blur-sm">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="absolute bottom-1.5 right-2 z-10 text-[9px] leading-none text-slate-500">
        &copy; OpenStreetMap contributors &copy; CARTO
      </p>

      <span className="absolute bottom-3 left-3 z-10 hidden rounded border border-border bg-card/85 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-sm sm:block">
        Hover a route for live fare signal &middot; click to open Route Intelligence
      </span>
    </div>
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

/* ------------------------------ Tooltip content ---------------------------- */

function row(label: string, value: string, strong?: boolean): string {
  return `<tr><td style="padding:1px 12px 1px 0;color:#94A3B8;font-size:10px;text-transform:uppercase;letter-spacing:.06em">${label}</td><td style="padding:1px 0;text-align:right;color:${strong ? "#F8FAFC" : "#E2E8F0"};font-size:${strong ? "13px" : "11px"};font-weight:${strong ? 700 : 600}">${value}</td></tr>`;
}

function getTooltip(info: PickingInfo): { html: string; style: Partial<CSSStyleDeclaration> } | null {
  const obj = info.object as ArcDatum | (typeof AIRPORTS)[number] | null;
  if (!obj) return null;

  if ("route" in obj) {
    const r = obj.route;
    const cheapest = [...r.flights].sort((a, b) => a.bestFare - b.bestFare)[0];
    return {
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;min-width:190px">
          <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#F8FAFC;letter-spacing:.02em">${r.originCode} → ${r.destinationCode}</p>
          <p style="margin:0 0 8px;font-size:10px;color:#94A3B8">${r.originCity} → ${r.destinationCity}</p>
          <table style="border-collapse:collapse;width:100%">
            ${row("Current fare", formatINR(r.currentFare), true)}
            ${cheapest ? row("Cheapest flight", `${cheapest.flightNo} · ${formatINR(cheapest.bestFare)}`) : ""}
            ${row("Index", formatIndex(r.indexValue))}
            ${row("7D change", formatPct(r.change7dPct))}
            ${row("Pressure", r.pressureLevel.toUpperCase())}
            ${row("Forecast", r.forecastSignal.toUpperCase())}
          </table>
          <p style="margin:8px 0 0;padding-top:6px;border-top:1px solid rgba(148,163,184,.2);font-size:9px;color:#64748B;text-transform:uppercase;letter-spacing:.08em">Click to open route intelligence</p>
        </div>`,
      style: {
        backgroundColor: "rgba(17,24,39,0.96)",
        border: "1px solid rgba(148,163,184,0.22)",
        borderRadius: "8px",
        padding: "10px 12px",
        boxShadow: "0 12px 32px -12px rgba(3,10,24,.65)",
        fontSize: "12px",
      },
    };
  }

  if ("code" in obj && "city" in obj) {
    return {
      html: `<div style="font-family:Inter,system-ui,sans-serif">
        <p style="margin:0;font-size:12px;font-weight:700;color:#F8FAFC">${obj.code} · ${obj.city}</p>
        <p style="margin:2px 0 0;font-size:10px;color:#94A3B8">${obj.name}</p>
      </div>`,
      style: {
        backgroundColor: "rgba(17,24,39,0.96)",
        border: "1px solid rgba(148,163,184,0.22)",
        borderRadius: "8px",
        padding: "8px 10px",
      },
    };
  }
  return null;
}
