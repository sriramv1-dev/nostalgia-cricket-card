import type { LayeredCharacterSources } from "@/components/card/LayeredCharacter";
import type { CharacterColors } from "@/types/card";
import { BRAND_COLORS } from "./theme";
import {
  AllRounderIcon,
  BatterIcon,
  BowlerIcon,
  CardIcon,
  CharacterIcon,
  FormIcon,
  KeeperIcon,
  PresetsIcon,
  TapIcon,
} from "@/components/icons";

export interface CharacterSources extends LayeredCharacterSources {
  scale: number;
}

export type ShotType =
  | "pace"
  | "spin"
  | "alpha"
  | "loft"
  | "scoop"
  | "sweep"
  | "uppercut"
  | "keeping1"
  | "keeping2";

export type PlayerRole = "batter" | "bowler" | "allrounder" | "keeper";

export const ROLE_SHOTS: Record<PlayerRole, ShotType[]> = {
  bowler:     ["pace", "spin"],
  batter:     ["alpha", "loft", "scoop", "sweep", "uppercut"],
  allrounder: ["alpha", "loft", "scoop", "sweep", "uppercut"],
  keeper:     ["keeping1", "keeping2"],
};

export const DEFAULT_SHOT: Record<PlayerRole, ShotType> = {
  bowler:     "pace",
  batter:     "alpha",
  allrounder: "uppercut",
  keeper:     "keeping1",
};

/** Human-readable names for each customizable accessory layer. */
export const ACCESSORY_LABELS = {
  cap: "Cap",
  capAccent: "Cap Accent",
  gloves: "Gloves",
  pads: "Pads",
  shoes: "Shoes",
  bat: "Bat",
  ball: "Ball",
  wickets: "Wickets",
} as const;

/** Display list of every pose, in strip order — shared by the desktop
 *  diagram and the mobile shot strip. */
export const SHOT_OPTIONS: Array<{ shotType: ShotType; label: string }> = [
  { shotType: "alpha",    label: "Alpha" },
  { shotType: "loft",     label: "Loft" },
  { shotType: "scoop",    label: "Scoop" },
  { shotType: "sweep",    label: "Sweep" },
  { shotType: "uppercut", label: "Uppercut" },
  { shotType: "keeping1", label: "Keep 1" },
  { shotType: "keeping2", label: "Keep 2" },
  { shotType: "pace",     label: "Pace" },
  { shotType: "spin",     label: "Spin" },
];

export const SHOT_SOURCES: Record<ShotType, CharacterSources> = {
  pace: {
    scale: 1.0,
    base: "/images/card/pace-masks/pace-body.png",
    cap: "/images/card/pace-masks/pace-cap.png",
    capAccent: "/images/card/pace-masks/pace-cap-accent.png",
    ball: "/images/card/pace-masks/pace-ball.png",
    shoes: "/images/card/pace-masks/pace-shoes.png",
  },
  spin: {
    scale: 1.0,
    base: "/images/card/spin-masks/spin-body.png",
    cap: "/images/card/spin-masks/spin-cap.png",
    capAccent: "/images/card/spin-masks/spin-cap-accent.png",
    ball: "/images/card/spin-masks/spin-ball.png",
    shoes: "/images/card/spin-masks/spin-shoes.png",
  },
  alpha: {
    scale: 1.3,
    base: "/images/card/alpha-shot/alpha-body.png",
    cap: "/images/card/alpha-shot/alpha-cap.png",
    capAccent: "/images/card/alpha-shot/alpha-cap-accent.png",
    gloves: "/images/card/alpha-shot/alpha-gloves.png",
    pads: "/images/card/alpha-shot/alpha-pads.png",
    shoes: "/images/card/alpha-shot/alpha-shoes.png",
    bat: "/images/card/alpha-shot/alpha-bat.png",
  },
  loft: {
    scale: 1.3,
    base: "/images/card/loft-shot/loft-body.png",
    cap: "/images/card/loft-shot/loft-cap.png",
    capAccent: "/images/card/loft-shot/loft-cap-accent.png",
    gloves: "/images/card/loft-shot/loft-gloves.png",
    pads: "/images/card/loft-shot/loft-pads.png",
    shoes: "/images/card/loft-shot/loft-shoes.png",
    bat: "/images/card/loft-shot/loft-bat-body.png",
    batOutline: "/images/card/loft-shot/loft-bat-outline.png",
  },
  scoop: {
    scale: 1.3,
    base: "/images/card/scoop-shot/scoop-base.png",
    cap: "/images/card/scoop-shot/scoop-cap.png",
    capAccent: "/images/card/scoop-shot/scoop-cap-accent.png",
    gloves: "/images/card/scoop-shot/scoop-gloves.png",
    pads: "/images/card/scoop-shot/scoop-pads.png",
    shoes: "/images/card/scoop-shot/scoop-shoes.png",
    bat: "/images/card/scoop-shot/scoop-bat.png",
    ball: "/images/card/scoop-shot/scoop-ball.png",
  },
  sweep: {
    scale: 1.3,
    base: "/images/card/sweep-shot/sweep-body.png",
    cap: "/images/card/sweep-shot/sweep-cap.png",
    capAccent: "/images/card/sweep-shot/sweep-cap-accent.png",
    gloves: "/images/card/sweep-shot/sweep-gloves.png",
    pads: "/images/card/sweep-shot/sweep-pads.png",
    shoes: "/images/card/sweep-shot/sweep-shoes.png",
    bat: "/images/card/sweep-shot/sweep-bat.png",
  },
  uppercut: {
    scale: 1.5,
    base: "/images/card/uppercut-shot/uppercut-body.png",
    cap: "/images/card/uppercut-shot/uppercut-cap.png",
    capAccent: "/images/card/uppercut-shot/uppercut-cap-accent.png",
    gloves: "/images/card/uppercut-shot/uppercut-gloves.png",
    pads: "/images/card/uppercut-shot/uppercut-pads.png",
    shoes: "/images/card/uppercut-shot/uppercut-shoes.png",
    bat: "/images/card/uppercut-shot/uppercut-bat.png",
  },
  keeping1: {
    scale: 1.35,
    base: "/images/card/keeping1/keeping1-body-base.png",
    cap: "/images/card/keeping1/keeping1-cap.png",
    capAccent: "/images/card/keeping1/keeping1-cap-accent.png",
    gloves: "/images/card/keeping1/keeping1-gloves.png",
    pads: "/images/card/keeping1/keeping1-pads.png",
    shoes: "/images/card/keeping1/keeping1-shoes.png",
    ball: "/images/card/keeping1/keeping1-ball.png",
    wickets: "/images/card/keeping1/keeping1-wickets.png",
  },
  keeping2: {
    scale: 1.35,
    base: "/images/card/keeping2/keeping2-body.png",
    cap: "/images/card/keeping2/keeping2-cap.png",
    capAccent: "/images/card/keeping2/keeping2-cap-accent.png",
    gloves: "/images/card/keeping2/keeping2-gloves.png",
    pads: "/images/card/keeping2/keeping2-pads.png",
    shoes: "/images/card/keeping2/keeping2-shoes.png",
    wickets: "/images/card/keeping2/keeping2-wickets.png",
  },
};

/** Glow filters applied to the active/idle accessory layer during
 *  customization — shared by the mobile customizer surfaces. */
export const CHARACTER_GLOW_FILTERS = {
  idle: `drop-shadow(0 0 5px ${BRAND_COLORS.pink}) drop-shadow(0 0 2px ${BRAND_COLORS.pink})`,
  active: `drop-shadow(0 0 14px ${BRAND_COLORS.pink}) drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 3px ${BRAND_COLORS.pink})`,
} as const;

/** Map a shot to the player role it belongs to. */
export function deriveRole(shot: ShotType): PlayerRole {
  if (shot === "pace" || shot === "spin") return "bowler";
  if (shot === "keeping1" || shot === "keeping2") return "keeper";
  return "batter";
}

/** Colorable accessory keys available for a role (and shot, for keepers). */
export function getActiveKeys(
  role: PlayerRole,
  shot: ShotType
): Array<keyof CharacterColors> {
  if (role === "bowler") return ["cap", "capAccent", "shoes", "ball"];
  if (role === "batter")
    return ["cap", "capAccent", "gloves", "pads", "shoes", "bat"];
  if (role === "allrounder")
    return ["cap", "capAccent", "gloves", "pads", "shoes", "bat"];
  if (role === "keeper") {
    const base: Array<keyof CharacterColors> = [
      "cap",
      "capAccent",
      "gloves",
      "pads",
      "shoes",
      "wickets",
    ];
    if (shot === "keeping1") return [...base, "ball"];
    return base;
  }
  return ["cap", "capAccent", "shoes"];
}

export function getCharacterSources(
  role: PlayerRole | string,
  shot?: ShotType | string | null
): CharacterSources {
  const playerRole = role as PlayerRole;
  const validShots = ROLE_SHOTS[playerRole] ?? [];
  const resolvedShot =
    shot && validShots.includes(shot as ShotType)
      ? (shot as ShotType)
      : DEFAULT_SHOT[playerRole] ?? "alpha";
  return SHOT_SOURCES[resolvedShot];
}

// ─── Card-builder selector options ────────────────────────────────────────────

export const ROLE_OPTIONS = [
  { id: "batter" as const, label: "Batter", icon: <BatterIcon /> },
  { id: "bowler" as const, label: "Bowler", icon: <BowlerIcon /> },
  { id: "allrounder" as const, label: "All Rounder", icon: <AllRounderIcon /> },
  { id: "keeper" as const, label: "Keeper", icon: <KeeperIcon /> },
];

export const MODE_OPTIONS = [
  { id: "form" as const, label: "Form", icon: <FormIcon /> },
  { id: "tap" as const, label: "Tap", icon: <TapIcon /> },
];

export const TAB_OPTIONS = [
  { id: "character" as const, label: "Character", icon: <CharacterIcon /> },
  { id: "card" as const, label: "Card", icon: <CardIcon /> },
  { id: "presets" as const, label: "Presets", icon: <PresetsIcon /> },
];
