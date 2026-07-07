"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  deriveRole,
  getCharacterSources,
  MODE_OPTIONS,
  SHOT_SOURCES,
  type ShotType,
} from "@/constants/characters";
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

function isShotType(x: unknown): x is ShotType {
  return typeof x === "string" && Object.keys(SHOT_SOURCES).includes(x);
}

function CustomizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const shotParam = searchParams.get("shot");
  const shot = isShotType(shotParam) ? shotParam : "alpha";
  const country = searchParams.get("country") ?? "India";

  const sources = getCharacterSources(deriveRole(shot), shot);
  const hitmapSrc = `${sources.base.slice(0, sources.base.lastIndexOf("/") + 1)}hitmap.png`;

  const diagramCustomization = useAccessoryCustomization(shot, country);

  return (
    // Mirrors the root layout chrome: 112px top padding everywhere, plus a
    // nav-height bottom inset on mobile for the bottom bar.
    <main className="h-[calc(100vh-112px-theme(spacing.nav))] md:h-[calc(100vh-112px)] flex flex-col bg-zinc-950 text-white overflow-hidden">
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
          shotType={shot}
          customization={diagramCustomization}
          className="h-full"
        />
      </div>
      {/* ── Mobile: customizer — hidden on tablet+ ── */}
      <div className="md:hidden flex-1 flex flex-col min-h-0">
        <CustomizerMobile
          shotType={shot}
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
