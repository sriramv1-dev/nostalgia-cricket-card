import Link from "next/link";
import { fetchPlayersWithFormatStats } from "@/lib/queries/players";
import type { PlayerWithFormatFilter } from "@/lib/queries/types";
import type { PlayerRole } from "@/types/database.types";
import { CricketCard } from "@/components/card/CricketCard";
import { CardWrapper } from "@/components/ui/CardWrapper";
import { SearchFilterBar } from "@/components/players/SearchFilterBar";

type SearchParams = Promise<{
  country?: string | string[];
  role?: string | string[];
  search?: string;
}>;

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const search = params.search ?? "";
  const countries = Array.isArray(params.country)
    ? params.country
    : params.country
      ? [params.country]
      : [];
  const roles = Array.isArray(params.role)
    ? params.role
    : params.role
      ? [params.role]
      : [];

  const filter: PlayerWithFormatFilter = {
    countries,
    roles: roles as PlayerRole[],
    search: search || undefined,
  };

  const playersResult = await fetchPlayersWithFormatStats(filter);

  if (playersResult.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">{playersResult.error.message}</p>
      </div>
    );
  }

  const players = playersResult.data;

  return (
    <div className="bg-zinc-950 min-h-screen p-12">
      {/* Heading */}
      <h1 className="font-display text-5xl text-cream tracking-widest uppercase mb-2">
        Players
      </h1>
      <p className="text-zinc-600 text-xs uppercase tracking-widest font-mono mb-8">
        Nostalgia Cricket Card · 1990s Legends
      </p>

      {/* Search + filter bar */}
      <div className="mb-6">
        <SearchFilterBar
          initialSearch={search}
          initialCountries={countries}
          initialRoles={roles.map(
            (r) => r.charAt(0).toUpperCase() + r.slice(1)
          )}
        />
      </div>

      {/* Result count */}
      <p className="text-zinc-600 text-xs font-mono mb-2">
        Showing {players.length} player{players.length !== 1 ? "s" : ""}
        {search && <span> for &ldquo;{search}&rdquo;</span>}
      </p>

      {/* Grid */}
      {players.length === 0 ? (
        <div className="text-zinc-600 text-center py-24 flex flex-col items-center gap-4 mt-8">
          <p>No players found.</p>
          <Link
            href="/players"
            className="text-xs uppercase tracking-wider border border-zinc-800 px-4 py-2 rounded-full hover:border-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Reset filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {players.map(({ player, stats }) => (
            <CardWrapper key={player.id}>
              <CricketCard player={player} stats={stats} variant="player" />
            </CardWrapper>
          ))}
        </div>
      )}
    </div>
  );
}
