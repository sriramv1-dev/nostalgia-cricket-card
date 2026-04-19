import type { PlayerStats, StatValue } from "./StatCard";

export interface StatsGridProps {
  stats: PlayerStats;
  theme: "light" | "dark";
  variant?: "card" | "page";
}

const tokens = {
  light: {
    bg: "bg-[#fdf8ef]",
    fmtTestBg: "bg-[#166534]",
    fmtTestName: "bg-[#dcfce7] text-[#166534]",
    fmtTestCount: "text-[#dcfce7]",
    fmtOdiBg: "bg-[#1d4ed8]",
    fmtOdiName: "bg-[#eff6ff] text-[#1d4ed8]",
    fmtOdiCount: "text-[#eff6ff]",
    fmtT20Bg: "bg-[#be185d]",
    fmtT20Name: "bg-[#fdf2f8] text-[#be185d]",
    fmtT20Count: "text-[#fdf2f8]",
    secBat: "bg-[#fed7aa]",
    secBwl: "bg-[#ddd6fe]",
    secFld: "bg-[#fde68a]",
    labelBat: "text-[#c2410c] border-l-4 border-[#ea580c] bg-[#fdf8efcc]",
    labelBwl: "text-[#6d28d9] border-l-4 border-[#7c3aed] bg-[#fdf8efcc]",
    labelFld: "text-[#92400e] border-l-4 border-[#d97706] bg-[#fdf8efcc]",
    splitLabelBat: "text-[#c2410c] bg-[#fdf8ef8c]",
    splitLabelBwl: "text-[#6d28d9] bg-[#fdf8ef8c]",
    bubble: "bg-[#fdf8ef]",
    tvColor: "text-[#78350f]",
    ovColor: "text-[#1e40af]",
    pvColor: "text-[#9d174d]",
  },
  dark: {
    bg: "bg-zinc-900",
    fmtTestBg: "bg-[#14532d]",
    fmtTestName: "bg-[#166534] text-[#bbf7d0]",
    fmtTestCount: "text-[#bbf7d0]",
    fmtOdiBg: "bg-[#1e3a8a]",
    fmtOdiName: "bg-[#1d4ed8] text-[#bfdbfe]",
    fmtOdiCount: "text-[#bfdbfe]",
    fmtT20Bg: "bg-[#831843]",
    fmtT20Name: "bg-[#be185d] text-[#fce7f3]",
    fmtT20Count: "text-[#fce7f3]",
    secBat: "bg-[#431407]",
    secBwl: "bg-[#2e1065]",
    secFld: "bg-[#422006]",
    labelBat: "text-[#fb923c] border-l-4 border-[#ea580c] bg-zinc-800",
    labelBwl: "text-[#a78bfa] border-l-4 border-[#7c3aed] bg-zinc-800",
    labelFld: "text-[#fbbf24] border-l-4 border-[#d97706] bg-zinc-800",
    splitLabelBat: "text-[#fb923c] bg-zinc-800",
    splitLabelBwl: "text-[#a78bfa] bg-zinc-800",
    bubble: "bg-zinc-800",
    tvColor: "text-[#86efac]",
    ovColor: "text-[#93c5fd]",
    pvColor: "text-[#f9a8d4]",
  },
};

const variantTokens = {
  card: {
    font: "font-roboto-mono",
    szLabel: "text-[21px]",
    szValue: "text-[22px]",
    szSplit: "text-[20px]",
    szHeader: "text-[22px]",
  },
  page: {
    font: "font-inconsolata",
    szLabel: "text-[17px]",
    szValue: "text-[17px]",
    szSplit: "text-[16px]",
    szHeader: "text-[17px]",
  },
};

type Tokens = typeof tokens.light;
type VTokens = typeof variantTokens.card;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StatRow = ({
  label,
  values,
  labelClass,
  t,
  v,
}: {
  label: string;
  values: StatValue;
  labelClass: string;
  t: Tokens;
  v: VTokens;
}) => (
  <div className="flex items-stretch gap-[3px]">
    <div
      className={`w-[168px] shrink-0 flex items-center pr-[8px] pl-[10px] ${v.font} ${v.szLabel} font-semibold whitespace-nowrap overflow-hidden rounded-[12px] ${labelClass}`}
    >
      {label}
    </div>
    <div
      className={`flex-1 flex items-center justify-center rounded-[10px] ${v.font} font-bold ${v.szValue} py-1 px-[2px] whitespace-nowrap ${t.bubble} ${t.tvColor}`}
    >
      {values.test}
    </div>
    <div
      className={`flex-1 flex items-center justify-center rounded-[10px] ${v.font} font-bold ${v.szValue} py-1 px-[2px] whitespace-nowrap ${t.bubble} ${t.ovColor}`}
    >
      {values.odi}
    </div>
    <div
      className={`flex-1 flex items-center justify-center rounded-[10px] ${v.font} font-bold ${v.szValue} py-1 px-[2px] whitespace-nowrap ${t.bubble} ${t.pvColor}`}
    >
      {values.t20i}
    </div>
  </div>
);

const SplitPill = ({
  val1,
  val2,
  bubbleClass,
  colorClass,
  v,
}: {
  val1: string | number;
  val2: string | number;
  bubbleClass: string;
  colorClass: string;
  v: VTokens;
}) => (
  <div className="flex-1 flex items-stretch rounded-[10px] overflow-hidden gap-[2px]">
    <div
      className={`flex-1 flex items-center justify-center ${v.font} font-bold ${v.szSplit} py-1 px-[2px] whitespace-nowrap rounded-l-[10px] ${bubbleClass} ${colorClass}`}
    >
      {val1}
    </div>
    <div
      className={`flex-1 flex items-center justify-center ${v.font} font-bold ${v.szSplit} py-1 px-[2px] whitespace-nowrap rounded-r-[10px] ${bubbleClass} ${colorClass}`}
    >
      {val2}
    </div>
  </div>
);

interface SplitRowProps {
  lbl1: string;
  lbl2: string;
  splitLabelClass: string;
  borderClass: string;
  val1Test: string | number;
  val2Test: string | number;
  val1Odi: string | number;
  val2Odi: string | number;
  val1T20: string | number;
  val2T20: string | number;
  t: Tokens;
  v: VTokens;
}

const SplitRow = ({
  lbl1,
  lbl2,
  splitLabelClass,
  borderClass,
  val1Test,
  val2Test,
  val1Odi,
  val2Odi,
  val1T20,
  val2T20,
  t,
  v,
}: SplitRowProps) => (
  <div className="flex items-stretch gap-[3px]">
    <div className="w-[168px] shrink-0 flex items-stretch rounded-[12px] overflow-hidden gap-[2px]">
      <div
        className={`flex-1 flex items-center pl-[10px] pr-1 ${v.font} ${v.szLabel} font-semibold whitespace-nowrap rounded-l-[12px] border-l-4 ${borderClass} ${splitLabelClass}`}
      >
        {lbl1}
      </div>
      <div
        className={`flex-1 flex items-center px-1 ${v.font} ${v.szLabel} font-semibold whitespace-nowrap ${splitLabelClass}`}
      >
        {lbl2}
      </div>
    </div>
    <SplitPill
      val1={val1Test}
      val2={val2Test}
      bubbleClass={t.bubble}
      colorClass={t.tvColor}
      v={v}
    />
    <SplitPill
      val1={val1Odi}
      val2={val2Odi}
      bubbleClass={t.bubble}
      colorClass={t.ovColor}
      v={v}
    />
    <SplitPill
      val1={val1T20}
      val2={val2T20}
      bubbleClass={t.bubble}
      colorClass={t.pvColor}
      v={v}
    />
  </div>
);

// ─── StatsGrid ────────────────────────────────────────────────────────────────

export const StatsGrid = ({ stats, theme, variant = "page" }: StatsGridProps) => {
  const t = tokens[theme];
  const v = variantTokens[variant];

  return (
    <div
      className={`flex-none flex flex-col gap-[2.5px] pb-[15px] pr-[15px] pl-[10px] ${t.bg}`}
    >
      {/* FORMAT HEADER */}
      <div className="flex gap-[3px] mb-[2px]">
        <div className="w-[168px] shrink-0" />
        <div
          className={`flex-1 flex items-stretch gap-[2px] rounded-[10px] overflow-hidden ${t.fmtTestBg}`}
        >
          <div
            className={`flex-1 flex items-center justify-center ${v.font} ${v.szHeader} font-bold py-[5px] ${t.fmtTestName}`}
          >
            Test
          </div>
          <div
            className={`flex-1 flex items-center justify-center ${v.font} ${v.szHeader} font-bold py-[5px] ${t.fmtTestCount}`}
          >
            {stats.matches.test}
          </div>
        </div>
        <div
          className={`flex-1 flex items-stretch gap-[2px] rounded-[10px] overflow-hidden ${t.fmtOdiBg}`}
        >
          <div
            className={`flex-1 flex items-center justify-center ${v.font} ${v.szHeader} font-bold py-[5px] ${t.fmtOdiName}`}
          >
            ODI
          </div>
          <div
            className={`flex-1 flex items-center justify-center ${v.font} ${v.szHeader} font-bold py-[5px] ${t.fmtOdiCount}`}
          >
            {stats.matches.odi}
          </div>
        </div>
        <div
          className={`flex-1 flex items-stretch gap-[2px] rounded-[10px] overflow-hidden ${t.fmtT20Bg}`}
        >
          <div
            className={`flex-1 flex items-center justify-center ${v.font} ${v.szHeader} font-bold py-[5px] ${t.fmtT20Name}`}
          >
            T20I
          </div>
          <div
            className={`flex-1 flex items-center justify-center ${v.font} ${v.szHeader} font-bold py-[5px] ${t.fmtT20Count}`}
          >
            {stats.matches.t20i}
          </div>
        </div>
      </div>

      {/* BATTING */}
      <div
        className={`rounded-[10px] p-[2.5px] flex flex-col gap-[1.5px] ${t.secBat}`}
      >
        <StatRow label="Runs" values={stats.batting.runs} labelClass={t.labelBat} t={t} v={v} />
        <StatRow label="Not Outs" values={stats.batting.notOuts} labelClass={t.labelBat} t={t} v={v} />
        <StatRow label="High Score" values={stats.batting.highScore} labelClass={t.labelBat} t={t} v={v} />
        <StatRow label="Bat. Avg" values={stats.batting.avg} labelClass={t.labelBat} t={t} v={v} />
        <SplitRow
          lbl1="50s" lbl2="100s"
          splitLabelClass={t.splitLabelBat}
          borderClass="border-[#ea580c]"
          val1Test={stats.batting.halfCenturies.test} val2Test={stats.batting.centuries.test}
          val1Odi={stats.batting.halfCenturies.odi} val2Odi={stats.batting.centuries.odi}
          val1T20={stats.batting.halfCenturies.t20i} val2T20={stats.batting.centuries.t20i}
          t={t} v={v}
        />
        <SplitRow
          lbl1="4s" lbl2="6s"
          splitLabelClass={t.splitLabelBat}
          borderClass="border-[#ea580c]"
          val1Test={stats.batting.fours.test} val2Test={stats.batting.sixes.test}
          val1Odi={stats.batting.fours.odi} val2Odi={stats.batting.sixes.odi}
          val1T20={stats.batting.fours.t20i} val2T20={stats.batting.sixes.t20i}
          t={t} v={v}
        />
      </div>

      {/* BOWLING */}
      <div
        className={`rounded-[10px] p-[2.5px] flex flex-col gap-[1.5px] ${t.secBwl}`}
      >
        <StatRow label="Wickets" values={stats.bowling.wickets} labelClass={t.labelBwl} t={t} v={v} />
        <StatRow label="Best Bowl" values={stats.bowling.bestBowl} labelClass={t.labelBwl} t={t} v={v} />
        <StatRow label="Bowl Avg" values={stats.bowling.avg} labelClass={t.labelBwl} t={t} v={v} />
        <StatRow label="Economy" values={stats.bowling.economy} labelClass={t.labelBwl} t={t} v={v} />
        <SplitRow
          lbl1="4W" lbl2="5W"
          splitLabelClass={t.splitLabelBwl}
          borderClass="border-[#7c3aed]"
          val1Test={stats.bowling.fourWkts.test} val2Test={stats.bowling.fiveWkts.test}
          val1Odi={stats.bowling.fourWkts.odi} val2Odi={stats.bowling.fiveWkts.odi}
          val1T20={stats.bowling.fourWkts.t20i} val2T20={stats.bowling.fiveWkts.t20i}
          t={t} v={v}
        />
      </div>

      {/* FIELDING */}
      <div
        className={`rounded-[10px] p-[2.5px] flex flex-col gap-[1.5px] ${t.secFld}`}
      >
        <StatRow label="Catches" values={stats.fielding.catches} labelClass={t.labelFld} t={t} v={v} />
        <StatRow label="Run Outs" values={stats.fielding.runOuts} labelClass={t.labelFld} t={t} v={v} />
        <StatRow label="Stumpings" values={stats.fielding.stumpings} labelClass={t.labelFld} t={t} v={v} />
      </div>
    </div>
  );
};
