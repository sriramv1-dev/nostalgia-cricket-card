"use client";

import nextDynamic from "next/dynamic";
import {
  useAccessoryCustomization,
} from "@/hooks/useAccessoryCustomization";
import { SHOT_SOURCES, type ShotType } from "@/constants/characters";

// Canvas-dependent — load client-side only per NCC performance rules
const CharacterCustomizerDiagram = nextDynamic(
  () =>
    import("@/components/card/CharacterCustomizerDiagram").then(
      (m) => m.CharacterCustomizerDiagram
    ),
  { ssr: false }
);

const CustomizableLayeredCharacter = nextDynamic(
  () =>
    import("@/components/card/CustomizableLayeredCharacter").then(
      (m) => m.CustomizableLayeredCharacter
    ),
  { ssr: false }
);

export interface CharacterCustomizationWrapperProps {
  shotType: ShotType;
  country: string;
  className?: string;
}

/**
 * Responsive wrapper for character colour customization.
 *
 * - Mobile (< md): tap-to-select via CustomizableLayeredCharacter.
 * - Tablet / desktop (≥ md): diagram mode via CharacterCustomizerDiagram.
 *
 * A single useAccessoryCustomization call owns all colour state so both
 * breakpoints share the same values (both branches are hidden/shown via CSS,
 * not conditionally mounted, so the hook only runs once per render).
 */
export function CharacterCustomizationWrapper({
  shotType,
  country,
  className = "",
}: CharacterCustomizationWrapperProps) {
  const customization = useAccessoryCustomization(shotType, country);
  const { colors, activeKey, setActiveKey } = customization;

  const sources = SHOT_SOURCES[shotType];

  return (
    <>
      {/* ── Tablet / desktop — diagram with connector lines ── */}
      <div className={`hidden md:flex w-full h-full items-start ${className}`}>
        <CharacterCustomizerDiagram
          shotType={shotType}
          customization={customization}
          className="w-full"
        />
      </div>

      {/* ── Mobile — tap-to-select character with active-layer glow ── */}
      <div className={`flex md:hidden w-full h-full items-center justify-center ${className}`}>
        <CustomizableLayeredCharacter
          sources={sources}
          colors={colors}
          activeKey={activeKey}
          onLayerClick={setActiveKey}
          className="w-full h-full"
        />
      </div>
    </>
  );
}
