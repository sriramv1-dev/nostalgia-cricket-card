import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { GeminiPlayer } from "@/lib/gemini/validator";
import type { QueryResult } from "./types";

export async function insertPlayerWithStats(
  geminiPlayer: GeminiPlayer
): Promise<QueryResult<string>> {
  const supabase = createSupabaseServiceClient();

  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({
      name: geminiPlayer.name,
      country: geminiPlayer.country,
      role: geminiPlayer.role,
      shot: null,
      external_id: geminiPlayer.external_id || `gemini_${Date.now()}`,
      is_active: false,
      photo_url: null,
      synced_at: null,
    })
    .select("id")
    .single();

  if (playerError) {
    return {
      data: null,
      error: {
        message: "DB_INSERT_FAILED: " + playerError.message,
        code: playerError.code,
      },
    };
  }

  const playerId = player.id;

  const formats = ["test", "odi", "t20i"] as const;
  const statsRows = formats
    .filter((f) => geminiPlayer.stats[f] !== null)
    .map((f) => ({
      player_id: playerId,
      format: f,
      synced_at: null,
      // safe: nulls are filtered out on the line above
      ...geminiPlayer.stats[f]!,
    }));

  if (statsRows.length > 0) {
    const { error: statsError } = await supabase
      .from("player_stats")
      .insert(statsRows);

    if (statsError) {
      // Roll back the orphaned player row before reporting the failure.
      await supabase.from("players").delete().eq("id", playerId);
      return {
        data: null,
        error: {
          message: "DB_INSERT_FAILED: " + statsError.message,
          code: statsError.code,
        },
      };
    }
  }

  return { data: playerId, error: null };
}
