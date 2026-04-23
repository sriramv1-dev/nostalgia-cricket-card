import Link from 'next/link'
import { fetchPlayersWithFormatStats, fetchCountries } from '@/lib/queries/players'
import type { PlayerWithFormatFilter } from '@/lib/queries/types'
import type { PlayerRole, PlayerRow, PlayerStatsRow } from '@/types/database.types'
import { CountrySelect } from './CountrySelect'
import { CricketCard } from '@/components/card/CricketCard'

type SearchParams = Promise<{
  country?: string
  role?: string
  search?: string
}>

const ROLES: { label: string; value: PlayerRole | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Batter', value: 'batter' },
  { label: 'Bowler', value: 'bowler' },
  { label: 'Allrounder', value: 'allrounder' },
  { label: 'Keeper', value: 'keeper' },
]

function buildUrl(p: {
  country?: string
  role?: PlayerRole
  search?: string
}): string {
  const params = new URLSearchParams()
  if (p.country) params.set('country', p.country)
  if (p.role) params.set('role', p.role)
  if (p.search) params.set('search', p.search)
  const qs = params.toString()
  return qs ? `/players?${qs}` : '/players'
}



const pillBase = 'px-3 py-1 rounded-full text-xs uppercase tracking-wider font-medium transition-colors'
const pillActive = 'bg-brand text-white'
const pillInactive = 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const country = params.country || undefined
  const role = (params.role as PlayerRole | undefined) || undefined
  const search = params.search || undefined

  const filter: PlayerWithFormatFilter = { country, role, search }

  const [playersResult, countriesResult] = await Promise.all([
    fetchPlayersWithFormatStats(filter),
    fetchCountries(),
  ])

  if (playersResult.error) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-red-400">{playersResult.error.message}</p>
      </main>
    )
  }

  const players = playersResult.data
  const countries = countriesResult.data ?? []

  const clearSearchUrl = buildUrl({ country, role })

  return (
    <main className="bg-zinc-950 min-h-screen p-12">
      {/* Heading */}
      <h1 className="font-display text-5xl text-cream tracking-widest uppercase mb-2">
        Players
      </h1>
      <p className="text-zinc-600 text-xs uppercase tracking-widest font-mono mb-8">
        Nostalgia Cricket Card · 1990s Legends
      </p>

      {/* Search form */}
      <form method="GET" action="/players" className="flex items-center gap-3 mb-6">
        {country && <input type="hidden" name="country" value={country} />}
        {role && <input type="hidden" name="role" value={role} />}
        <input
          type="text"
          name="search"
          defaultValue={search ?? ''}
          placeholder="Search players…"
          className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-4 py-2 text-sm w-64 focus:border-zinc-600 outline-none"
        />
        <button
          type="submit"
          className="bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-sm hover:bg-zinc-700 transition-colors"
        >
          Search
        </button>
        {search && (
          <Link
            href={clearSearchUrl}
            aria-label="Clear search"
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-2 rounded-xl text-sm hover:text-zinc-200 transition-colors"
          >
            ×
          </Link>
        )}
      </form>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        {/* Country select */}
        {countries.length > 0 && (
          <CountrySelect countries={countries} selected={country} />
        )}

        {/* Role pills */}
        <div className="flex gap-2 flex-wrap">
          {ROLES.map(({ label, value }) => (
            <Link
              key={label}
              href={buildUrl({ country, role: value, search })}
              className={`${pillBase} ${role === value ? pillActive : pillInactive}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-zinc-600 text-xs font-mono mb-2">
        Showing {players.length} player{players.length !== 1 ? 's' : ''}
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
            <div
              key={player.id}
              style={{ width: '250px', height: '350px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}
            >
              <div style={{ width: '750px', height: '1050px', transform: 'scale(0.333)', transformOrigin: 'top left' }}>
                <CricketCard player={player} stats={stats} variant="player" />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
