"use client";

import { useEffect, useRef } from "react";
import type { Data, Layout } from "plotly.js";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/providers/theme-provider";

interface PlotlyChartProps {
  data: Data[];
  layout?: Partial<Layout>;
  height?: number;
}

/**
 * Thin SSR-safe Plotly wrapper. plotly.js-dist-min is imported dynamically
 * so it never touches the server bundle.
 */
export function PlotlyChart({ data, layout, height = 260 }: PlotlyChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme().theme;

  useEffect(() => {
    let disposed = false;
    (async () => {
      const mod = (await import("plotly.js-dist-min")) as unknown as {
        default: typeof import("plotly.js");
      };
      const Plotly = mod.default ?? mod;
      if (disposed || !ref.current) return;

      const merged: Partial<Layout> = {
        margin: { t: 8, r: 12, b: 32, l: 44 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { family: "Inter, system-ui, sans-serif", size: 10, color: theme === "light" ? "#5B6B82" : "#8FA3BF" },
        xaxis: { gridcolor: theme === "light" ? "rgba(100,116,139,.16)" : "rgba(148,163,184,.14)", ...layout?.xaxis },
        yaxis: { gridcolor: theme === "light" ? "rgba(100,116,139,.16)" : "rgba(148,163,184,.14)", ...layout?.yaxis },
        hoverlabel: {
          bgcolor: "#111827",
          bordercolor: "rgba(148,163,184,.3)",
          font: { family: "Inter, system-ui, sans-serif", size: 11, color: "#F8FAFC" },
        },
        ...layout,
      };

      void Plotly.react(ref.current, data, merged, {
        responsive: true,
        displayModeBar: false,
      });
    })();

    return () => {
      disposed = true;
    };
  }, [data, layout, theme]);

  useEffect(() => {
    const node = ref.current;
    return () => {
      if (node) {
        import("plotly.js-dist-min")
          .then((mod) => {
            const Plotly = ((mod as unknown as { default: typeof import("plotly.js") }).default ?? mod) as typeof import("plotly.js");
            void Plotly.purge(node);
          })
          .catch(() => undefined);
      }
    };
  }, []);

  return (
    <div style={{ minHeight: height }}>
      <div ref={ref} style={{ width: "100%", height }} />
    </div>
  );
}

export function PlotlyFallback({ height = 260 }: { height?: number }) {
  return <Skeleton className="w-full rounded-md" style={{ height } as React.CSSProperties} />;
}
