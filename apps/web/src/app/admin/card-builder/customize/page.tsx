"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCharacterSources, type PlayerRole, type ShotType } from "@/constants/characters";
import { useCountryTheme } from "@/hooks/useCountryTheme";
import { useAccessoryCustomization } from "@/hooks/useAccessoryCustomization";
import nextDynamic from "next/dynamic";

// Canvas-adjacent UI — load client-side only, per NCC performance rules
const ColorPopover = nextDynamic(
  () => import("@/components/card/ColorPopover").then((m) => m.ColorPopover),
  { ssr: false }
);

const CustomizerMobile = nextDynamic(
  () => import("@/components/card/CustomizerMobile").then((m) => m.CustomizerMobile),
  { ssr: false }
);

const CharacterCustomizerDiagram = nextDynamic(
  () =>
    import("@/components/card/CharacterCustomizerDiagram").then(
      (m) => m.CharacterCustomizerDiagram
    ),
  { ssr: false }
);
import { PageHeader } from "@/components/layout";
import { BatSwitch, CardButton } from "@/components/ui";
import type { CharacterColors } from "@/types/card";

const COLOR_TO_KEY: Record<string, keyof CharacterColors> = {
  FF0000: "cap",
  FF8800: "capAccent",
  FFFF00: "gloves",
  "00FF00": "pads",
  "0000FF": "shoes",
  FF00FF: "bat",
  "00FFFF": "ball",
  FFFFFF: "wickets",
};

const KEY_LABELS: Record<keyof CharacterColors, string> = {
  cap: "Cap",
  capAccent: "Cap Accent",
  gloves: "Gloves",
  pads: "Pads",
  shoes: "Shoes",
  bat: "Bat",
  ball: "Ball",
  wickets: "Wickets",
};

// Same Form/Tap options as card-builder/page.tsx — the customize page IS
// tap mode, so the switch shows "tap" selected and "Form" navigates back.
const MODE_OPTIONS = [
  {
    id: "form" as const,
    label: "Form",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "tap" as const,
    label: "Tap",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11V6a2 2 0 0 1 4 0v5" />
        <path d="M13 11V8a2 2 0 0 1 4 0v5" />
        <path d="M17 11V9.5a2 2 0 0 1 4 0V17a4 4 0 0 1-4 4h-3a4 4 0 0 1-3.16-1.53L5 12a2 2 0 0 1 2.72-2.93L9 11" />
      </svg>
    ),
  },
];

const ACTIVE_GLOW =
  "drop-shadow(0 0 14px #e8257a) drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 3px #e8257a)";

function deriveRole(shot: string): PlayerRole {
  if (shot === "pace" || shot === "spin") return "bowler";
  if (shot === "keeping1" || shot === "keeping2") return "keeper";
  return "batter";
}

function CustomizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const shot = searchParams.get("shot") ?? "alpha";
  const country = searchParams.get("country") ?? "India";

  const sources = getCharacterSources(deriveRole(shot), shot);
  const hitmapSrc = `${sources.base.slice(0, sources.base.lastIndexOf("/") + 1)}hitmap.png`;

  const diagramCustomization = useAccessoryCustomization(shot as ShotType, country);

  return (
    // Mirrors the root layout chrome: 112px top padding everywhere, plus a
    // 60px bottom inset on mobile (pb-[60px] md:pb-0) for the bottom bar.
    <main className="h-[calc(100vh-172px)] md:h-[calc(100vh-112px)] flex flex-col bg-zinc-950 text-white overflow-hidden">
      <PageHeader
        title="Customize"
        back={{ label: country }}
        subtitle={
          <span className="text-zinc-500 text-sm font-body tracking-wide">
            — changes apply to all {country} cards across the app
          </span>
        }
        right={
          <div className="hidden md:block h-12 w-full sm:w-40 overflow-visible">
            <BatSwitch
              options={MODE_OPTIONS}
              value="tap"
              onChange={(v) => {
                if (v === "form") {
                  router.push(
                    `/card-builder?country=${encodeURIComponent(country)}`
                  );
                }
              }}
            />
          </div>
        }
      />

      {/* ── Tablet+ diagram — hidden on mobile; no vertical scroll ── */}
      <div className="hidden md:flex flex-1 items-center justify-center overflow-y-hidden overflow-x-auto p-4">
        <CharacterCustomizerDiagram
          shotType={shot as ShotType}
          customization={diagramCustomization}
          className="h-full"
        />
      </div>
      {/* ── Mobile: customizer — hidden on tablet+ ── */}
      <div className="md:hidden flex-1 flex flex-col min-h-0">
        <CustomizerMobile
          shotType={shot as ShotType}
          country={country}
          customization={diagramCustomization}
          onDone={() => router.push(`/card-builder?country=${encodeURIComponent(country)}`)}
        />
      </div>
    </main>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={null}>
      <CustomizeContent />
    </Suspense>
  );
}
