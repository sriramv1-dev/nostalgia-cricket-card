import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { fetchPlayersWithFormatStats, fetchCountries } from '@/lib/queries/players'
import type { PlayerWithFormatFilter } from '@/lib/queries/types'
import type { PlayerRole, PlayerRow, PlayerStatsRow } from '@/types/database.types'
import { CountrySelect } from './CountrySelect'

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

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function HeadlineStat({
  player,
  stats,
}: {
  player: PlayerRow
  stats: PlayerStatsRow | null
}) {
  const showBowling = player.role === 'bowler' || player.role === 'allrounder'
  const val = showBowling ? (stats?.bowl_wickets ?? '-') : (stats?.bat_runs ?? '-')
  const unit = showBowling ? 'wkts' : 'runs'

  return (
    <div className="font-display text-2xl text-brand">
      {val} <span className="text-xs text-zinc-500 font-sans">{unit}</span>
    </div>
  )
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
          <Suspense fallback={
            <select className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-xs uppercase tracking-wider">
              <option>All Countries</option>
            </select>
          }>
            <CountrySelect countries={countries} selected={country} />
          </Suspense>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          <div className="col-span-4 text-zinc-600 text-center py-24 flex flex-col items-center gap-4">
            <p>No players found.</p>
            <Link
              href="/players"
              className="text-xs uppercase tracking-wider border border-zinc-800 px-4 py-2 rounded-full hover:border-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Reset filters
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {players.map(({ player, stats }) => (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all hover:scale-[1.02]"
            >
              {/* Photo */}
              <div className="relative h-48 w-full bg-zinc-800">
                <Image
                  src={player.photo_url ?? '/images/card/player-placeholder.svg'}
                  alt={player.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-2">
                <p className="font-display text-xl text-cream tracking-wide leading-tight">
                  {player.name}
                </p>
                <div className="flex gap-1 flex-wrap">
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider rounded-full">
                    {player.country}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider rounded-full capitalize">
                    {player.role}
                  </span>
                </div>
                <HeadlineStat player={player} stats={stats} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
