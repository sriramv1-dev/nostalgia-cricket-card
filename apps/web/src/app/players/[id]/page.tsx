import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPlayerById } from "@/lib/queries/players";
import { playerToStatCard } from "@/lib/adapters/playerToStatCard";
import { CricketCard } from "@/components/card/CricketCard";
import { CardScaleWrapper } from "@/components/card/CardScaleWrapper";
import { PageHeader } from "@/components/layout";
// import { StatsGrid } from "@/components/card/StatsGrid";
import StatCard from "@/components/card/StatCard";
import { PlayerStatsShowcase } from "@/components/PlayerStatsShowcase";
import { ViewSwitcher } from "./ViewSwitcher";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_SCALES,
  CARD_DISPLAY,
} from "@/constants/card";
import type { PlayerFormatStats } from "@/types/player-stats";
import type { PlayerStatsRow } from "@/types/database.types";

function toFormatStats(row: PlayerStatsRow): PlayerFormatStats {
  return {
    format: row.format,
    batting:
      row.bat_matches != null
        ? {
            matches: row.bat_matches,
            runs: row.bat_runs ?? 0,
            average: row.bat_average,
            highest: row.bat_highest,
            not_outs: row.bat_not_outs ?? 0,
            hundreds: row.bat_100s ?? 0,
            fifties: row.bat_50s ?? 0,
            fours: row.bat_fours ?? 0,
            sixes: row.bat_sixes ?? 0,
          }
        : null,
    bowling:
      row.bowl_matches != null
        ? {
            matches: row.bowl_matches,
            wickets: row.bowl_wickets ?? 0,
            average: row.bowl_average,
            economy: row.bowl_economy,
            best: row.bowl_best,
            four_wickets: row.bowl_4w ?? 0,
            five_wickets: row.bowl_5w ?? 0,
          }
        : null,
    fielding:
      row.field_catches != null ||
      row.field_runouts != null ||
      row.field_stumpings != null
        ? {
            catches: row.field_catches ?? 0,
            run_outs: row.field_runouts ?? 0,
            stumpings: row.field_stumpings ?? 0,
          }
        : null,
  };
}

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ view?: string }>;

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
  const playerStats = playerToStatCard(result.data, player.external_id, "Legend");

  const showcaseStats: PlayerFormatStats[] = [stats.test, stats.odi, stats.t20i]
    .filter((s): s is PlayerStatsRow => s != null)
    .map(toFormatStats);

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden flex flex-col">
      <PageHeader
        title={player.name}
        back={{ label: "Players" }}
        subtitle={
          <>
            <span className="font-display text-md tracking-widest text-white">
              {player.country}
            </span>
            <span className="mx-2 flex-shrink-0 text-pink-400 font-bold">›</span>
            <span className="font-display text-md tracking-widest text-white">
              {player.role}
            </span>
          </>
        }
        right={<ViewSwitcher playerId={player.id} view={view} />}
      />

      <div className="px-8 py-4 flex-1 overflow-hidden flex items-center justify-center">
        {view === "card" ? (
          <div className="flex flex-wrap gap-8 justify-center items-center">
            <Link
              href={`/players/${player.id}?view=table`}
              scroll={false}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <p className="text-zinc-600 text-[10px] tracking-widest font-mono group-hover:text-pink-400 transition-colors">
                Stat Card ↗
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
            </Link>
            <Link
              href={`/card-builder?country=${encodeURIComponent(player.country)}&role=${player.role}&from=${encodeURIComponent(`/players/${player.id}`)}&fromLabel=${encodeURIComponent(player.name)}`}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <p className="text-zinc-600 text-[10px] tracking-widest font-mono group-hover:text-pink-400 transition-colors">
                Brand Card ↗
              </p>
              <CardScaleWrapper scale="detail">
                <CricketCard player={player} stats={odiStats} variant="brand" noLink />
              </CardScaleWrapper>
            </Link>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <PlayerStatsShowcase
              player={{
                name: player.name,
                role: player.role,
                country: player.country,
                photo_url: player.photo_url,
              }}
              stats={showcaseStats}
            />
          </div>
          // <div className="max-w-3xl mx-auto">
          //   <div className="rounded-2xl overflow-hidden border border-zinc-800">
          //     <StatsGrid stats={playerStats} theme="dark" variant="page" />
          //   </div>
          // </div>
        )}
      </div>
    </div>
  );
}
