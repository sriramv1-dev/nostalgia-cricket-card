import type { PlayerFormatStats, CricketFormat } from "@/types/player-stats";

/** Batting value, or an em-dash when the format has no batting data. */
export function bv(
  data: PlayerFormatStats["batting"] | undefined,
  get: (b: NonNullable<PlayerFormatStats["batting"]>) => string | number
): string | number {
  return data != null ? get(data) : "—";
}

/** Bowling value, or an em-dash when the format has no bowling data. */
export function bolv(
  data: PlayerFormatStats["bowling"] | undefined,
  get: (b: NonNullable<PlayerFormatStats["bowling"]>) => string | number
): string | number {
  return data != null ? get(data) : "—";
}

/** Fielding value, or an em-dash when the format has no fielding data. */
export function fldv(
  data: PlayerFormatStats["fielding"] | undefined,
  get: (b: NonNullable<PlayerFormatStats["fielding"]>) => string | number
): string | number {
  return data != null ? get(data) : "—";
}

/** Build a per-format value map for one stat row. */
export function rowValues(
  formats: CricketFormat[],
  get: (fmt: CricketFormat) => string | number
): Partial<Record<CricketFormat, string | number>> {
  return Object.fromEntries(formats.map((f) => [f, get(f)])) as Partial<
    Record<CricketFormat, string | number>
  >;
}
