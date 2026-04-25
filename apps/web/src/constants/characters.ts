import type { LayeredCharacterSources } from "@/components/card/LayeredCharacter";

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
