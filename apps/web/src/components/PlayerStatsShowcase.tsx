"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { LayeredCharacter } from "@/components/card/LayeredCharacter";
import type { LayeredCharacterSources } from "@/components/card/LayeredCharacter";
import { SHOT_SOURCES } from "@/constants/characters";
import { getCountryStyles } from "@/constants/countries";
import type { CharacterColors } from "@/types/card";
import type {
  PlayerStatsShowcaseProps,
  PlayerFormatStats,
  CricketFormat,
} from "@/types/player-stats";

// ─── Animation ────────────────────────────────────────────────────────────────

function animateWickets(
  canvas: HTMLCanvasElement,
  colors: { main: string; trail: string },
  val: string
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;
  const TOTAL = 2000;
  const startTime = performance.now();

  const stumpBaseY = H - 5;
  const stumpH = 24;
  const stumpW = 3.5;
  const stumpGap = 7;
  const stumpCX = W * 0.64;

  const stumps = [
    { x: stumpCX - stumpGap - stumpW, tx: -22, ty: -18, ta: -1.1 },
    { x: stumpCX, tx: 2, ty: -26, ta: 0.25 },
    { x: stumpCX + stumpGap + stumpW, tx: 20, ty: -15, ta: 0.95 },
  ];

  function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeInCubic(t: number) {
    return t * t * t;
  }
  function easeOutBack(t: number) {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  let rafId: number;

  function draw(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / TOTAL, 1);
    ctx.clearRect(0, 0, W, H);

    const ballP = Math.min(t / 0.38, 1);
    const impactP = t > 0.36 ? Math.min((t - 0.36) / 0.12, 1) : 0;
    const scatterP = t > 0.44 ? Math.min((t - 0.44) / 0.38, 1) : 0;
    const fadeP = t > 0.75 ? Math.min((t - 0.75) / 0.14, 1) : 0;
    const numP = t > 0.84 ? Math.min((t - 0.84) / 0.16, 1) : 0;

    const ballStartX = 3;
    const ballEndX = stumpCX - 12;
    const ballY = stumpBaseY - 5;
    const ballX = ballStartX + easeOutCubic(ballP) * (ballEndX - ballStartX);
    const ballAlpha = Math.max(0, 1 - easeInCubic(impactP));

    if (ballP > 0 && ballAlpha > 0.01) {
      for (let i = 5; i >= 0; i--) {
        const frac = i / 6;
        const tx = ballX - frac * 22 * ballP;
        ctx.beginPath();
        ctx.arc(tx, ballY, 4.5 - frac * 2, 0, Math.PI * 2);
        ctx.fillStyle = colors.trail;
        ctx.globalAlpha = (1 - frac) * 0.3 * ballAlpha;
        ctx.fill();
      }
      ctx.globalAlpha = ballAlpha;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = colors.main;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (impactP > 0 && impactP < 1) {
      ctx.beginPath();
      ctx.arc(
        stumpCX,
        stumpBaseY - 8,
        easeOutCubic(impactP) * 14,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = colors.main;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = (1 - impactP) * 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    const scatterAlpha = Math.max(0, 1 - fadeP);
    stumps.forEach((s, i) => {
      const delay = i * 0.07;
      const sp =
        scatterP > delay ? Math.min((scatterP - delay) / 0.72, 1) : 0;
      const ef = easeOutBack(sp);
      ctx.save();
      ctx.globalAlpha = scatterAlpha;
      ctx.translate(
        s.x + s.tx * ef,
        stumpBaseY - stumpH / 2 + s.ty * ef
      );
      ctx.rotate(s.ta * ef);
      ctx.fillStyle = colors.main;
      ctx.beginPath();
      ctx.roundRect(-stumpW / 2, -stumpH / 2, stumpW, stumpH, 1);
      ctx.fill();
      ctx.restore();
    });

    if (scatterP < 0.25 && scatterAlpha > 0) {
      ctx.globalAlpha =
        Math.max(0, 1 - scatterP / 0.25) * scatterAlpha;
      ctx.fillStyle = colors.main;
      const bx = stumps[0].x - stumpW / 2;
      const bw =
        stumps[2].x + stumpW - stumps[0].x + stumpW;
      ctx.beginPath();
      ctx.roundRect(bx, stumpBaseY - stumpH - 2.5, bw, 2.5, 1);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (numP > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(numP * 2, 1);
      ctx.translate(W * 0.46, H * 0.5);
      ctx.scale(easeOutBack(numP), easeOutBack(numP));
      ctx.font = "700 24px Bangers, cursive";
      ctx.fillStyle = colors.main;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(val, 0, 0);
      ctx.restore();
    }

    if (t < 1) rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_COLOR = {
  batting: "#ea580c",
  bowling: "#7c3aed",
  fielding: "#d97706",
} as const;

const FORMAT_ORDER: CricketFormat[] = ["test", "odi", "t20i"];

const FORMAT_LABEL: Record<CricketFormat, string> = {
  test: "Test",
  odi: "ODI",
  t20i: "T20I",
};

const FORMAT_COLOR_DARK: Record<CricketFormat, string> = {
  test: "#fcd34d",
  odi: "#93c5fd",
  t20i: "#f9a8d4",
};

const FORMAT_COLOR_LIGHT: Record<CricketFormat, string> = {
  test: "#92400e",
  odi: "#1e40af",
  t20i: "#9d174d",
};

// ─── Internal types ───────────────────────────────────────────────────────────

type Section = "batting" | "bowling" | "fielding";

type ActiveCell = {
  section: Section;
  rowKey: string;
  format: CricketFormat;
} | null;

type ComputedRow = {
  key: string;
  label: string;
  animated: boolean;
  values: Partial<Record<CricketFormat, string | number>>;
};

// ─── StatCell ─────────────────────────────────────────────────────────────────

interface StatCellProps {
  value: string | number;
  format: CricketFormat;
  isActive: boolean;
  animated: boolean;
  onClick: (e: React.MouseEvent) => void;
}

function StatCell({ value, format, isActive, animated, onClick }: StatCellProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || !animated || !canvasRef.current) return;
    const isDark = document.documentElement.classList.contains("dark");
    const main = isDark ? FORMAT_COLOR_DARK[format] : FORMAT_COLOR_LIGHT[format];
    return animateWickets(canvasRef.current, { main, trail: main }, String(value));
  }, [isActive, animated, format, value]);

  return (
    <button
      className={cn(
        "relative flex items-center justify-center w-full h-9 rounded-md transition-colors duration-150 select-none",
        animated && !isActive && "bg-brand-pink/5",
        !isActive && "hover:bg-neutral-100 dark:hover:bg-neutral-800"
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "font-bangers text-[17px] leading-none tracking-[0.04em]",
          format === "test" && "text-amber-800 dark:text-amber-300",
          format === "odi" && "text-blue-800 dark:text-blue-300",
          format === "t20i" && "text-pink-800 dark:text-pink-300"
        )}
      >
        {value}
      </span>

      {isActive && animated && (
        <div
          className="absolute z-30 bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden"
          style={{
            width: 88,
            height: 56,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <canvas ref={canvasRef} width={88} height={56} />
        </div>
      )}
    </button>
  );
}

// ─── StatsTable ───────────────────────────────────────────────────────────────

interface StatsTableProps {
  rows: ComputedRow[];
  formats: CricketFormat[];
  section: Section;
  activeCell: ActiveCell;
  onCellClick: (rowKey: string, format: CricketFormat, e: React.MouseEvent) => void;
}

function StatsTable({ rows, formats, section, activeCell, onCellClick }: StatsTableProps) {
  return (
    <div className="w-full">
      {/* Format header */}
      <div className="flex mb-1">
        <div className="w-28 flex-shrink-0" />
        {formats.map((fmt) => (
          <div
            key={fmt}
            className={cn(
              "font-barlow flex-1 text-center text-xs font-semibold uppercase tracking-widest pb-2",
              fmt === "test" && "text-amber-800 dark:text-amber-300",
              fmt === "odi" && "text-blue-800 dark:text-blue-300",
              fmt === "t20i" && "text-pink-800 dark:text-pink-300"
            )}
          >
            {FORMAT_LABEL[fmt]}
          </div>
        ))}
      </div>

      {/* Stat rows — skip rows where every format value is null */}
      {rows.filter((row) => formats.some((f) => row.values[f] !== "—")).map((row) => (
        <div key={row.key} className="flex items-center gap-0.5 mb-0.5">
          <div
            className="font-barlow w-28 flex-shrink-0 text-sm text-zinc-500 dark:text-zinc-400 pr-3 whitespace-nowrap"
          >
            {row.label}
          </div>
          {formats.map((fmt) => (
            <div key={fmt} className="flex-1 overflow-visible">
              <StatCell
                value={row.values[fmt] ?? "—"}
                format={fmt}
                isActive={
                  activeCell?.section === section &&
                  activeCell?.rowKey === row.key &&
                  activeCell?.format === fmt
                }
                animated={row.animated}
                onClick={(e) => onCellClick(row.key, fmt, e)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  sectionColor: string;
  imageLeft?: boolean;
  sources?: LayeredCharacterSources;
  colors?: Partial<CharacterColors>;
  children: React.ReactNode;
}

function SectionCard({
  title,
  sectionColor,
  imageLeft = true,
  sources,
  colors = {},
  children,
}: SectionCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      {/* Full-width section header */}
      <div className="px-5 py-2.5" style={{ backgroundColor: sectionColor }}>
        <h3 className="font-bangers text-2xl text-white tracking-widest leading-none">
          {title}
        </h3>
      </div>

      {sources ? (
        /* Two-column: character panel (40%) + stats (60%) */
        <div
          className={cn(
            "flex flex-col",
            imageLeft ? "md:flex-row" : "md:flex-row-reverse"
          )}
        >
          {/* Character panel — transparent, no background */}
          <div className="min-h-[200px] md:min-h-0 self-stretch md:w-2/5 relative flex-shrink-0 overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-center">
              <LayeredCharacter sources={sources} colors={colors} width={400} height={340} animate />
            </div>
          </div>
          {/* Stats */}
          <div className="flex-1 md:w-3/5 px-6 py-5 overflow-visible">{children}</div>
        </div>
      ) : (
        /* Single-column: full-width stats */
        <div className="px-6 py-5 overflow-visible">{children}</div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bv(
  data: PlayerFormatStats["batting"] | undefined,
  get: (b: NonNullable<PlayerFormatStats["batting"]>) => string | number
): string | number {
  return data != null ? get(data) : "—";
}

function bolv(
  data: PlayerFormatStats["bowling"] | undefined,
  get: (b: NonNullable<PlayerFormatStats["bowling"]>) => string | number
): string | number {
  return data != null ? get(data) : "—";
}

function fldv(
  data: PlayerFormatStats["fielding"] | undefined,
  get: (b: NonNullable<PlayerFormatStats["fielding"]>) => string | number
): string | number {
  return data != null ? get(data) : "—";
}

function rowValues(
  formats: CricketFormat[],
  get: (fmt: CricketFormat) => string | number
): Partial<Record<CricketFormat, string | number>> {
  return Object.fromEntries(formats.map((f) => [f, get(f)])) as Partial<
    Record<CricketFormat, string | number>
  >;
}

// ─── PlayerStatsShowcase ──────────────────────────────────────────────────────

export function PlayerStatsShowcase({ player, stats }: PlayerStatsShowcaseProps) {
  const [activeCell, setActiveCell] = useState<ActiveCell>(null);

  useEffect(() => {
    if (!activeCell) return;
    function handleDocClick() {
      setActiveCell(null);
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, [activeCell]);

  const presentFormats = FORMAT_ORDER.filter((fmt) =>
    stats.some((s) => s.format === fmt)
  );

  const byFormat: Partial<Record<CricketFormat, PlayerFormatStats>> = {};
  stats.forEach((s) => {
    byFormat[s.format] = s;
  });

  const battingRows: ComputedRow[] = [
    { key: "matches",  label: "Matches",  animated: false, values: rowValues(presentFormats, (f) => bv(byFormat[f]?.batting, (b) => b.matches)) },
    { key: "runs",     label: "Runs",     animated: false, values: rowValues(presentFormats, (f) => bv(byFormat[f]?.batting, (b) => b.runs)) },
    { key: "average",  label: "Average",  animated: false, values: rowValues(presentFormats, (f) => bv(byFormat[f]?.batting, (b) => b.average ?? "—")) },
    { key: "highest",  label: "Highest",  animated: false, values: rowValues(presentFormats, (f) => bv(byFormat[f]?.batting, (b) => b.highest ?? "—")) },
    { key: "not_outs", label: "Not Outs", animated: false, values: rowValues(presentFormats, (f) => bv(byFormat[f]?.batting, (b) => b.not_outs)) },
    { key: "hundreds", label: "100s",     animated: false, values: rowValues(presentFormats, (f) => bv(byFormat[f]?.batting, (b) => b.hundreds)) },
    { key: "fifties",  label: "50s",      animated: false, values: rowValues(presentFormats, (f) => bv(byFormat[f]?.batting, (b) => b.fifties)) },
    { key: "fours",    label: "4s",       animated: false, values: rowValues(presentFormats, (f) => bv(byFormat[f]?.batting, (b) => b.fours)) },
    { key: "sixes",    label: "6s",       animated: false, values: rowValues(presentFormats, (f) => bv(byFormat[f]?.batting, (b) => b.sixes)) },
  ];

  const bowlingRows: ComputedRow[] = [
    { key: "matches",      label: "Matches", animated: false, values: rowValues(presentFormats, (f) => bolv(byFormat[f]?.bowling, (b) => b.matches)) },
    { key: "wickets",      label: "Wickets", animated: true,  values: rowValues(presentFormats, (f) => bolv(byFormat[f]?.bowling, (b) => b.wickets)) },
    { key: "average",      label: "Average", animated: false, values: rowValues(presentFormats, (f) => bolv(byFormat[f]?.bowling, (b) => b.average ?? "—")) },
    { key: "economy",      label: "Economy", animated: false, values: rowValues(presentFormats, (f) => bolv(byFormat[f]?.bowling, (b) => b.economy ?? "—")) },
    { key: "best",         label: "Best",    animated: false, values: rowValues(presentFormats, (f) => bolv(byFormat[f]?.bowling, (b) => b.best ?? "—")) },
    { key: "four_wickets", label: "4W",      animated: false, values: rowValues(presentFormats, (f) => bolv(byFormat[f]?.bowling, (b) => b.four_wickets)) },
    { key: "five_wickets", label: "5W",      animated: false, values: rowValues(presentFormats, (f) => bolv(byFormat[f]?.bowling, (b) => b.five_wickets)) },
  ];

  const fieldingRows: ComputedRow[] = [
    { key: "catches",  label: "Catches",  animated: false, values: rowValues(presentFormats, (f) => fldv(byFormat[f]?.fielding, (b) => b.catches)) },
    { key: "run_outs", label: "Run Outs", animated: false, values: rowValues(presentFormats, (f) => fldv(byFormat[f]?.fielding, (b) => b.run_outs)) },
    ...(player.role === "keeper"
      ? [{ key: "stumpings", label: "Stumpings", animated: false, values: rowValues(presentFormats, (f) => fldv(byFormat[f]?.fielding, (b) => b.stumpings)) }]
      : []),
  ];

  const hasBatting = presentFormats.some((f) => byFormat[f]?.batting != null);
  const hasBowling = presentFormats.some((f) => byFormat[f]?.bowling != null);
  const hasFielding = presentFormats.some((f) => byFormat[f]?.fielding != null);

  const characterColors = getCountryStyles(player.country).character;
  const battingSources = SHOT_SOURCES.alpha;
  const bowlingSources = SHOT_SOURCES.pace;

  function handleCellClick(
    section: Section,
    rowKey: string,
    format: CricketFormat,
    e: React.MouseEvent
  ) {
    e.stopPropagation();
    setActiveCell((prev) =>
      prev?.section === section &&
      prev?.rowKey === rowKey &&
      prev?.format === format
        ? null
        : { section, rowKey, format }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {hasBatting && (
        <SectionCard
          title="Batting"
          sectionColor={SECTION_COLOR.batting}
          imageLeft
          sources={battingSources}
          colors={characterColors}
        >
          <StatsTable
            rows={battingRows}
            formats={presentFormats}
            section="batting"
            activeCell={activeCell}
            onCellClick={(rowKey, fmt, e) =>
              handleCellClick("batting", rowKey, fmt, e)
            }
          />
        </SectionCard>
      )}

      {hasBowling && (
        <SectionCard
          title="Bowling"
          sectionColor={SECTION_COLOR.bowling}
          imageLeft={false}
          sources={bowlingSources}
          colors={characterColors}
        >
          <StatsTable
            rows={bowlingRows}
            formats={presentFormats}
            section="bowling"
            activeCell={activeCell}
            onCellClick={(rowKey, fmt, e) =>
              handleCellClick("bowling", rowKey, fmt, e)
            }
          />
        </SectionCard>
      )}

      {hasFielding && (
        <SectionCard
          title="Fielding"
          sectionColor={SECTION_COLOR.fielding}
        >
          <StatsTable
            rows={fieldingRows}
            formats={presentFormats}
            section="fielding"
            activeCell={activeCell}
            onCellClick={(rowKey, fmt, e) =>
              handleCellClick("fielding", rowKey, fmt, e)
            }
          />
        </SectionCard>
      )}
    </div>
  );
}
