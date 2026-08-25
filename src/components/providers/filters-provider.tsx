"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Filters } from "@/types";

interface FiltersContextValue extends Filters {
  setRange: (r: Filters["range"]) => void;
  setRegion: (r: string) => void;
  setRouteId: (r: string) => void;
  setAirline: (a: string) => void;
}

const DEFAULTS: Filters = { range: "90d", region: "all", routeId: "DEL-BOM", airline: "all" };

const FiltersContext = createContext<FiltersContextValue>({
  ...DEFAULTS,
  setRange: () => undefined,
  setRegion: () => undefined,
  setRouteId: () => undefined,
  setAirline: () => undefined,
});

export function useFilters() {
  return useContext(FiltersContext);
}

/** Global controls from the top navbar — consumed by data surfaces app-wide. */
export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<Filters>(DEFAULTS);

  const value = useMemo<FiltersContextValue>(
    () => ({
      ...filters,
      setRange: (range) => setFilters((f) => ({ ...f, range })),
      setRegion: (region) => setFilters((f) => ({ ...f, region })),
      setRouteId: (routeId) => setFilters((f) => ({ ...f, routeId })),
      setAirline: (airline) => setFilters((f) => ({ ...f, airline })),
    }),
    [filters]
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}
