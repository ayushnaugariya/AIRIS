"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";

interface TermProps {
  t: GlossaryKey;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Inline glossary term — dotted underline; hover/focus reveals a
 * plain-language definition. Use wherever analytical jargon appears.
 */
export function Term({ t, children, className }: TermProps) {
  const entry = GLOSSARY[t];
  if (!entry) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            "cursor-help underline decoration-muted-foreground/50 decoration-dotted underline-offset-[3px] transition-colors hover:decoration-primary hover:decoration-solid",
            className
          )}
        >
          {children ?? entry.label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px]">
        <p className="text-[11px] font-semibold">{entry.label}</p>
        <p className="mt-0.5 text-[11px] font-normal leading-relaxed text-muted-foreground">{entry.definition}</p>
      </TooltipContent>
    </Tooltip>
  );
}
