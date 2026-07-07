"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  FORMAT_LABELS,
  FORMAT_COLORS_DARK,
  FORMAT_COLORS_LIGHT,
} from "@/constants/theme";
import type { CricketFormat } from "@/types/player-stats";

const FORMAT_TEXT_CLASSES: Record<CricketFormat, string> = {
  test: "text-amber-800 dark:text-amber-300",
  odi: "text-blue-800 dark:text-blue-300",
  t20i: "text-pink-800 dark:text-pink-300",
};

// ─── Shared row/cell types ────────────────────────────────────────────────────

export type StatSection = "batting" | "bowling" | "fielding";

export type ActiveStatCell = {
  section: StatSection;
  rowKey: string;
  format: CricketFormat;
} | null;

export type ComputedStatRow = {
  key: string;
  label: string;
  animated: boolean;
  values: Partial<Record<CricketFormat, string | number>>;
};

// ─── Animation ────────────────────────────────────────────────────────────────

function animateWickets(
  canvas: HTMLCanvasElement,
  colors: { main: string; trail: string },
  val: string
) {
  // Non-null safe: "2d" context is always available on an HTMLCanvasElement
  // unless the same canvas was already locked to a different context type.
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
    const main = isDark ? FORMAT_COLORS_DARK[format] : FORMAT_COLORS_LIGHT[format];
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
          FORMAT_TEXT_CLASSES[format]
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

export interface StatsTableProps {
  rows: ComputedStatRow[];
  formats: CricketFormat[];
  section: StatSection;
  activeCell: ActiveStatCell;
  onCellClick: (rowKey: string, format: CricketFormat, e: React.MouseEvent) => void;
}

export function StatsTable({ rows, formats, section, activeCell, onCellClick }: StatsTableProps) {
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
              FORMAT_TEXT_CLASSES[fmt]
            )}
          >
            {FORMAT_LABELS[fmt]}
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
