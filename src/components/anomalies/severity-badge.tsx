import { StatusBadge } from "@/components/ui/status-badge";
import type { Severity } from "@/types";

export function SeverityBadge({ severity, size = "md" }: { severity: Severity; size?: "sm" | "md" }) {
  return <StatusBadge level={severity} kind="severity" size={size} />;
}
