"use client";

import { motion } from "framer-motion";
import type { FareComponent } from "@/types";
import { formatINR } from "@/lib/format";

/** Stacked composition bar + itemized legend for a fare observation. */
export function FareComposition({ components }: { components: FareComponent[] }) {
  const total = formatINR(components.reduce((a, c) => a + c.amount, 0));
  return (
    <div>
      <div className="flex h-3.5 w-full overflow-hidden rounded-md" role="img" aria-label="Fare composition breakdown">
        {components.map((c, i) => (
          <motion.span
            key={c.component}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            className="h-full origin-left"
            style={{ width: `${c.pct}%`, background: c.color }}
            title={`${c.component} ${formatINR(c.amount)}`}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {components.map((c) => (
          <li key={c.component} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: c.color }} aria-hidden />
              <span className="truncate">{c.component}</span>
            </span>
            <span className="shrink-0 font-semibold num">
              {formatINR(c.amount)}
              <span className="ml-1.5 inline-block w-11 text-right font-normal text-muted-foreground num">{c.pct.toFixed(1)}%</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-border pt-2.5 text-[10px] leading-relaxed text-muted-foreground">
        Taxes and fees are <span className="font-semibold text-foreground">32%+ of the ticket</span> — comparing base fares alone
        would misstate CPI-relevant consumer cost by nearly a third.
      </p>
      <p className="mt-1 text-right text-xs font-semibold num">Total {total}</p>
    </div>
  );
}
