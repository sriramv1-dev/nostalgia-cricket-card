import type { PlayerRole, CricketFormat } from "./database.types";

export type { PlayerRole, CricketFormat };

export type PlayerFormatStats = {
  format: CricketFormat;
  batting: {
    matches: number;
    runs: number;
    average: number | null;
    highest: number | null;
    not_outs: number;
    hundreds: number;
    fifties: number;
    fours: number;
    sixes: number;
  } | null;
  bowling: {
    matches: number;
    wickets: number;
    average: number | null;
    economy: number | null;
    best: string | null;
    four_wickets: number;
    five_wickets: number;
  } | null;
  fielding: {
    catches: number;
    run_outs: number;
    stumpings: number;
  } | null;
};

export type PlayerStatsShowcaseProps = {
  player: {
    name: string;
    role: PlayerRole;
    country: string;
    photo_url: string | null;
  };
  stats: PlayerFormatStats[];
};
