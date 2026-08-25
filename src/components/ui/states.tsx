"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

export function LoadingState({ variant = "chart", rows = 4 }: { variant?: "chart" | "rows" | "cards"; rows?: number }) {
  if (variant === "cards") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: rows + 2 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border p-4">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }
  if (variant === "rows") {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }
  return <Skeleton className={cn("h-full min-h-[220px] w-full")} />;
}

export function ErrorState({ message, onRetry }: { message?: string | null; onRetry?: () => void }) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
      <AlertCircle className="h-5 w-5 text-danger" />
      <div>
        <p className="text-sm font-medium">Failed to load data</p>
        <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">{message ?? "The analytics service did not respond."}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
