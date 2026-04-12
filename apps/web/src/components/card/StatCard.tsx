import Image from 'next/image'
import styles from './StatCard.module.css'

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

      {/* STATS AREA */}
      <div className={styles.statsArea}>
        {/* FORMAT HEADER */}
        <div className={styles.fmtRow}>
          <div className={styles.fmtEmpty}></div>
          <div className={`${styles.fmtBubble} ${styles.fmtBubbleTest}`}>
            <span className={styles.fmtName}>TEST</span>
            <span className={styles.fmtCount}>{stats.matches.test}</span>
          </div>
          <div className={`${styles.fmtBubble} ${styles.fmtBubbleOdi}`}>
            <span className={styles.fmtName}>ODI</span>
            <span className={styles.fmtCount}>{stats.matches.odi}</span>
          </div>
          <div className={`${styles.fmtBubble} ${styles.fmtBubbleT20}`}>
            <span className={styles.fmtName}>T20I</span>
            <span className={styles.fmtCount}>{stats.matches.t20i}</span>
          </div>
        </div>

        {/* BATTING */}
        <div className={`${styles.section} ${styles.secBat}`}>
          <StatRow label="Runs" values={stats.batting.runs} labelClass={styles.batLbl} />
          <StatRow label="Not Outs" values={stats.batting.notOuts} labelClass={styles.batLbl} />
          <StatRow label="High Score" values={stats.batting.highScore} labelClass={styles.batLbl} />
          <StatRow label="Bat. Avg" values={stats.batting.avg} labelClass={styles.batLbl} />
          
          {/* 50s / 100s */}
          <div className={styles.splitRow}>
            <div className={styles.splitLabel}>
              <div className={styles.splitLblL}>50s</div>
              <div className={styles.splitLblR}>100s</div>
            </div>
            <SplitPill val1={stats.batting.halfCenturies.test} val2={stats.batting.centuries.test} mode="test" />
            <SplitPill val1={stats.batting.halfCenturies.odi} val2={stats.batting.centuries.odi} mode="odi" />
            <SplitPill val1={stats.batting.halfCenturies.t20i} val2={stats.batting.centuries.t20i} mode="t20i" />
          </div>

          {/* 4s / 6s */}
          <div className={styles.splitRow}>
            <div className={styles.splitLabel}>
              <div className={styles.splitLblL}>4s</div>
              <div className={styles.splitLblR}>6s</div>
            </div>
            <SplitPill val1={stats.batting.fours.test} val2={stats.batting.sixes.test} mode="test" />
            <SplitPill val1={stats.batting.fours.odi} val2={stats.batting.sixes.odi} mode="odi" />
            <SplitPill val1={stats.batting.fours.t20i} val2={stats.batting.sixes.t20i} mode="t20i" />
          </div>
        </div>

        {/* BOWLING */}
        <div className={`${styles.section} ${styles.secBwl}`}>
          <StatRow label="Wickets" values={stats.bowling.wickets} labelClass={styles.bwlLbl} />
          <StatRow label="Best Bowl" values={stats.bowling.bestBowl} labelClass={styles.bwlLbl} />
          <StatRow label="Bowl Avg" values={stats.bowling.avg} labelClass={styles.bwlLbl} />
          <StatRow label="Economy" values={stats.bowling.economy} labelClass={styles.bwlLbl} />
          
          {/* 4W / 5W */}
          <div className={styles.splitRow}>
            <div className={styles.splitLabel}>
              <div className={styles.splitLblBwlL}>4W</div>
              <div className={styles.splitLblBwlR}>5W</div>
            </div>
            <SplitPill val1={stats.bowling.fourWkts.test} val2={stats.bowling.fiveWkts.test} mode="test" />
            <SplitPill val1={stats.bowling.fourWkts.odi} val2={stats.bowling.fiveWkts.odi} mode="odi" />
            <SplitPill val1={stats.bowling.fourWkts.t20i} val2={stats.bowling.fiveWkts.t20i} mode="t20i" />
          </div>
        </div>

        {/* FIELDING */}
        <div className={`${styles.section} ${styles.secFld}`}>
          <StatRow label="Catches" values={stats.fielding.catches} labelClass={styles.fldLbl} />
          <StatRow label="Run Outs" values={stats.fielding.runOuts} labelClass={styles.fldLbl} />
          <StatRow label="Stumpings" values={stats.fielding.stumpings} labelClass={styles.fldLbl} />
        </div>

      </div>
    </div>
  )
}

// Helper: Standard Stat Row (Label + 3 bubbles)
const StatRow = ({ label, values, labelClass }: { label: string, values: StatValue, labelClass: string }) => (
  <div className={styles.statRow}>
    <div className={`${styles.statLabel} ${labelClass}`}>{label}</div>
    <div className={`${styles.bubble} ${styles.tv}`}>{values.test}</div>
    <div className={`${styles.bubble} ${styles.ov}`}>{values.odi}</div>
    <div className={`${styles.bubble} ${styles.pv}`}>{values.t20i}</div>
  </div>
)

// Helper: Split Pill (Single background, two values)
const SplitPill = ({ val1, val2, mode }: { val1: string | number, val2: string | number, mode: keyof StatValue }) => {
  const colorClass = mode === 'test' ? styles.tv : mode === 'odi' ? styles.ov : styles.pv;
  return (
    <div className={styles.splitPill}>
      <div className={`${styles.splitHalf} ${colorClass}`}>{val1}</div>
      <div className={`${styles.splitHalf} ${colorClass}`}>{val2}</div>
    </div>
  )
}
