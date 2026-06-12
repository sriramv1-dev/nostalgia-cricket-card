import Image from "next/image";
import { StatsGrid } from "./StatsGrid";

export interface StatValue {
  test: string | number;
  odi: string | number;
  t20i: string | number;
}

export interface PlayerStats {
  info: {
    number: string;
    rarity: string;
    name: string;
    country: string;
    role: string;
    image: string;
  };
  matches: StatValue;
  batting: {
    runs: StatValue;
    notOuts: StatValue;
    highScore: StatValue;
    avg: StatValue;
    halfCenturies: StatValue;
    centuries: StatValue;
    fours: StatValue;
    sixes: StatValue;
  };
  bowling: {
    wickets: StatValue;
    bestBowl: StatValue;
    avg: StatValue;
    economy: StatValue;
    fourWkts: StatValue;
    fiveWkts: StatValue;
  };
  fielding: {
    catches: StatValue;
    runOuts: StatValue;
    stumpings: StatValue;
  };
}

export interface StatCardProps {
  stats: PlayerStats;
}

export function StatCard({ stats }: StatCardProps) {
  return (
    <div className="relative flex h-[1050px] w-[750px] flex-col justify-between overflow-hidden bg-parchment">
      {/* PHOTO AREA */}
      <div className="relative h-[360px] w-full flex-none overflow-hidden">
        <Image
          src={stats.info.image}
          alt={stats.info.name}
          fill
          priority
          sizes="750px"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15)_0%,transparent_30%,transparent_55%,rgba(0,0,0,0.85)_100%)]" />
        <div className="absolute left-0 right-0 top-[18px] flex justify-between px-5">
          <div className="font-display text-[26px] font-bold text-brand-yellow [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
            #{stats.info.number}
          </div>
          <div className="rounded-2xl bg-brand-yellow px-[14px] py-1 font-body text-[17px] font-bold tracking-[0.16em] text-zinc-900">
            {stats.info.rarity}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-3 pt-[14px]">
          <div className="font-display text-[46px] font-bold leading-none tracking-[0.02em] text-brand-yellow [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
            {stats.info.name}
          </div>
          <div className="mt-1 font-body text-[17px] uppercase tracking-[0.1em] text-white/[0.88]">
            {stats.info.country} · {stats.info.role}
          </div>
        </div>
      </div>

      {/* MIDDLE ZONE — retro wash with South Africa flag spine stripes on each edge */}
      <div className="relative min-h-[5px] flex-1 overflow-hidden bg-[linear-gradient(135deg,rgba(0,122,77,0.28)_0%,rgba(255,184,28,0.22)_30%,rgba(253,248,239,0.05)_50%,rgba(222,56,49,0.2)_72%,rgba(0,0,0,0.15)_100%)] before:absolute before:bottom-[18%] before:left-[18px] before:top-[18%] before:w-2 before:rounded before:opacity-55 before:content-[''] before:bg-[linear-gradient(to_bottom,#007a4d_0%,#007a4d_33%,#ffb81c_33%,#ffb81c_66%,#de3831_66%,#de3831_100%)] after:absolute after:bottom-[18%] after:right-[18px] after:top-[18%] after:w-2 after:rounded after:opacity-55 after:content-[''] after:bg-[linear-gradient(to_bottom,#007a4d_0%,#007a4d_33%,#ffb81c_33%,#ffb81c_66%,#de3831_66%,#de3831_100%)]" />

      <StatsGrid stats={stats} theme="light" variant="card" />
    </div>
  );
}
