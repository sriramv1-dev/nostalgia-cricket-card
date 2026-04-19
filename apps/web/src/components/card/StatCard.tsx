import Image from 'next/image'
import styles from './StatCard.module.css'
import { StatsGrid } from './StatsGrid'

export interface StatValue {
  test: string | number
  odi: string | number
  t20i: string | number
}

export interface PlayerStats {
  info: {
    number: string
    rarity: string
    name: string
    country: string
    role: string
    image: string
  }
  matches: StatValue
  batting: {
    runs: StatValue
    notOuts: StatValue
    highScore: StatValue
    avg: StatValue
    halfCenturies: StatValue
    centuries: StatValue
    fours: StatValue
    sixes: StatValue
  }
  bowling: {
    wickets: StatValue
    bestBowl: StatValue
    avg: StatValue
    economy: StatValue
    fourWkts: StatValue
    fiveWkts: StatValue
  }
  fielding: {
    catches: StatValue
    runOuts: StatValue
    stumpings: StatValue
  }
}

export default function StatCard({ stats }: { stats: PlayerStats }) {
  return (
    <div className={styles.statCard}>
      {/* PHOTO AREA */}
      <div className={styles.photoArea}>
        <Image 
          src={stats.info.image} 
          alt={stats.info.name} 
          fill
          priority
          sizes="750px"
        />
        <div className={styles.photoGradient}></div>
        <div className={styles.cardBadges}>
          <div className={styles.cardNumber}>#{stats.info.number}</div>
          <div className={styles.rarityBadge}>{stats.info.rarity}</div>
        </div>
        <div className={styles.playerIdentity}>
          <div className={styles.playerName}>{stats.info.name}</div>
          <div className={styles.playerMeta}>
            {stats.info.country} · {stats.info.role}
          </div>
        </div>
      </div>

      {/* MIDDLE ZONE */}
      <div className={styles.middleZone}></div>

      <StatsGrid stats={stats} theme="light" variant="card" />
    </div>
  )
}
