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
  gloves:    "left",
  bat:       "left",
  ball:      "right",
  wickets:   "right",
  pads:      "right",
  shoes:     "right",
};

const CURVE_BEND = 60;
const TABLET_CHAR_W: [number, number]  = [260, 300]; // px — md breakpoint char width range
const DESKTOP_CHAR_W: [number, number] = [340, 380]; // px — lg+ breakpoint char width range
const MIN_PANEL_COL_W = 152;  // px — min width of left/right accessory columns
const MAX_PANEL_COL_W = 220;  // px — max width so panels don't balloon

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

// ─── PoseThumbnail ────────────────────────────────────────────────────────────

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
        "flex flex-col items-center gap-1 w-full flex-shrink-0 rounded-xl p-1 lg:p-1.5 transition-colors",
        isActive
          ? "border border-zinc-400 bg-zinc-800"
          : "border border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-850"
      )}
    >
      <div className="w-full aspect-[3/4] relative overflow-hidden rounded-lg bg-zinc-950">
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
          "text-[9px] font-body tracking-widest uppercase",
          isActive ? "text-zinc-200" : "text-zinc-500"
        )}
      >
        {label}
      </span>
    </button>
  );
}

// ─── CountryThumbnail ────────────────────────────────────────────────────────

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
        "flex flex-col items-center gap-1 w-full flex-shrink-0 rounded-xl p-1 lg:p-1.5 transition-colors",
        isActive
          ? "border border-zinc-400 bg-zinc-800"
          : "border border-zinc-800 bg-zinc-900 hover:border-zinc-600"
      )}
    >
      <div
        className="w-full aspect-[3/4] rounded-lg relative overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: character.cap }}
      >
        <div
          className="absolute bottom-0 inset-x-0 h-3"
          style={{ backgroundColor: character.capAccent }}
        />
        <span className="text-2xl relative z-10 select-none">{flag}</span>
      </div>
      <span
        className={cn(
          "text-[9px] font-body tracking-widest uppercase",
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
  panelColW: number;
}

function PanelCard({
  accessoryKey,
  color,
  isActive,
  onSelect,
  onColorChange,
  onResetKey,
  entryRef,
  panelColW,
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
        "flex flex-col rounded-xl border px-2 py-1.5 lg:px-2.5 lg:py-2 cursor-pointer transition-colors flex-shrink-0",
        isActive ? "bg-zinc-800" : "bg-zinc-900 hover:bg-zinc-800/50"
      )}
      style={{ width: panelColW, borderColor: color }}
    >
      {/* Single row: name + dot + hex + reset */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-body tracking-widest uppercase truncate text-zinc-300 flex-1">
          {KEY_LABELS[accessoryKey]}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          <span style={{ color }} className="text-[13px] leading-none select-none">●</span>
          <span style={{ color }} className="text-[10px] font-mono tracking-wide">{color}</span>
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onResetKey(); }}
          className="text-zinc-500 hover:text-white text-sm transition-colors w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-700 flex-shrink-0"
          title="Reset to default"
        >
          ↺
        </button>
      </div>

      {/* Hue slider + swatch row — only when active, no animation */}
      {isActive && (
        <>
          <div
            className="relative flex items-center h-5 mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute inset-x-0 h-2 rounded-full pointer-events-none"
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
          <div className="flex gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
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
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderBottom: `5px solid ${isSelected ? "#a1a1aa" : "transparent"}`,
                  }}
                />
                <span className="block w-4 h-4 rounded-full" style={{ backgroundColor: swatch }} />
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

  // Group available keys by left/right side.
  const panelGroups = useMemo((): Record<PanelSide, Array<keyof CharacterColors>> => {
    const groups: Record<PanelSide, Array<keyof CharacterColors>> = { left: [], right: [] };
    for (const key of availableKeys) {
      const centroid = centroidData?.centroids[key];
      const side = centroid ? sideFromCentroid(centroid.x) : ANATOMICAL_SIDE[key];
      groups[side].push(key);
    }
    return groups;
  }, [availableKeys, centroidData]);

  // Refs
  const outerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const charAreaRef = useRef<HTMLDivElement>(null);
  const poseStripRef = useRef<HTMLDivElement>(null);
  const countryStripRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<Map<keyof CharacterColors, HTMLDivElement>>(new Map());

  // Dynamic grid dimensions. Strip widths are measured from the DOM (they vary
  // by breakpoint via Tailwind classes) rather than hardcoded, so this adapts
  // correctly at every viewport size.
  const [gridDims, setGridDims] = useState({
    charH: 400,
    charW: TABLET_CHAR_W[0],
    panelColW: MIN_PANEL_COL_W,
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

  // rAF ensures we read rects after the browser has committed layout for
  // this frame — reading synchronously in useLayoutEffect can catch stale
  // (zero-size) rects on first mount before images/fonts settle layout.
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(recomputeLines);
    return () => cancelAnimationFrame(raf);
  }, [recomputeLines]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(recomputeLines);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [recomputeLines]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const compute = () => {
      const availH = el.clientHeight;
      const availW = el.clientWidth;
      if (availH < 200) return;

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const minCharW = isDesktop ? DESKTOP_CHAR_W[0] : TABLET_CHAR_W[0];
      const maxCharW = isDesktop ? DESKTOP_CHAR_W[1] : TABLET_CHAR_W[1];

      const usableH = availH - 58;
      const ch = Math.max(200, usableH);

      const poseW = poseStripRef.current?.getBoundingClientRect().width ?? 0;
      const countryW = countryStripRef.current?.getBoundingClientRect().width ?? 0;
      // Fixed overhead that doesn't vary by breakpoint: 2 connectors (12px
      // each) + center column border/padding(18) + inter-column gaps(16).
      const centerFixedOverhead = 2 * 12 + 18 + 16;

      const available = Math.max(0, availW - poseW - countryW - centerFixedOverhead);
      const pcw = Math.max(MIN_PANEL_COL_W, Math.min(MAX_PANEL_COL_W, Math.floor(available * 0.22)));
      const cw  = Math.max(minCharW,        Math.min(maxCharW,        available - 2 * pcw));

      setGridDims({ charH: ch, charW: cw, panelColW: pcw });
    };
    const obs = new ResizeObserver(compute);
    obs.observe(el);
    if (poseStripRef.current) obs.observe(poseStripRef.current);
    if (countryStripRef.current) obs.observe(countryStripRef.current);
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
          panelColW={gridDims.panelColW}
        />
      );
    },
    [colors, activeKey, setActiveKey, updateColor, resetKey, setEntryRef, gridDims.panelColW]
  );

  return (
    <div ref={outerRef} className={cn("w-full h-full overflow-hidden", className)}>
    <div className="flex flex-row items-stretch justify-center h-full min-h-0 overflow-hidden">

      {/* ── Pose strip ── */}
      <div
        ref={poseStripRef}
        className="flex-shrink-0 w-12 lg:w-32 border border-zinc-800 rounded-2xl p-1.5 lg:p-2 overflow-y-auto overflow-x-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
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
      </div>

      {/* connector */}
      <div className="flex-shrink-0 self-center w-3 h-px bg-zinc-700" />

      {/* ── Center: 3-column grid + Reset All, wrapped in one border ── */}
      <div className="flex-shrink-0 self-center border border-zinc-800 rounded-2xl p-2 flex flex-col gap-2">
        <div
          ref={containerRef}
          className="relative flex flex-row items-center gap-2"
          style={{ height: gridDims.charH }}
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

          {/* ── Left panel column ── */}
          <div
            className="flex flex-col justify-between gap-3 lg:gap-4 flex-shrink-0"
            style={{ width: gridDims.panelColW }}
          >
            {panelGroups.left.map(renderEntry)}
          </div>

          {/* ── Character cell ── */}
          <div
            ref={charAreaRef}
            className="relative cursor-crosshair touch-none flex-shrink-0"
            style={{ width: gridDims.charW, height: gridDims.charH }}
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

          {/* ── Right panel column ── */}
          <div
            className="flex flex-col justify-between gap-3 lg:gap-4 flex-shrink-0"
            style={{ width: gridDims.panelColW }}
          >
            {panelGroups.right.map(renderEntry)}
          </div>
        </div>

        {/* ── Reset All — inside the center border, below the columns ── */}
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

      {/* connector */}
      <div className="flex-shrink-0 self-center w-3 h-px bg-zinc-700" />

      {/* ── Country strip ── */}
      <div
        ref={countryStripRef}
        className="flex-shrink-0 w-12 lg:w-32 border border-zinc-800 rounded-2xl p-1.5 lg:p-2 overflow-y-auto overflow-x-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
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
      </div>

    </div>{/* end inner flex row */}
    </div>
  );
}
