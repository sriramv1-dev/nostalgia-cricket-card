"use client";

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import {
  ACCESSORY_SWATCHES,
  getAvailableKeys,
  type UseAccessoryCustomizationResult,
} from "@/hooks/useAccessoryCustomization";
import { SHOT_SOURCES, type ShotType } from "@/constants/characters";
import {
  COUNTRY_NAMES,
  getCountryStyles,
  getCountryFlag,
  getCountryCode,
} from "@/constants/countries";
import type { CharacterColors } from "@/types/card";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CentroidPayload {
  imageWidth: number;
  imageHeight: number;
  centroids: Partial<Record<keyof CharacterColors, { x: number; y: number }>>;
}

type PanelSide = "left" | "right";
type PanelGroup = "top" | "bottom";

export interface CharacterCustomizerDiagramProps {
  shotType: ShotType;
  customization: UseAccessoryCustomizationResult;
  /** Called when the user picks a different pose from the thumbnail strip. */
  onShotTypeChange?: (shotType: ShotType) => void;
  className?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const KEY_LABELS: Record<keyof CharacterColors, string> = {
  cap: "Cap",
  capAccent: "Cap Accent",
  gloves: "Gloves",
  pads: "Pads",
  shoes: "Shoes",
  bat: "Bat",
  ball: "Ball",
  wickets: "Wickets",
};

// Anatomical left/right grouping — 4 per side.
const ANATOMICAL_SIDE: Record<keyof CharacterColors, PanelSide> = {
  cap:       "left",
  capAccent: "left",
  pads:      "left",
  wickets:   "left",
  gloves:    "right",
  shoes:     "right",
  bat:       "right",
  ball:      "right",
};

// Top/bottom pairing within each side column — purely a layout grouping,
// independent of centroid data.
const ANATOMICAL_GROUP: Record<keyof CharacterColors, PanelGroup> = {
  cap:       "top",
  capAccent: "top",
  gloves:    "top",
  shoes:     "top",
  pads:      "bottom",
  wickets:   "bottom",
  bat:       "bottom",
  ball:      "bottom",
};

const CURVE_BEND = 60;
const MIN_CHAR_W    = 200;  // px — never shrink character below this
const MAX_CHAR_W    = 420;  // px — caps growth on very wide screens
const MIN_CARD_W    = 84;   // px — min width of a single accessory card
const MAX_CARD_W    = 140;  // px — max width so cards don't balloon
const STRIP_W       = 54;   // px — fixed width of the shot/country strips
const PAIR_GAP       = 4;    // px — gap between the two cards in a top/bottom pair
const COL_GAP        = 8;    // px — gap between the 5 layout columns

const ALL_SHOTS: Array<{ shotType: ShotType; label: string }> = [
  { shotType: "alpha",    label: "Alpha" },
  { shotType: "loft",     label: "Loft" },
  { shotType: "scoop",    label: "Scoop" },
  { shotType: "sweep",    label: "Sweep" },
  { shotType: "uppercut", label: "Uppercut" },
  { shotType: "keeping1", label: "Keep 1" },
  { shotType: "keeping2", label: "Keep 2" },
  { shotType: "pace",     label: "Pace" },
  { shotType: "spin",     label: "Spin" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function sideFromCentroid(cx: number): PanelSide {
  return cx < 0.5 ? "left" : "right";
}

function objectContainPoint(
  nx: number,
  ny: number,
  imageWidth: number,
  imageHeight: number,
  containerW: number,
  containerH: number
): { x: number; y: number } {
  const scale = Math.min(containerW / imageWidth, containerH / imageHeight);
  const renderW = imageWidth * scale;
  const renderH = imageHeight * scale;
  return {
    x: (containerW - renderW) / 2 + nx * renderW,
    y: (containerH - renderH) / 2 + ny * renderH,
  };
}

function findSwatchIndex(color: string, swatches: string[]): number {
  const idx = swatches.findIndex(
    (s) => s.toLowerCase() === color.toLowerCase()
  );
  return idx === -1 ? 0 : idx;
}

function hexToHSL(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const hN = h / 360, sN = s / 100, lN = l / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    const tc = ((t % 1) + 1) % 1;
    if (tc < 1 / 6) return p + (q - p) * 6 * tc;
    if (tc < 1 / 2) return q;
    if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = lN;
  } else {
    const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
    const p = 2 * lN - q;
    r = hue2rgb(p, q, hN + 1 / 3);
    g = hue2rgb(p, q, hN);
    b = hue2rgb(p, q, hN - 1 / 3);
  }
  const hex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

// ─── PoseThumbnail — compact vertical-strip variant ──────────────────────────

interface PoseThumbnailProps {
  shotType: ShotType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function PoseThumbnail({ shotType, label, isActive, onClick }: PoseThumbnailProps) {
  const src = SHOT_SOURCES[shotType].base;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 flex-shrink-0 rounded-lg p-1 transition-colors w-full",
        isActive
          ? "border border-zinc-400 bg-zinc-800"
          : "border border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-850"
      )}
    >
      <div className="w-10 h-11 relative overflow-hidden rounded-md bg-zinc-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          className="absolute inset-0 w-full h-full object-contain select-none"
          draggable={false}
        />
      </div>
      <span
        className={cn(
          "text-[7px] font-body tracking-widest uppercase truncate w-full text-center",
          isActive ? "text-zinc-200" : "text-zinc-500"
        )}
      >
        {label}
      </span>
    </button>
  );
}

// ─── CountryThumbnail — compact vertical-strip variant ───────────────────────

interface CountryThumbnailProps {
  country: string;
  isActive: boolean;
  onClick: () => void;
}

function CountryThumbnail({ country, isActive, onClick }: CountryThumbnailProps) {
  const { character } = getCountryStyles(country);
  const flag = getCountryFlag(country);
  const code = getCountryCode(country);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 flex-shrink-0 rounded-lg p-1 transition-colors w-full",
        isActive
          ? "border border-zinc-400 bg-zinc-800"
          : "border border-zinc-800 bg-zinc-900 hover:border-zinc-600"
      )}
    >
      <div
        className="w-10 h-11 rounded-md relative overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: character.cap }}
      >
        <div
          className="absolute bottom-0 inset-x-0 h-2"
          style={{ backgroundColor: character.capAccent }}
        />
        <span className="text-lg relative z-10 select-none">{flag}</span>
      </div>
      <span
        className={cn(
          "text-[7px] font-body tracking-widest uppercase truncate w-full text-center",
          isActive ? "text-zinc-200" : "text-zinc-500"
        )}
      >
        {code}
      </span>
    </button>
  );
}

// ─── ConnectorLine ───────────────────────────────────────────────────────────

interface ConnectorLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  side: PanelSide;
  dotColor: string;
  isActive: boolean;
}

function ConnectorLine({ x1, y1, x2, y2, side, dotColor, isActive }: ConnectorLineProps) {
  const d = side === "left"
    ? `M ${x1} ${y1} C ${x1 - CURVE_BEND} ${y1}, ${x2 + CURVE_BEND} ${y2}, ${x2} ${y2}`
    : `M ${x1} ${y1} C ${x1 + CURVE_BEND} ${y1}, ${x2 - CURVE_BEND} ${y2}, ${x2} ${y2}`;

  return (
    <g className="transition-all duration-200">
      <path
        d={d}
        fill="none"
        stroke="#71717a"
        strokeWidth={isActive ? 1.5 : 1}
        strokeDasharray={isActive ? undefined : "4 3"}
        opacity={isActive ? 0.85 : 0.45}
      />
      <circle cx={x1} cy={y1} r={3} fill={dotColor} stroke="#27272a" strokeWidth={1} />
    </g>
  );
}

// ─── PanelCard ───────────────────────────────────────────────────────────────

interface PanelCardProps {
  accessoryKey: keyof CharacterColors;
  color: string;
  isActive: boolean;
  onSelect: () => void;
  onColorChange: (c: string) => void;
  onResetKey: () => void;
  entryRef: (el: HTMLDivElement | null) => void;
  cardW: number;
}

function PanelCard({
  accessoryKey,
  color,
  isActive,
  onSelect,
  onColorChange,
  onResetKey,
  entryRef,
  cardW,
}: PanelCardProps) {
  const swatches = ACCESSORY_SWATCHES[accessoryKey];
  const idx = findSwatchIndex(color, swatches);
  const [h, s, l] = hexToHSL(color);

  const sliderGradient = [0, 60, 120, 180, 240, 300, 360]
    .map((deg) => `hsl(${deg},${s}%,${l}%)`)
    .join(",");

  return (
    <div
      ref={entryRef}
      onClick={onSelect}
      className={cn(
        "flex flex-col rounded-xl border px-2 py-1.5 cursor-pointer transition-colors flex-shrink-0",
        isActive ? "bg-zinc-800 z-10" : "bg-zinc-900 hover:bg-zinc-800/50"
      )}
      style={{ width: cardW, borderColor: color }}
    >
      {/* Single row: name + dot + hex + reset */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-body tracking-widest uppercase truncate text-zinc-300 flex-1">
          {KEY_LABELS[accessoryKey]}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onResetKey(); }}
          className="text-zinc-500 hover:text-white text-xs transition-colors w-4 h-4 flex items-center justify-center rounded hover:bg-zinc-700 flex-shrink-0"
          title="Reset to default"
        >
          ↺
        </button>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <span style={{ color }} className="text-[11px] leading-none select-none">●</span>
        <span style={{ color }} className="text-[9px] font-mono tracking-wide truncate">{color}</span>
      </div>

      {/* Hue slider + swatch row — only when active, no animation */}
      {isActive && (
        <>
          <div
            className="relative flex items-center h-4 mt-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute inset-x-0 h-1.5 rounded-full pointer-events-none"
              style={{ background: `linear-gradient(to right,${sliderGradient})` }}
            />
            <input
              type="range"
              min={0}
              max={360}
              value={h}
              onChange={(e) => onColorChange(hslToHex(parseInt(e.target.value), s, l))}
              className="hue-slider w-full"
              style={{ color }}
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
            {swatches.map((swatch, i) => {
              const isSelected = i === idx;
              return (
                <button
                  key={swatch}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onColorChange(swatch); }}
                  className="flex flex-col items-center gap-px"
                  aria-label={swatch}
                >
                  <span
                    className="block w-0 h-0"
                    style={{
                      borderLeft: "3px solid transparent",
                      borderRight: "3px solid transparent",
                      borderBottom: `4px solid ${isSelected ? "#a1a1aa" : "transparent"}`,
                    }}
                  />
                  <span className="block w-3.5 h-3.5 rounded-full" style={{ backgroundColor: swatch }} />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function CharacterCustomizerDiagram({
  shotType,
  customization,
  onShotTypeChange,
  className,
}: CharacterCustomizerDiagramProps) {
  const { colors, updateColor, reset, resetKey, applyCountryPreset, country, activeKey, setActiveKey } =
    customization;

  const [activeShotType, setActiveShotType] = useState<ShotType>(shotType);
  useEffect(() => { setActiveShotType(shotType); }, [shotType]);

  const [activeCountry, setActiveCountry] = useState<string>(country);
  useEffect(() => { setActiveCountry(country); }, [country]);

  const availableKeys = useMemo(() => getAvailableKeys(activeShotType), [activeShotType]);

  const sources = SHOT_SOURCES[activeShotType];

  const [centroidData, setCentroidData] = useState<CentroidPayload | null>(null);
  useEffect(() => {
    setCentroidData(null);
    fetch(`/data/centroids/${activeShotType}.json`)
      .then((r) => r.json())
      .then(setCentroidData)
      .catch(() => null);
  }, [activeShotType]);

  // Group available keys by side (left/right, centroid-driven when loaded)
  // and by top/bottom pair (static layout grouping).
  const panelGroups = useMemo((): Record<PanelSide, Record<PanelGroup, Array<keyof CharacterColors>>> => {
    const groups: Record<PanelSide, Record<PanelGroup, Array<keyof CharacterColors>>> = {
      left: { top: [], bottom: [] },
      right: { top: [], bottom: [] },
    };
    for (const key of availableKeys) {
      const centroid = centroidData?.centroids[key];
      const side = centroid ? sideFromCentroid(centroid.x) : ANATOMICAL_SIDE[key];
      const group = ANATOMICAL_GROUP[key];
      groups[side][group].push(key);
    }
    return groups;
  }, [availableKeys, centroidData]);

  // Refs
  const outerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const charAreaRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<Map<keyof CharacterColors, HTMLDivElement>>(new Map());

  // Dynamic layout dimensions — computed from available space so the whole
  // diagram fills the viewport with no horizontal or vertical scroll.
  const [gridDims, setGridDims] = useState({
    charH: 380,
    charW: MIN_CHAR_W,
    cardW: MIN_CARD_W,
  });

  interface LineData {
    key: keyof CharacterColors;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    side: PanelSide;
    dotColor: string;
  }
  const [lines, setLines] = useState<LineData[]>([]);

  const recomputeLines = useCallback(() => {
    if (!containerRef.current || !charAreaRef.current || !centroidData) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const charRect = charAreaRef.current.getBoundingClientRect();
    const charOffX = charRect.left - containerRect.left;
    const charOffY = charRect.top - containerRect.top;

    const next: LineData[] = [];

    for (const key of availableKeys) {
      const centroid = centroidData.centroids[key];
      const entryEl = entryRefs.current.get(key);
      if (!centroid || !entryEl) continue;

      const charPt = objectContainPoint(
        centroid.x,
        centroid.y,
        centroidData.imageWidth,
        centroidData.imageHeight,
        charRect.width,
        charRect.height
      );

      const entryRect = entryEl.getBoundingClientRect();
      const side = sideFromCentroid(centroid.x);

      const x2 = side === "left"
        ? entryRect.right - containerRect.left
        : entryRect.left - containerRect.left;
      const y2 = entryRect.top + entryRect.height / 2 - containerRect.top;

      next.push({
        key,
        x1: charOffX + charPt.x,
        y1: charOffY + charPt.y,
        x2,
        y2,
        side,
        dotColor: (colors[key] as string | undefined) ?? "#e8257a",
      });
    }

    setLines(next);
  }, [centroidData, availableKeys, colors]);

  useLayoutEffect(() => {
    recomputeLines();
  }, [recomputeLines]);

  useEffect(() => {
    const observer = new ResizeObserver(recomputeLines);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [recomputeLines]);

  // Measure available space and derive charW / cardW / charH so everything —
  // strips, cards, character, connector SVG — stays within the viewport with
  // no overflow in either axis.
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const compute = () => {
      const availH = el.clientHeight;
      const availW = el.clientWidth;
      if (availH < 150 || availW < 150) return;

      // Height overhead: border(2) + padding(16) + gap-to-reset(8) + reset-btn(28) = 54px
      const usableH = availH - 54;
      const ch = Math.max(180, usableH);

      // Width overhead: border(2) + padding(16) + 2 strip cols(2*STRIP_W)
      //                + 4 inter-column gaps(4*COL_GAP)
      const overhead = 2 * STRIP_W + 4 * COL_GAP + 18;
      const available = Math.max(0, availW - overhead);

      // Allocate ~34% of remaining width to the character, rest split
      // between the two card columns (each holding a pair of cards).
      let cw = Math.max(MIN_CHAR_W, Math.min(MAX_CHAR_W, Math.floor(available * 0.34)));
      const sideColsW = Math.max(0, available - cw);
      let cardW = Math.max(MIN_CARD_W, Math.min(MAX_CARD_W, Math.floor((sideColsW / 2 - PAIR_GAP) / 2)));
      // Re-derive character width from the actual (clamped) card width so
      // nothing overflows if cards hit their min/max clamp.
      const actualSideColW = 2 * cardW + PAIR_GAP;
      cw = Math.max(MIN_CHAR_W, Math.min(MAX_CHAR_W, available - 2 * actualSideColW));

      setGridDims({ charH: ch, charW: cw, cardW });
    };
    const obs = new ResizeObserver(compute);
    obs.observe(el);
    compute();
    return () => obs.disconnect();
  }, []);

  // Character layers
  const coloredLayers = useMemo(() => {
    const layers: Array<{ key: keyof CharacterColors; src: string }> = [];
    if (sources.cap)        layers.push({ key: "cap",       src: sources.cap });
    if (sources.capAccent)  layers.push({ key: "capAccent", src: sources.capAccent });
    if (sources.gloves)     layers.push({ key: "gloves",    src: sources.gloves });
    if (sources.pads)       layers.push({ key: "pads",      src: sources.pads });
    if (sources.shoes)      layers.push({ key: "shoes",     src: sources.shoes });
    if (sources.bat)        layers.push({ key: "bat",       src: sources.bat });
    if (sources.batOutline) layers.push({ key: "bat",       src: sources.batOutline });
    if (sources.ball)       layers.push({ key: "ball",      src: sources.ball });
    if (sources.wickets)    layers.push({ key: "wickets",   src: sources.wickets });
    return layers;
  }, [sources]);

  const handleCharClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!centroidData) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const posX = e.clientX - rect.left;
      const posY = e.clientY - rect.top;

      const scale = Math.min(rect.width / centroidData.imageWidth, rect.height / centroidData.imageHeight);
      const renderW = centroidData.imageWidth * scale;
      const renderH = centroidData.imageHeight * scale;
      const nx = (posX - (rect.width - renderW) / 2) / renderW;
      const ny = (posY - (rect.height - renderH) / 2) / renderH;

      let closest: keyof CharacterColors | null = null;
      let minDist = Infinity;
      for (const [key, centroid] of Object.entries(centroidData.centroids)) {
        if (!centroid) continue;
        const d = Math.hypot(nx - centroid.x, ny - centroid.y);
        if (d < minDist) { minDist = d; closest = key as keyof CharacterColors; }
      }
      setActiveKey(closest);
    },
    [centroidData, setActiveKey]
  );

  const handleShotTypeSwitch = useCallback(
    (newType: ShotType) => {
      setActiveShotType(newType);
      setActiveKey(null);
      entryRefs.current.clear();
      onShotTypeChange?.(newType);
    },
    [setActiveKey, onShotTypeChange]
  );

  const setEntryRef = useCallback(
    (key: keyof CharacterColors) => (el: HTMLDivElement | null) => {
      if (el) entryRefs.current.set(key, el);
    },
    []
  );

  const renderEntry = useCallback(
    (key: keyof CharacterColors) => {
      const color = (colors[key] as string | undefined) ?? "#888888";
      return (
        <PanelCard
          key={key}
          accessoryKey={key}
          color={color}
          isActive={activeKey === key}
          onSelect={() => setActiveKey(activeKey === key ? null : key)}
          onColorChange={(c) => { updateColor(key, c); setActiveKey(key); }}
          onResetKey={() => resetKey(key)}
          entryRef={setEntryRef(key)}
          cardW={gridDims.cardW}
        />
      );
    },
    [colors, activeKey, setActiveKey, updateColor, resetKey, setEntryRef, gridDims.cardW]
  );

  return (
    <div ref={outerRef} className={cn("w-full h-full overflow-hidden", className)}>
    <div className="flex flex-col items-center justify-center h-full overflow-hidden">

      {/* ── Main row: leftCards | shotStrip | character | countryStrip | rightCards ── */}
      <div className="flex-shrink-0 border border-zinc-800 rounded-2xl p-2 flex flex-col gap-2 overflow-hidden">
        <div
          ref={containerRef}
          className="relative flex flex-row overflow-hidden"
          style={{ height: gridDims.charH, gap: COL_GAP }}
        >
          {/* ── SVG connector overlay ── */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: "100%", height: "100%", overflow: "visible" }}
            aria-hidden
          >
            {lines.map(({ key, x1, y1, x2, y2, side, dotColor }) => (
              <ConnectorLine
                key={key}
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                side={side}
                dotColor={dotColor}
                isActive={activeKey === key}
              />
            ))}
          </svg>

          {/* ── Left cards column: top pair + bottom pair ── */}
          <div
            className="flex flex-col justify-between flex-shrink-0"
            style={{ width: 2 * gridDims.cardW + PAIR_GAP }}
          >
            <div className="flex" style={{ gap: PAIR_GAP }}>
              {panelGroups.left.top.map(renderEntry)}
            </div>
            <div className="flex" style={{ gap: PAIR_GAP }}>
              {panelGroups.left.bottom.map(renderEntry)}
            </div>
          </div>

          {/* ── Shot type strip — vertical, scrollable ── */}
          <div
            className="flex-shrink-0 flex flex-col gap-1 overflow-y-auto overflow-x-hidden"
            style={{ width: STRIP_W, height: gridDims.charH }}
          >
            {ALL_SHOTS.map(({ shotType: st, label }) => (
              <PoseThumbnail
                key={st}
                shotType={st}
                label={label}
                isActive={activeShotType === st}
                onClick={() => handleShotTypeSwitch(st)}
              />
            ))}
          </div>

          {/* ── Character cell ── */}
          <div
            ref={charAreaRef}
            className="relative cursor-crosshair touch-none flex-shrink-0"
            style={{ width: gridDims.charW, height: gridDims.charH, minWidth: MIN_CHAR_W }}
            onClick={handleCharClick}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sources.base}
              alt="Character base"
              className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
              draggable={false}
            />
            {coloredLayers.map(({ key, src }) => {
              const color = colors[key];
              return (
                <div
                  key={src}
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{ isolation: "isolate" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain select-none"
                    draggable={false}
                  />
                  {color && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: color,
                        mixBlendMode: "hue",
                        WebkitMaskImage: `url(${src})`,
                        maskImage: `url(${src})`,
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                        opacity: 0.9,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Country strip — vertical, scrollable ── */}
          <div
            className="flex-shrink-0 flex flex-col gap-1 overflow-y-auto overflow-x-hidden"
            style={{ width: STRIP_W, height: gridDims.charH }}
          >
            {COUNTRY_NAMES.map((c) => (
              <CountryThumbnail
                key={c}
                country={c}
                isActive={activeCountry === c}
                onClick={() => {
                  setActiveCountry(c);
                  applyCountryPreset(c);
                }}
              />
            ))}
          </div>

          {/* ── Right cards column: top pair + bottom pair ── */}
          <div
            className="flex flex-col justify-between flex-shrink-0"
            style={{ width: 2 * gridDims.cardW + PAIR_GAP }}
          >
            <div className="flex" style={{ gap: PAIR_GAP }}>
              {panelGroups.right.top.map(renderEntry)}
            </div>
            <div className="flex" style={{ gap: PAIR_GAP }}>
              {panelGroups.right.bottom.map(renderEntry)}
            </div>
          </div>
        </div>

        {/* ── Reset All — centered below the character, above bottom cards row ── */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-zinc-700 bg-zinc-900/60 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-body tracking-widest uppercase px-8 py-1.5 transition-colors"
          >
            reset all
          </button>
        </div>
      </div>

    </div>
    </div>
  );
}
