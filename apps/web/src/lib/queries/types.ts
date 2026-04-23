import type {
  PlayerRow,
  PlayerStatsRow,
  CricketFormat,
  PlayerRole,
} from "@/types/database.types";

export interface PlayerFilters {
  country?: string;
  role?: PlayerRole;
  isActive?: boolean;
}

export interface PlayerWithFormatFilter extends PlayerFilters {
  format?: CricketFormat;
  search?: string;
}

export interface PlayerWithFormatStats {
  player: PlayerRow;
  stats: PlayerStatsRow | null;
}

export interface PlayerWithAllStats {
  player: PlayerRow;
  stats: {
    test: PlayerStatsRow | null;
    odi: PlayerStatsRow | null;
    t20i: PlayerStatsRow | null;
  };
}

export type QueryResult<T> =
  | { data: T; error: null }
  | { data: null; error: QueryError };

export interface QueryError {
  message: string;
  code?: string;
}
