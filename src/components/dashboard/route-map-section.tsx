"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const RouteMapInner = dynamic(() => import("./route-map"), {
  ssr: false,
  loading: () => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="h-[300px] w-full rounded-none sm:h-[420px] lg:h-[500px] xl:h-[560px]" />
      </CardContent>
    </Card>
  ),
});

interface RouteMapSectionProps {
  /** Route selected in the global filter — highlighted & centered on the map. */
  focusRouteId?: string | null;
}

/** SSR-safe wrapper — deck.gl initializes only in the browser. */
export function RouteMapSection({ focusRouteId }: RouteMapSectionProps) {
  return <RouteMapInner focusRouteId={focusRouteId} />;
}
