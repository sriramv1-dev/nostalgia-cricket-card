'use client'

import { motion } from 'framer-motion'
import { cn, RARITY_COLORS, RARITY_GLOW } from '@/lib/utils'
import type { Card } from '@/types'
import Image from 'next/image'

interface CricketCardProps {
  card: Card
  showBack?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  isFoil?: boolean
  isSelected?: boolean
  isOffered?: boolean
}

const SIZE_CONFIG = {
  sm: {
    wrapper: 'w-28',
    image: 'h-28',
    nameText: 'text-sm',
    subText: 'text-[10px]',
    padding: 'p-2',
    badge: 'text-[9px] px-1.5 py-0.5',
    statText: 'text-[9px]',
  },
  md: {
    wrapper: 'w-40',
    image: 'h-36',
    nameText: 'text-base',
    subText: 'text-xs',
    padding: 'p-3',
    badge: 'text-xs px-2 py-0.5',
    statText: 'text-[10px]',
  },
  lg: {
    wrapper: 'w-56',
    image: 'h-52',
    nameText: 'text-xl',
    subText: 'text-sm',
    padding: 'p-4',
    badge: 'text-xs px-2.5 py-1',
    statText: 'text-xs',
  },
}

const ROLE_LABELS: Record<string, string> = {
  batsman: 'BAT',
  bowler: 'BOWL',
  allrounder: 'AR',
  wicketkeeper: 'WK',
}

const RARITY_BORDER: Record<string, string> = {
  common: 'border-gray-500',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  legendary: 'border-yellow-400',
}

const RARITY_HEADER: Record<string, string> = {
  common: 'from-gray-700 to-gray-900',
  uncommon: 'from-green-900 to-gray-900',
  rare: 'from-blue-900 to-gray-900',
  legendary: 'from-yellow-900 via-amber-900 to-gray-900',
}

export function CricketCard({
  card,
  showBack = false,
  size = 'md',
  onClick,
  isFoil = false,
  isSelected = false,
  isOffered = false,
}: CricketCardProps) {
  const s = SIZE_CONFIG[size]

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl border-2 bg-cream cursor-pointer select-none overflow-hidden flex-shrink-0',
        s.wrapper,
        RARITY_BORDER[card.rarity],
        RARITY_GLOW[card.rarity],
        isSelected && 'ring-2 ring-brand ring-offset-2 ring-offset-gray-950',
        isOffered && 'ring-2 ring-gold ring-offset-2 ring-offset-gray-950',
        onClick && 'active:scale-95',
      )}
      style={{ perspective: 600 }}
      whileHover={
        onClick
          ? { scale: 1.04, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }
          : undefined
      }
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {/* Foil overlay */}
      {isFoil && (
        <div className="absolute inset-0 z-10 pointer-events-none card-foil rounded-2xl opacity-60" />
      )}

      {/* Shimmer overlay for legendary */}
      {card.rarity === 'legendary' && (
        <div className="absolute inset-0 z-10 pointer-events-none card-shimmer opacity-40 rounded-2xl" />
      )}

      {showBack ? (
        /* Card Back */
        <div
          className={cn(
            'flex items-center justify-center bg-gradient-to-br from-pitch to-gray-900',
            s.image,
            'w-full',
          )}
        >
          <span className="text-4xl opacity-30">🏏</span>
        </div>
      ) : (
        <>
          {/* Card header gradient */}
          <div
            className={cn(
              'bg-gradient-to-b w-full relative',
              s.image,
              RARITY_HEADER[card.rarity],
            )}
          >
            {/* Player image or placeholder */}
            {card.image_url ? (
              <Image
                src={card.image_url}
                alt={card.name}
                fill
                className="object-cover object-top"
                sizes="(max-width: 224px) 100vw, 224px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl opacity-20">🏏</span>
              </div>
            )}

            {/* Role badge - top left */}
            <div className="absolute top-2 left-2">
              <span
                className={cn(
                  'font-display tracking-wider bg-gray-950/70 text-cream rounded-md',
                  s.badge,
                )}
              >
                {ROLE_LABELS[card.role]}
              </span>
            </div>

            {/* Foil badge - top right */}
            {isFoil && (
              <div className="absolute top-2 right-2">
                <span
                  className={cn(
                    'font-display tracking-wider bg-gold/80 text-gray-950 rounded-md',
                    s.badge,
                  )}
                >
                  FOIL
                </span>
              </div>
            )}

            {/* Rarity indicator strip */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 h-0.5',
                {
                  'bg-gray-500': card.rarity === 'common',
                  'bg-green-500': card.rarity === 'uncommon',
                  'bg-blue-500': card.rarity === 'rare',
                  'bg-gradient-to-r from-yellow-400 via-gold to-yellow-400':
                    card.rarity === 'legendary',
                },
              )}
            />
          </div>

          {/* Card body */}
          <div className={cn('bg-cream flex flex-col gap-1', s.padding)}>
            {/* Player name */}
            <h3
              className={cn(
                'font-display text-gray-900 tracking-wide leading-none',
                s.nameText,
              )}
            >
              {card.name}
            </h3>

            {/* Era + nationality */}
            <div className="flex items-center gap-1">
              <span
                className={cn('text-gray-500 font-medium leading-none', s.subText)}
              >
                {card.nationality}
              </span>
              <span className={cn('text-gray-400', s.subText)}>·</span>
              <span
                className={cn('text-gray-400 leading-none', s.subText)}
              >
                {card.era}
              </span>
            </div>

            {/* Key stats */}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {card.stats.batting_avg !== null && (
                <div className={cn('text-gray-700 leading-none', s.statText)}>
                  <span className="font-semibold">{card.stats.batting_avg}</span>
                  <span className="text-gray-400"> avg</span>
                </div>
              )}
              {card.stats.bowling_avg !== null && (
                <div className={cn('text-gray-700 leading-none', s.statText)}>
                  <span className="font-semibold">{card.stats.bowling_avg}</span>
                  <span className="text-gray-400"> bowl</span>
                </div>
              )}
              {card.stats.strike_rate !== null && (
                <div className={cn('text-gray-700 leading-none', s.statText)}>
                  <span className="font-semibold">{card.stats.strike_rate}</span>
                  <span className="text-gray-400"> SR</span>
                </div>
              )}
            </div>

            {/* Rarity badge */}
            <div className="mt-1">
              <span
                className={cn(
                  'inline-block font-bold uppercase tracking-widest rounded border',
                  s.statText,
                  'px-1.5 py-0.5',
                  RARITY_COLORS[card.rarity],
                )}
              >
                {card.rarity}
              </span>
            </div>

            {/* Special ability */}
            {card.special_ability && size !== 'sm' && (
              <p
                className={cn(
                  'text-pitch font-medium italic mt-0.5 leading-tight',
                  s.statText,
                )}
              >
                ✦ {card.special_ability}
              </p>
            )}
          </div>
        </>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-brand rounded-2xl pointer-events-none" />
      )}
    </motion.div>
  )
}
