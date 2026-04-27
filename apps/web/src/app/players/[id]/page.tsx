import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPlayerById } from "@/lib/queries/players";
import { playerToStatCard } from "@/lib/adapters/playerToStatCard";
import { CricketCard } from "@/components/card/CricketCard";
import { CardScaleWrapper } from "@/components/card/CardScaleWrapper";
import { PageHeader } from "@/components/layout";
import { StatsGrid } from "@/components/card/StatsGrid";
import StatCard from "@/components/card/StatCard";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_SCALES,
  CARD_DISPLAY,
} from "@/constants/card";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ view?: string }>;

// ─── Page ─────────────────────────────────────────────────────────────────────

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
      <div className="min-h-screen flex items-center justify-center p-8">
        <p className="text-red-400 text-sm">{result.error.message}</p>
      </div>
    );
  }

  const { player, stats } = result.data;
  const odiStats = stats.odi;
  const playerStats = playerToStatCard(
    result.data,
    player.external_id,
    "Legend"
  );
  return (
    <div className="bg-zinc-950 min-h-screen">
      <PageHeader
        title={player.name}
        subtitle={
          <>
            <span className="font-display text-sm tracking-widest text-white">
              {player.country}
            </span>
            <span className="mx-2 flex-shrink-0 text-pink-400 font-bold">
              ›
            </span>
            <span className="font-display text-sm tracking-widest text-white">
              {player.role}
            </span>
          </>
        }
      />

      <div className="px-8 py-4">
        {/* View tabs */}
        <div className="flex gap-2 mb-4 justify-center mt-2">
          {(["card", "table"] as const).map((v) => (
            <Link
              key={v}
              href={`/players/${player.id}?view=${v}`}
              className={`px-5 py-2 rounded-full text-xs tracking-wider font-medium transition-colors ${
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
              <p className="text-zinc-600 text-[10px] tracking-widest font-mono">
                Stat Card
              </p>
              <div
                style={{
                  width: CARD_DISPLAY.detail.width,
                  height: CARD_DISPLAY.detail.height,
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    transform: `scale(${CARD_SCALES.detail})`,
                    transformOrigin: "top left",
                  }}
                >
                  <StatCard stats={playerStats} />
                </div>
              </div>
            </div>
            <Link
              href={`/card-builder?country=${encodeURIComponent(player.country)}&role=${player.role}`}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <p className="text-zinc-600 text-[10px] tracking-widest font-mono group-hover:text-pink-400 transition-colors">
                Brand Card ↗
              </p>
              <CardScaleWrapper scale="detail">
                <CricketCard
                  player={player}
                  stats={odiStats}
                  variant="brand"
                  noLink
                />
              </CardScaleWrapper>
            </Link>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-zinc-800">
              <StatsGrid stats={playerStats} theme="dark" variant="page" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
