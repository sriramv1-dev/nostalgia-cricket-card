import Link from 'next/link'
import Image from 'next/image'
import type { PlayerRow, PlayerStatsRow } from '@/types/database.types'
import { PlayerActionImage } from './PlayerActionImage'


interface PlayerCardProps {
  player: PlayerRow
  stats: PlayerStatsRow | null
}

interface CountryStyles {
  border: string
  bgStart: string
  bgEnd: string
  textColor: string
}

function getCountryStyles(country: string): CountryStyles {
  const styles: Record<string, CountryStyles> = {
    'India': { border: '#0038A8', bgStart: '#f0f7ff', bgEnd: '#cfe3ff', textColor: '#ffffff' },
    'Australia': { border: '#FFCD00', bgStart: '#fffdf5', bgEnd: '#fff2c2', textColor: '#00401A' },
    'Sri Lanka': { border: '#000080', bgStart: '#f0f0ff', bgEnd: '#d1d1ff', textColor: '#ffffff' },
    'Pakistan': { border: '#00401A', bgStart: '#f2fdf5', bgEnd: '#d4f7de', textColor: '#ffffff' },
    'South Africa': { border: '#007749', bgStart: '#f5fdf9', bgEnd: '#dcf7eb', textColor: '#ffffff' },
    'West Indies': { border: '#7B0041', bgStart: '#fdf5f9', bgEnd: '#f7d4e6', textColor: '#ffffff' },
    'England': { border: '#CE1126', bgStart: '#fff5f5', bgEnd: '#ffdada', textColor: '#ffffff' },
    'New Zealand': { border: '#000000', bgStart: '#fcfcfc', bgEnd: '#e0e0e0', textColor: '#ffffff' },
    'Zimbabwe': { border: '#E4332E', bgStart: '#fff7f7', bgEnd: '#ffe0e0', textColor: '#ffffff' },
    'Bangladesh': { border: '#006A4E', bgStart: '#f5fdf9', bgEnd: '#dcf7eb', textColor: '#ffffff' },
  }
  return styles[country] || { border: '#CE1126', bgStart: '#f8f5e9', bgEnd: '#f2ead0', textColor: '#ffffff' }
}

function getCountryCode(country: string): string {
  const codes: Record<string, string> = {
    'India': 'IND',
    'Australia': 'AUS',
    'Sri Lanka': 'SL',
    'Pakistan': 'PAK',
    'South Africa': 'SA',
    'England': 'ENG',
    'West Indies': 'WI',
    'New Zealand': 'NZ',
    'Zimbabwe': 'ZIM',
    'Bangladesh': 'BAN',
  }
  return codes[country] || country.slice(0, 3).toUpperCase()
}


export function PlayerCard({ player, stats }: PlayerCardProps) {
  const isBowler = player.role === 'bowler' || player.role === 'allrounder'
  
  // Dynamic stats based on role
  const matches = isBowler ? stats?.bowl_matches : stats?.bat_matches
  const secondaryStatLabel = isBowler ? 'Avg.' : 'Avg.'
  const secondaryStatValue = isBowler ? stats?.bowl_average : stats?.bat_average
  const primaryStatLabel = isBowler ? 'Wkts' : 'Runs'
  const primaryStatValue = isBowler ? stats?.bowl_wickets : stats?.bat_runs

  const countryStyles = getCountryStyles(player.country)

  return (
    <Link
      href={`/players/${player.id}`}
      className="rounded-sm overflow-hidden hover:scale-[1.02] transition-all flex flex-col items-center p-2 min-h-[480px] shadow-2xl relative"
      style={{ backgroundColor: countryStyles.border }}
    >
      {/* Inner Curved Panel */}
      <div 
        className="absolute inset-2 rounded-[2.5rem] overflow-hidden"
        style={{ 
          backgroundColor: "white",
          opacity: 0.9
          // background: `radial-gradient(circle at center, ${countryStyles.bgStart} 0%, ${countryStyles.bgEnd} 100%)` 
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full flex flex-col items-center h-full flex-1">
        {/* Top Logo */}
        <div className="relative h-20 w-full mb-2 mt-4">
          <Image
            src="/images/card/logo-no-bg.png"
            alt="Nostalgia Cricket"
            fill
            className="object-contain"
          />
        </div>

        <PlayerActionImage player={player} />

        {/* Footer: Red Section + Yellow Box */}
        <div className="w-full flex gap-1 mt-auto pb-4 px-3">
          {/* Red Section: Country Code */}
          <div 
            className="rounded-2xl w-10 flex items-center justify-center py-4 shadow-inner"
            style={{ backgroundColor: countryStyles.border }}
          >
            <span 
              className="font-display text-lg uppercase rotate-[-90deg] whitespace-nowrap tracking-widest font-bold"
              style={{ color: countryStyles.textColor }}
            >
              {getCountryCode(player.country)}
            </span>
          </div>

          {/* Yellow Box: Name and Stats */}
          <div className="flex-1 bg-yellow-400 border-[3px] border-green-800 rounded-2xl overflow-hidden flex flex-col shadow-lg">
            {/* Name Row */}
            <div className="bg-yellow-400 border-b-[3px] border-green-800 px-3 py-1.5 flex justify-center items-center">
              <p className="font-display text-lg text-red-600 uppercase font-bold leading-none">
                {player.name}
              </p>
            </div>
            
            {/* Stats Row 1: Matches */}
            <div className="flex-1 bg-yellow-400 border-b-[3px] border-green-800 px-3 py-1 flex justify-between items-center text-green-900 font-nunito font-extrabold text-xs uppercase">
              <span>Matches</span>
              <span className="text-sm">{matches ?? 0}</span>
            </div>

            {/* Stats Row 2: Two Stats */}
            <div className="flex-1 flex bg-yellow-400 text-green-900 font-nunito font-extrabold text-[10px] uppercase">
              <div className="flex-1 border-r-[3px] border-green-800 px-2 py-1 flex justify-between items-center">
                <span>{secondaryStatLabel}</span>
                <span className="text-sm">{secondaryStatValue ?? '-'}</span>
              </div>
              <div className="flex-1 px-2 py-1 flex justify-between items-center">
                <span>{primaryStatLabel}</span>
                <span className="text-sm">{primaryStatValue ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
