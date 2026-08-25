"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { SourceCard } from "@/components/sources/source-card";
import { PipelineFlow } from "@/components/sources/pipeline-flow";
import { IngestionLog } from "@/components/sources/ingestion-log";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useApiData } from "@/hooks/use-api-data";
import { airisApi } from "@/lib/api";

export default function DataSourcesPage() {
  const pipeline = useApiData(() => airisApi.sources.getPipeline(), []);
  const airlineStats = useApiData(() => airisApi.sources.getCategoryStats("airline"), []);
  const otaStats = useApiData(() => airisApi.sources.getCategoryStats("ota"), []);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Automated collection · no manual reporting"
        title="Data Sources & Pipeline"
        subtitle="Eight connectors scrape airline and OTA portals around the clock. Raw captures flow through validation and normalization before the index engine ever sees them."
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Source health">
        {airlineStats.loading || !airlineStats.data ? (
          <LoadingState variant="chart" />
        ) : (
          <SourceCard stats={airlineStats.data} />
        )}
        {otaStats.loading || !otaStats.data ? (
          <LoadingState variant="chart" />
        ) : (
          <SourceCard stats={otaStats.data} />
        )}
      </section>

      <Card>
        <SectionHeader
          title="Processing pipeline" info="pipeline"
          subtitle="Every stage is independently monitored; green states indicate live throughput"
          className="p-4 pb-3"
        />
        <CardContent className="pt-0">
          {pipeline.loading && !pipeline.data ? (
            <LoadingState variant="rows" rows={4} />
          ) : pipeline.error ? (
            <ErrorState message={pipeline.error} onRetry={pipeline.refresh} />
          ) : pipeline.data ? (
            <PipelineFlow stages={pipeline.data} />
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHeader title="Live ingestion log" subtitle="Streamed from the capture layer via WebSocket" className="p-4 pb-2" />
          <CardContent className="pt-0">
            <IngestionLog />
            <p className="mt-2 text-[10px] text-muted-foreground">
              Records are timestamped at capture to preserve exact index reference periods — a requirement for CPI-grade statistics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <SectionHeader title="Coverage snapshot" subtitle="Rolling 24 hours" className="p-4 pb-0" />
          <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 pt-3">
            {[
              { label: "Fare observations", value: "246,891" },
              { label: "Routes covered", value: "2,846" },
              { label: "Carriers tracked", value: "6" },
              { label: "Capture cadence", value: "15 min" },
              { label: "Validation pass", value: "99.2%" },
              { label: "Duplicate rate", value: "0.31%" },
            ].map((s) => (
              <div key={s.label}>
                <p className="label-xs">{s.label}</p>
                <p className="mt-1 text-lg font-semibold leading-none num">{s.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
