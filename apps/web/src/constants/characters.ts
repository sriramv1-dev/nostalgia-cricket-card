import type { LayeredCharacterSources } from "@/components/card/LayeredCharacter";

export interface CharacterSources extends LayeredCharacterSources {
  scale: number;
}

export interface RoleConfig {
  dir: string;
  prefix: string;
  parts: string[];
}

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  bowler: {
    dir: "/images/card/pace-masks",
    prefix: "pace",
    parts: ["body", "ball", "cap", "cap-accent", "shoes"],
  },
  keeper: {
    dir: "/images/card/keeping1",
    prefix: "keeping1",
    parts: [
      "body-base",
      "ball",
      "cap",
      "cap-accent",
      "gloves",
      "pads",
      "shoes",
      "wickets",
    ],
  },
  allrounder: {
    dir: "/images/card/uppercut-shot",
    prefix: "uppercut",
    parts: ["body", "bat", "cap", "cap-accent", "gloves", "pads", "shoes"],
  },
  batter: {
    dir: "/images/card/alpha-shot",
    prefix: "alpha",
    parts: ["body", "bat", "cap", "cap-accent", "gloves", "pads", "shoes"],
  },
};

export function getCharacterSources(role: string): CharacterSources {
  switch (role) {
    case "bowler":
      return {
        scale: 1.0,
        base: "/images/card/pace-masks/pace-body.png",
        cap: "/images/card/pace-masks/pace-cap.png",
        capAccent: "/images/card/pace-masks/pace-cap-accent.png",
        ball: "/images/card/pace-masks/pace-ball.png",
        shoes: "/images/card/pace-masks/pace-shoes.png",
      };
    case "keeper":
      return {
        scale: 1.35,
        base: "/images/card/keeping1/keeping1-body-base.png",
        cap: "/images/card/keeping1/keeping1-cap.png",
        capAccent: "/images/card/keeping1/keeping1-cap-accent.png",
        gloves: "/images/card/keeping1/keeping1-gloves.png",
        pads: "/images/card/keeping1/keeping1-pads.png",
        shoes: "/images/card/keeping1/keeping1-shoes.png",
        ball: "/images/card/keeping1/keeping1-ball.png",
        wickets: "/images/card/keeping1/keeping1-wickets.png",
      };
    case "allrounder":
      return {
        scale: 1.5,
        base: "/images/card/uppercut-shot/uppercut-body.png",
        cap: "/images/card/uppercut-shot/uppercut-cap.png",
        capAccent: "/images/card/uppercut-shot/uppercut-cap-accent.png",
        gloves: "/images/card/uppercut-shot/uppercut-gloves.png",
        pads: "/images/card/uppercut-shot/uppercut-pads.png",
        shoes: "/images/card/uppercut-shot/uppercut-shoes.png",
        bat: "/images/card/uppercut-shot/uppercut-bat.png",
      };
    case "batter":
    default:
      return {
        scale: 1.3,
        base: "/images/card/alpha-shot/alpha-body.png",
        cap: "/images/card/alpha-shot/alpha-cap.png",
        capAccent: "/images/card/alpha-shot/alpha-cap-accent.png",
        gloves: "/images/card/alpha-shot/alpha-gloves.png",
        pads: "/images/card/alpha-shot/alpha-pads.png",
        shoes: "/images/card/alpha-shot/alpha-shoes.png",
        bat: "/images/card/alpha-shot/alpha-bat.png",
      };
  }
}
