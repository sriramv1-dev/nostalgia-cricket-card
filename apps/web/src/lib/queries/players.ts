import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  PlayerWithFormatStats,
  PlayerWithAllStats,
  PlayerWithFormatFilter,
  QueryResult,
} from "./types";
import type { CricketFormat } from "@/types/database.types";

function toQueryError(error: unknown): { message: string; code?: string } {
  if (error && typeof error === "object" && "message" in error) {
    const e = error as { message: string; code?: string };
    return { message: e.message, code: e.code };
  }
  return { message: "An unexpected error occurred" };
}

export async function fetchPlayersWithFormatStats(
  filters: PlayerWithFormatFilter = {}
): Promise<QueryResult<PlayerWithFormatStats[]>> {
  const { country, role, isActive, format = "odi", search, countries, roles } =
    filters;
  const supabase = await createSupabaseServerClient();

  let playersQuery = supabase
    .from("players")
    .select("*")
    .order("name", { ascending: true });

  if (countries && countries.length > 0) {
    playersQuery = playersQuery.in("country", countries);
  } else if (country !== undefined) {
    playersQuery = playersQuery.eq("country", country);
  }

  if (roles && roles.length > 0) {
    playersQuery = playersQuery.in("role", roles);
  } else if (role !== undefined) {
    playersQuery = playersQuery.eq("role", role);
  }

  if (isActive !== undefined)
    playersQuery = playersQuery.eq("is_active", isActive);
  if (search !== undefined)
    playersQuery = playersQuery.ilike("name", `%${search}%`);

  const { data: players, error: playersError } = await playersQuery;

  if (playersError) return { data: null, error: toQueryError(playersError) };
  if (!players || players.length === 0) return { data: [], error: null };

  const playerIds = players.map((p) => p.id);

  const { data: stats, error: statsError } = await supabase
    .from("player_stats")
    .select("*")
    .in("player_id", playerIds)
    .eq("format", format as CricketFormat);

  if (statsError) return { data: null, error: toQueryError(statsError) };

  const statsMap = new Map<string, (typeof stats)[number]>(
    (stats ?? []).map((s) => [s.player_id, s] as const)
  );

  const result: PlayerWithFormatStats[] = players.map((player) => ({
    player,
    stats: statsMap.get(player.id) ?? null,
  }));

  return { data: result, error: null };
}

export async function fetchPlayerById(
  id: string
): Promise<QueryResult<PlayerWithAllStats>> {
  const supabase = await createSupabaseServerClient();

  const [playerResult, statsResult] = await Promise.all([
    supabase.from("players").select("*").eq("id", id).single(),
    supabase.from("player_stats").select("*").eq("player_id", id),
  ]);

  if (playerResult.error) {
    const isNotFound = playerResult.error.code === "PGRST116";
    return {
      data: null,
      error: {
        message: isNotFound
          ? `Player not found: ${id}`
          : playerResult.error.message,
        code: playerResult.error.code,
      },
    };
  }

  if (statsResult.error)
    return { data: null, error: toQueryError(statsResult.error) };

  const allStats = statsResult.data ?? [];

  return {
    data: {
      player: playerResult.data,
      stats: {
        test: allStats.find((s) => s.format === "test") ?? null,
        odi: allStats.find((s) => s.format === "odi") ?? null,
        t20i: allStats.find((s) => s.format === "t20i") ?? null,
      },
    },
    error: null,
  };
}

export async function fetchPlayerByExternalId(
  externalId: string
): Promise<QueryResult<PlayerWithAllStats>> {
  const supabase = await createSupabaseServerClient();

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("external_id", externalId)
    .single();

  if (playerError) {
    const isNotFound = playerError.code === "PGRST116";
    return {
      data: null,
      error: {
        message: isNotFound
          ? `Player not found: ${externalId}`
          : playerError.message,
        code: playerError.code,
      },
    };
  }

  return fetchPlayerById(player.id);
}

export async function fetchCountries(): Promise<QueryResult<string[]>> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("players")
    .select("country")
    .order("country", { ascending: true });

  if (error) return { data: null, error: toQueryError(error) };

  const unique = [...new Set((data ?? []).map((r) => r.country))];
  return { data: unique, error: null };
}
