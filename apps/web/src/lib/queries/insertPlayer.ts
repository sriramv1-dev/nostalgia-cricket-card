import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { GeminiPlayer } from "@/lib/gemini/validator";

function createSupabaseServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function insertPlayerWithStats(
  geminiPlayer: GeminiPlayer
): Promise<string> {
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

  if (playerError) throw new Error("DB_INSERT_FAILED: " + playerError.message);

  const playerId = player.id;

  const formats = ["test", "odi", "t20i"] as const;
  const statsRows = formats
    .filter((f) => geminiPlayer.stats[f] !== null)
    .map((f) => ({
      player_id: playerId,
      format: f,
      synced_at: null,
      ...geminiPlayer.stats[f]!,
    }));

  if (statsRows.length > 0) {
    const { error: statsError } = await supabase
      .from("player_stats")
      .insert(statsRows);

    if (statsError) {
      await supabase.from("players").delete().eq("id", playerId);
      throw new Error("DB_INSERT_FAILED: " + statsError.message);
    }
  }

  return playerId;
}
