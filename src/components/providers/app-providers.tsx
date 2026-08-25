"use client";

import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "./theme-provider";
import { FiltersProvider } from "./filters-provider";
import { LiveProvider } from "./live-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <FiltersProvider>
          <LiveProvider>{children}</LiveProvider>
        </FiltersProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
