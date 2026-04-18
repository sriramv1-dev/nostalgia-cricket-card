import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPlayerById } from "@/lib/queries/players";
import { playerToStatCard } from "@/lib/adapters/playerToStatCard";
import StatCard from "@/components/card/StatCard";
import { BrandCard } from "@/components/card/BrandCard";
import { CardWrapper } from "@/components/card/CardWrapper";
import { StatsGrid } from "@/components/card/StatsGrid";
import { POSE_REGISTRY } from "@/constants/poses";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ view?: string }>;

// ─── Page ─────────────────────────────────────────────────────────────────────

const ALPHA_POSE = POSE_REGISTRY.find((p) => p.label === "Alpha Shot")!;

export default async function PlayerDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const view = sp.view ?? "card";

  const result = await fetchPlayerById(id);

  if (result.error) {
    if (result.error.code === "PGRST116") notFound();
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
        <p className="text-red-400 text-sm">{result.error.message}</p>
      </main>
    );
  }

  const { player } = result.data;
  const playerStats = playerToStatCard(
    result.data,
    player.external_id,
    "Legend",
  );
  return (
    <main className="bg-zinc-950 min-h-screen">
      {/* Top bar */}
      <div className="px-8 pt-8 flex items-center gap-6">
        <Link
          href="/players"
          className="text-zinc-500 hover:text-zinc-300 text-sm font-mono tracking-wider transition-colors flex-shrink-0"
        >
          ← Players
        </Link>
        <div className="flex items-center gap-4 flex-1 justify-center">
          <h1 className="font-display text-4xl text-cream leading-none">
            {player.name}
          </h1>
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-mono mt-1">
            {player.country}
          </span>
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-mono mt-1">
            {player.role}
          </span>
        </div>
        <div className="flex-shrink-0 w-20" />
      </div>

      <div className="px-8 py-8">
        {/* View tabs */}
        <div className="flex gap-2 mb-8 justify-center mt-6">
          {(["card", "table"] as const).map((v) => (
            <Link
              key={v}
              href={`/players/${player.id}?view=${v}`}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-colors ${
                view === v
                  ? "bg-zinc-100 text-zinc-950"
                  : "text-zinc-500 border border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {v === "card" ? "Card View" : "Table View"}
            </Link>
          ))}
        </div>

        {/* Content */}
        {view === "card" ? (
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="flex flex-col items-center gap-3">
              <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-mono">
                Stat Card
              </p>
              <CardWrapper scale={0.5}>
                <StatCard stats={playerStats} />
              </CardWrapper>
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-mono">
                Brand Card
              </p>
              <CardWrapper scale={0.5}>
                <BrandCard
                  layers={ALPHA_POSE.layers}
                  width={ALPHA_POSE.width}
                  height={ALPHA_POSE.height}
                />
              </CardWrapper>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-zinc-800">
              <StatsGrid stats={playerStats} theme="dark" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
