import type { ComputedStatRow } from "@/components/showcase/StatsTable";
import type {
  PlayerStatsShowcaseProps,
  PlayerFormatStats,
  CricketFormat,
} from "@/types/player-stats";

const FORMAT_ORDER: CricketFormat[] = ["test", "odi", "t20i"];

/** Stat value, or an em-dash when the format has no data for that discipline. */
function statValue<T>(
  data: T | null | undefined,
  get: (d: T) => string | number
): string | number {
  return data != null ? get(data) : "—";
}

/** Build a per-format value map for one stat row. */
function rowValues(
  formats: CricketFormat[],
  get: (fmt: CricketFormat) => string | number
): Partial<Record<CricketFormat, string | number>> {
  const values: Partial<Record<CricketFormat, string | number>> = {};
  for (const fmt of formats) {
    values[fmt] = get(fmt);
  }
  return values;
}

export interface DerivedPlayerStats {
  presentFormats: CricketFormat[];
  battingRows: ComputedStatRow[];
  bowlingRows: ComputedStatRow[];
  fieldingRows: ComputedStatRow[];
  hasBatting: boolean;
  hasBowling: boolean;
  hasFielding: boolean;
}

/** Derive the showcase stat rows and section flags from a player's raw format stats. */
export function derivePlayerStats(
  player: PlayerStatsShowcaseProps["player"],
  stats: PlayerFormatStats[]
): DerivedPlayerStats {
  const presentFormats = FORMAT_ORDER.filter((fmt) =>
    stats.some((s) => s.format === fmt)
  );

  const byFormat: Partial<Record<CricketFormat, PlayerFormatStats>> = {};
  stats.forEach((s) => {
    byFormat[s.format] = s;
  });

  const battingRows: ComputedStatRow[] = [
    { key: "matches",  label: "Matches",  animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.batting, (b) => b.matches)) },
    { key: "runs",     label: "Runs",     animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.batting, (b) => b.runs)) },
    { key: "average",  label: "Average",  animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.batting, (b) => b.average ?? "—")) },
    { key: "highest",  label: "Highest",  animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.batting, (b) => b.highest ?? "—")) },
    { key: "not_outs", label: "Not Outs", animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.batting, (b) => b.not_outs)) },
    { key: "hundreds", label: "100s",     animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.batting, (b) => b.hundreds)) },
    { key: "fifties",  label: "50s",      animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.batting, (b) => b.fifties)) },
    { key: "fours",    label: "4s",       animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.batting, (b) => b.fours)) },
    { key: "sixes",    label: "6s",       animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.batting, (b) => b.sixes)) },
  ];

  const bowlingRows: ComputedStatRow[] = [
    { key: "matches",      label: "Matches", animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.bowling, (b) => b.matches)) },
    { key: "wickets",      label: "Wickets", animated: true,  values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.bowling, (b) => b.wickets)) },
    { key: "average",      label: "Average", animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.bowling, (b) => b.average ?? "—")) },
    { key: "economy",      label: "Economy", animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.bowling, (b) => b.economy ?? "—")) },
    { key: "best",         label: "Best",    animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.bowling, (b) => b.best ?? "—")) },
    { key: "four_wickets", label: "4W",      animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.bowling, (b) => b.four_wickets)) },
    { key: "five_wickets", label: "5W",      animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.bowling, (b) => b.five_wickets)) },
  ];

  const fieldingRows: ComputedStatRow[] = [
    { key: "catches",  label: "Catches",  animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.fielding, (b) => b.catches)) },
    { key: "run_outs", label: "Run Outs", animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.fielding, (b) => b.run_outs)) },
    ...(player.role === "keeper"
      ? [{ key: "stumpings", label: "Stumpings", animated: false, values: rowValues(presentFormats, (f) => statValue(byFormat[f]?.fielding, (b) => b.stumpings)) }]
      : []),
  ];

  return {
    presentFormats,
    battingRows,
    bowlingRows,
    fieldingRows,
    hasBatting: presentFormats.some((f) => byFormat[f]?.batting != null),
    hasBowling: presentFormats.some((f) => byFormat[f]?.bowling != null),
    hasFielding: presentFormats.some((f) => byFormat[f]?.fielding != null),
  };
}
