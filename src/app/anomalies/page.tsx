"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { AnomalyStatsRow } from "@/components/anomalies/anomaly-stats-row";
import { AnomalyTable } from "@/components/anomalies/anomaly-table";
import { AnomalyDetail } from "@/components/anomalies/anomaly-detail";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useApiData } from "@/hooks/use-api-data";
import { airisApi } from "@/lib/api";
import type { Anomaly } from "@/types";

function AnomaliesInner() {
  const params = useSearchParams();
  const anomalies = useApiData(() => airisApi.anomalies.list(), []);
  const stats = useApiData(() => airisApi.anomalies.getStats(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localAnomalies, setLocalAnomalies] = useState<Anomaly[] | null>(null);

  useEffect(() => {
    if (anomalies.data && !localAnomalies) setLocalAnomalies(anomalies.data);
  }, [anomalies.data, localAnomalies]);

  useEffect(() => {
    const focus = params.get("focus");
    if (focus) setSelectedId(focus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const list = localAnomalies ?? anomalies.data ?? [];
  const selected = list.find((a) => a.id === selectedId) ?? null;

  const handleAcknowledge = async (id: string) => {
    setLocalAnomalies((prev) =>
      (prev ?? []).map((a) =>
        a.id === id ? { ...a, status: a.status === "open" ? "acknowledged" : "resolved" } : a
      )
    );
    await airisApi.anomalies.updateStatus(id, "acknowledged");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Explainable monitoring · updated every capture cycle"
        title="Anomaly Detection Center"
        subtitle="Every fare movement is scored against an expected band built from seasonality, capacity and booking behaviour. Deviations are explained, not just reported."
      />

      {stats.loading && !stats.data ? (
        <LoadingState variant="cards" />
      ) : stats.error ? (
        <ErrorState message={stats.error} onRetry={stats.refresh} />
      ) : stats.data ? (
        <AnomalyStatsRow stats={stats.data} />
      ) : null}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_400px]">
        <Card>
          <SectionHeader
            title="Detection log"
            subtitle="Select a row for model attribution · keyboard accessible (↑↓ not required, Enter to select)"
            className="p-4 pb-2"
          />
          <CardContent className="pt-0">
            {anomalies.loading && !anomalies.data ? (
              <LoadingState variant="rows" rows={7} />
            ) : anomalies.error ? (
              <ErrorState message={anomalies.error} onRetry={anomalies.refresh} />
            ) : (
              <AnomalyTable anomalies={list} selectedId={selectedId} onSelect={setSelectedId} />
            )}
          </CardContent>
        </Card>

        <Card className="xl:sticky xl:top-[72px]">
          <SectionHeader title="Explanation panel" subtitle="Why this was flagged" className="p-4 pb-3" />
          <CardContent className="pt-0">
            <div className="min-h-[520px]">
              <AnomalyDetail anomaly={selected} onAcknowledge={handleAcknowledge} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnomaliesPage() {
  return (
    <Suspense fallback={<LoadingState variant="chart" />}>
      <AnomaliesInner />
    </Suspense>
  );
}
