"use client";

import dynamic from "next/dynamic";

/**
 * Client-only loader for PlayerStatsShowcase — it drives canvas animations
 * (getContext("2d")), so it is skipped during SSR per NCC performance rules.
 */
export const PlayerStatsShowcaseLazy = dynamic(
  () => import("./PlayerStatsShowcase").then((m) => m.PlayerStatsShowcase),
  { ssr: false }
);
