import { createSupabaseServiceClient } from "@/lib/supabase/server";

export default async function AdminQueuePage() {
  const supabase = createSupabaseServiceClient();
  const { data: players, error } = await supabase
    .from("players")
    .select("*")
    .eq("is_active", false)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Queue</h1>
          <p className="text-gray-400 text-sm mt-1">
            Players pending activation
          </p>
        </div>
        <span className="text-xs text-gray-500 bg-gray-900 border border-gray-800 rounded-full px-3 py-1">
          {players?.length ?? 0} pending
        </span>
      </div>

      {error && (
        <p className="text-red-400 text-sm">
          Failed to load queue: {error.message}
        </p>
      )}

      {!error && (!players || players.length === 0) && (
        <p className="text-gray-500 text-sm">Queue is empty.</p>
      )}

      {players && players.length > 0 && (
        <div className="flex flex-col gap-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-5 py-4"
            >
              <div>
                <p className="text-white font-medium">{player.name}</p>
                <p className="text-gray-400 text-sm">
                  {player.country} · {player.role}
                </p>
              </div>
              <span className="text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1">
                pending
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
