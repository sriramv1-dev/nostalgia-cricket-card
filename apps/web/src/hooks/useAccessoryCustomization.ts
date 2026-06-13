"use client";

import { useState, useCallback } from "react";
import { useCountryTheme } from "@/hooks/useCountryTheme";
import { getCountryStyles } from "@/constants/countries";
import type { CharacterColors } from "@/types/card";
import { SHOT_SOURCES, type ShotType } from "@/constants/characters";

export const ACCESSORY_SWATCHES: Record<keyof CharacterColors, string[]> = {
  cap: [
    "#0038A8", "#CE1126", "#1a1a1a", "#ffffff",
    "#006400", "#FFCD00", "#e8257a", "#6b21a8",
  ],
  capAccent: [
    "#FF9933", "#FFCD00", "#ffffff", "#e8257a",
    "#0038A8", "#CE1126", "#00cc66", "#ff6600",
  ],
  gloves: [
    "#0038A8", "#ffffff", "#CE1126", "#FFCD00",
    "#1a1a1a", "#e8257a", "#006400", "#FF9933",
  ],
  pads: [
    "#ffffff", "#0038A8", "#CE1126", "#FFCD00",
    "#1a1a1a", "#e8257a", "#006400", "#FF9933",
  ],
  shoes: [
    "#1a1a1a", "#ffffff", "#0038A8", "#CE1126",
    "#FFCD00", "#e8257a", "#006400", "#5c3317",
  ],
  bat: [
    "#8b4513", "#5c3317", "#daa520", "#c8956a",
    "#1a1a1a", "#006400", "#CE1126", "#0038A8",
  ],
  ball: [
    "#CE1126", "#8b0000", "#ff4444", "#1a1a1a",
    "#006400", "#FFCD00", "#e8257a", "#0038A8",
  ],
  wickets: [
    "#c8956a", "#daa520", "#8b4513", "#f5f0e0",
    "#1a1a1a", "#CE1126", "#0038A8", "#ffffff",
  ],
};

const KEY_ORDER: Array<keyof CharacterColors> = [
  "cap", "capAccent", "gloves", "pads", "shoes", "bat", "ball", "wickets",
];

export function getAvailableKeys(shotType: ShotType): Array<keyof CharacterColors> {
  const sources = SHOT_SOURCES[shotType];
  return KEY_ORDER.filter((key) => {
    if (key === "bat") return sources.bat != null;
    if (key === "ball") return sources.ball != null;
    if (key === "wickets") return sources.wickets != null;
    if (key === "gloves") return sources.gloves != null;
    if (key === "pads") return sources.pads != null;
    if (key === "shoes") return sources.shoes != null;
    if (key === "cap") return sources.cap != null;
    if (key === "capAccent") return sources.capAccent != null;
    return false;
  });
}

export interface UseAccessoryCustomizationResult {
  colors: Partial<CharacterColors>;
  updateColor: (key: keyof CharacterColors, color: string) => void;
  reset: () => void;
  resetKey: (key: keyof CharacterColors) => void;
  applyCountryPreset: (country: string) => void;
  country: string;
  activeKey: keyof CharacterColors | null;
  setActiveKey: (key: keyof CharacterColors | null) => void;
  swatches: Record<keyof CharacterColors, string[]>;
  availableKeys: Array<keyof CharacterColors>;
}

export function useAccessoryCustomization(
  shotType: ShotType,
  country: string
): UseAccessoryCustomizationResult {
  const { styles, update, reset: resetTheme } = useCountryTheme(country);
  const [activeKey, setActiveKey] = useState<keyof CharacterColors | null>(null);

  const updateColor = useCallback(
    (key: keyof CharacterColors, color: string) => {
      update({ character: { ...styles.character, [key]: color } });
    },
    [styles.character, update]
  );

  const reset = useCallback(() => {
    resetTheme();
    setActiveKey(null);
  }, [resetTheme]);

  const resetKey = useCallback(
    (key: keyof CharacterColors) => {
      const defaultColor = getCountryStyles(country).character[key];
      update({ character: { ...styles.character, [key]: defaultColor } });
    },
    [country, styles.character, update]
  );

  const applyCountryPreset = useCallback(
    (targetCountry: string) => {
      update({ character: getCountryStyles(targetCountry).character });
    },
    [update]
  );

  return {
    colors: styles.character,
    updateColor,
    reset,
    resetKey,
    applyCountryPreset,
    country,
    activeKey,
    setActiveKey,
    swatches: ACCESSORY_SWATCHES,
    availableKeys: getAvailableKeys(shotType),
  };
}
