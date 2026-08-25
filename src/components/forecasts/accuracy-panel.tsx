"use client";

import { Metric } from "@/components/ui/metric";

/** Backtest transparency — how the forecasting model has performed recently. */
export function AccuracyPanel() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Metric label="4-week hit rate" info="backtest" value="87%" hint="Movement direction called correctly" valueClassName="text-success" />
        <Metric label="MAPE" value="2.1%" hint="Mean absolute % error, national index" />
        <Metric label="Bias" value="+0.3 pp" hint="Slightly conservative on rallies" />
        <Metric label="Last backtest" value="Yesterday 02:00" hint="Rolling 26-week window" />
      </div>
      <p className="mt-3 rounded-md border border-border bg-background/50 p-2.5 text-[10px] leading-relaxed text-muted-foreground">
        Forecasts are re-scored daily against realized fares. Scenarios below let you stress the outlook — the published
        CPI briefing always uses the Base path.
      </p>
    </div>
  );
}
