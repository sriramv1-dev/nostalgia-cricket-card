import type { PlayerWithAllStats } from "@/lib/queries/types";
import type { PlayerStats, StatValue } from "@/components/card/StatCard";

function sv(
  a: number | string | null | undefined,
  b: number | string | null | undefined,
  c: number | string | null | undefined
): StatValue {
  return { test: a ?? "-", odi: b ?? "-", t20i: c ?? "-" };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function playerToStatCard(
  data: PlayerWithAllStats,
  cardNumber: string,
  rarity: string
): PlayerStats {
  const { player, stats } = data;
  const t = stats.test;
  const o = stats.odi;
  const p = stats.t20i;

  const KALLIS_ID = "c6806b06-0903-498e-82d5-9b5cbd0e0f7c";
  const image =
    player.id === KALLIS_ID
      ? "/images/players/kallis.jpg"
      : (player.photo_url ?? "/images/card/player-placeholder.svg");

  return {
    info: {
      number: cardNumber,
      rarity,
      name: player.name,
      country: player.country,
      role: cap(player.role),
      image,
    },
    matches: sv(t?.bat_matches, o?.bat_matches, p?.bat_matches),
    batting: {
      runs: sv(t?.bat_runs, o?.bat_runs, p?.bat_runs),
      notOuts: sv(t?.bat_not_outs, o?.bat_not_outs, p?.bat_not_outs),
      highScore: sv(t?.bat_highest, o?.bat_highest, p?.bat_highest),
      avg: sv(t?.bat_average, o?.bat_average, p?.bat_average),
      halfCenturies: sv(t?.bat_50s, o?.bat_50s, p?.bat_50s),
      centuries: sv(t?.bat_100s, o?.bat_100s, p?.bat_100s),
      fours: sv(t?.bat_fours, o?.bat_fours, p?.bat_fours),
      sixes: sv(t?.bat_sixes, o?.bat_sixes, p?.bat_sixes),
    },
    bowling: {
      wickets: sv(t?.bowl_wickets, o?.bowl_wickets, p?.bowl_wickets),
      bestBowl: sv(t?.bowl_best, o?.bowl_best, p?.bowl_best),
      avg: sv(t?.bowl_average, o?.bowl_average, p?.bowl_average),
      economy: sv(t?.bowl_economy, o?.bowl_economy, p?.bowl_economy),
      fourWkts: sv(t?.bowl_4w, o?.bowl_4w, p?.bowl_4w),
      fiveWkts: sv(t?.bowl_5w, o?.bowl_5w, p?.bowl_5w),
    },
    fielding: {
      catches: sv(t?.field_catches, o?.field_catches, p?.field_catches),
      runOuts: sv(t?.field_runouts, o?.field_runouts, p?.field_runouts),
      stumpings: sv(t?.field_stumpings, o?.field_stumpings, p?.field_stumpings),
    },
  };
}
