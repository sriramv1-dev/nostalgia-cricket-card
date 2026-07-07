import type { CricketFormat } from "@/types/database.types";

export const BRAND_COLORS = {
  pink: "#e8257a",
  navy: "#1a3a8a",
  yellow: "#ffd600",
} as const;

export const SECTION_COLORS = {
  batting: "#ea580c",
  bowling: "#7c3aed",
  fielding: "#d97706",
} as const;

export const FORMAT_COLORS = {
  test: "#78350f",
  odi: "#1d4ed8",
  t20i: "#be185d",
} as const satisfies Record<CricketFormat, string>;

export const FORMAT_LABELS: Record<CricketFormat, string> = {
  test: "Test",
  odi: "ODI",
  t20i: "T20I",
};

export const FORMAT_COLORS_DARK: Record<CricketFormat, string> = {
  test: "#fcd34d",
  odi: "#93c5fd",
  t20i: "#f9a8d4",
};

export const FORMAT_COLORS_LIGHT: Record<CricketFormat, string> = {
  test: "#92400e",
  odi: "#1e40af",
  t20i: "#9d174d",
};
