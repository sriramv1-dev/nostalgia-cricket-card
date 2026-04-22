import Image from 'next/image'
import type { PlayerRow } from '@/types/database.types'

interface RoleConfig {
  dir: string
  prefix: string
  parts: string[]
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  bowler: {
    dir: '/images/card/pace-masks',
    prefix: 'pace',
    parts: ['body', 'ball', 'cap', 'cap-accent', 'shoes']
  },
  keeper: {
    dir: '/images/card/keeping1',
    prefix: 'keeping1',
    parts: ['body-base', 'ball', 'cap', 'cap-accent', 'gloves', 'pads', 'shoes', 'wickets']
  },
  allrounder: {
    dir: '/images/card/uppercut-shot',
    prefix: 'uppercut',
    parts: ['body', 'bat', 'cap', 'cap-accent', 'gloves', 'pads', 'shoes']
  },
  batter: {
    dir: '/images/card/alpha-shot',
    prefix: 'alpha',
    parts: ['body', 'bat', 'cap', 'cap-accent', 'gloves', 'pads', 'shoes']
  }
}

function getPlayerImageScale(role: string): string {
  switch (role) {
    case 'keeper':
      return 'scale-[1.5]'
    case 'batter':
      return 'scale-[1.5]'
    case 'allrounder':
      return 'scale-[1.5]'
    case 'bowler':
    default:
      return 'scale-[1.0]'
  }
}

interface PlayerActionImageProps {
  player: PlayerRow
}

export function PlayerActionImage({ player }: PlayerActionImageProps) {
  const config = ROLE_CONFIGS[player.role] || ROLE_CONFIGS.batter

  return (
    <div className="relative flex-1 w-full my-2 px-4">
      <div className={`relative w-full h-full transition-transform ${getPlayerImageScale(player.role)}`}>
        {config.parts.map((part) => (
          <Image
            key={part}
            src={`${config.dir}/${config.prefix}-${part}.png`}
            alt={`${player.name} ${part}`}
            fill
            className="object-contain drop-shadow-2xl absolute inset-0"
            unoptimized
          />
        ))}
      </div>
    </div>
  )
}
