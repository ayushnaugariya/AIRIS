"use client";

import { Term } from "@/components/ui/term";
import type { GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  /** Glossary key — title gets a hover definition. */
  info?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

/** Card-level header with title, optional subtitle and right-side actions. */
export function SectionHeader({ title, info, subtitle, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight">
          {info ? <Term t={info as GlossaryKey}>{title}</Term> : title}
        </h3>
        {subtitle ? <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
