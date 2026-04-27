"use client";

import React from "react";
import StatCard, { PlayerStats } from "@/components/card/StatCard";
import { CardWrapper } from "@/components/card/CardWrapper";

const KALLIS_DATA: PlayerStats = {
  info: {
    number: "042",
    rarity: "LEGEND",
    name: "Jacques Kallis",
    country: "🇿🇦 South Africa",
    role: "Allrounder",
    image: "/images/players/kallis.jpg",
  },
  matches: { test: 166, odi: 328, t20i: 25 },
  batting: {
    runs: { test: 13289, odi: 11579, t20i: 666 },
    notOuts: { test: 40, odi: 53, t20i: 4 },
    highScore: { test: 224, odi: 139, t20i: 73 },
    avg: { test: 55.4, odi: 44.4, t20i: 35.0 },
    halfCenturies: { test: 58, odi: 86, t20i: 5 },
    centuries: { test: 45, odi: 17, t20i: 0 },
    fours: { test: 1488, odi: 911, t20i: 56 },
    sixes: { test: 97, odi: 137, t20i: 20 },
  },
  bowling: {
    wickets: { test: 292, odi: 273, t20i: 12 },
    bestBowl: { test: "6/54", odi: "5/30", t20i: "4/15" },
    avg: { test: 32.6, odi: 31.8, t20i: 27.8 },
    economy: { test: 2.83, odi: 4.84, t20i: 7.24 },
    fourWkts: { test: 7, odi: 2, t20i: 1 },
    fiveWkts: { test: 5, odi: 2, t20i: 0 },
  },
  fielding: {
    catches: { test: 200, odi: 131, t20i: 7 },
    runOuts: { test: 5, odi: 15, t20i: 2 },
    stumpings: { test: 0, odi: 0, t20i: 0 },
  },
};

export default function StatSidePage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center mb-4">
        <h1 className="text-white text-3xl font-bold tracking-tight mb-2 font-mono">
          Stat Side Preview
        </h1>
        <p className="text-zinc-500 text-sm tracking-[0.3em] font-mono">
          HTML v7 → React Conversion
        </p>
      </div>

      <CardWrapper scale={0.45}>
        <StatCard stats={KALLIS_DATA} />
      </CardWrapper>

      <footer className="mt-12 text-zinc-600 font-mono text-[10px] space-y-1 text-center opacity-50">
        <p>750 x 1050 px (Scaled to 0.45)</p>
        <p>Dynamic Data Mapping Enabled</p>
      </footer>
    </main>
  );
}
