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

type PanelSide = "top" | "left" | "right" | "bottom";

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

// Fallback anatomical grouping used before centroid data loads.
const ANATOMICAL_SIDE: Record<keyof CharacterColors, PanelSide> = {
  cap:       "top",
  capAccent: "top",
  gloves:    "left",
  bat:       "left",
  ball:      "right",
  wickets:   "right",
  pads:      "bottom",
  shoes:     "bottom",
};

const CURVE_BEND = 60;
const MIN_CHAR_W     = 320;   // px — never shrink the character below this
const MAX_CHAR_W     = 540;   // px — caps growth on very wide screens
const MIN_PANEL_COL_W = 152;  // px — min width of left/right accessory columns
const MAX_PANEL_COL_W = 220;  // px — max width, so panels don't balloon

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

function sideFromCentroid(cx: number, cy: number): PanelSide {
  if (cy < 0.35) return "top";
  if (cy > 0.65) return "bottom";
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
        "flex flex-col items-center gap-1 flex-shrink-0 rounded-xl p-1.5 transition-colors",
        isActive
          ? "border border-zinc-400 bg-zinc-800"
          : "border border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-850"
      )}
    >
      <div className="w-12 h-[66px] relative overflow-hidden rounded-lg bg-zinc-950">
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
        "flex flex-col items-center gap-1 flex-shrink-0 rounded-xl p-1.5 transition-colors",
        isActive
          ? "border border-zinc-400 bg-zinc-800"
          : "border border-zinc-800 bg-zinc-900 hover:border-zinc-600"
      )}
    >
      <div
        className="w-12 h-[66px] rounded-lg relative overflow-hidden flex items-center justify-center"
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
  let d: string;
  switch (side) {
    case "left":
      d = `M ${x1} ${y1} C ${x1 - CURVE_BEND} ${y1}, ${x2 + CURVE_BEND} ${y2}, ${x2} ${y2}`;
      break;
    case "right":
      d = `M ${x1} ${y1} C ${x1 + CURVE_BEND} ${y1}, ${x2 - CURVE_BEND} ${y2}, ${x2} ${y2}`;
      break;
    case "top":
      d = `M ${x1} ${y1} C ${x1} ${y1 - CURVE_BEND}, ${x2} ${y2 + CURVE_BEND}, ${x2} ${y2}`;
      break;
    case "bottom":
      d = `M ${x1} ${y1} C ${x1} ${y1 + CURVE_BEND}, ${x2} ${y2 - CURVE_BEND}, ${x2} ${y2}`;
      break;
  }
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

// ─── PanelCard — uniform vertical layout for every accessory ─────────────────

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
        "flex flex-col gap-1.5 rounded-xl border p-2.5 cursor-pointer transition-colors flex-shrink-0",
        isActive ? "bg-zinc-800" : "bg-zinc-900 hover:bg-zinc-800/50"
      )}
      style={{ width: panelColW, borderColor: color }}
    >
      {/* Row 1: name (in accessory color) + reset */}
      <div className="flex items-center justify-between gap-1">
        <span
          className="text-xs font-body tracking-widest uppercase truncate font-semibold"
          style={{ color }}
        >
          {KEY_LABELS[accessoryKey]}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onResetKey(); }}
          className="text-zinc-500 hover:text-white text-sm transition-colors w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-700 flex-shrink-0"
          title="Reset to default"
        >
          ↺
        </button>
      </div>

      {/* Row 2: hex code — always visible */}
      <span className="text-[11px] font-mono text-zinc-400 tracking-wide">{color}</span>

      {/* Rows 3+4: hue slider + swatches — only when active */}
      {isActive && (
        <>
          {/* Hue slider — gradient div provides the track; input provides the draggable thumb */}
          <div
            className="relative flex items-center h-5 mt-0.5"
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

          {/* Swatch row */}
          <div className="flex flex-wrap gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
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
                      borderTop: `5px solid ${isSelected ? "#a1a1aa" : "transparent"}`,
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

  // Internal shot type state — the pose strip drives this; prop changes sync it.
  const [activeShotType, setActiveShotType] = useState<ShotType>(shotType);
  useEffect(() => { setActiveShotType(shotType); }, [shotType]);

  // Active country — tracks which country template was last applied.
  const [activeCountry, setActiveCountry] = useState<string>(country);
  useEffect(() => { setActiveCountry(country); }, [country]);

  // Available accessory keys for the currently displayed pose.
  const availableKeys = useMemo(() => getAvailableKeys(activeShotType), [activeShotType]);

  const sources = SHOT_SOURCES[activeShotType];

  // Centroid payload — reload whenever the active pose changes.
  const [centroidData, setCentroidData] = useState<CentroidPayload | null>(null);
  useEffect(() => {
    setCentroidData(null);
    fetch(`/data/centroids/${activeShotType}.json`)
      .then((r) => r.json())
      .then(setCentroidData)
      .catch(() => null);
  }, [activeShotType]);

  // Group available keys by side — derived from centroids when loaded, anatomical fallback otherwise.
  const panelGroups = useMemo((): Record<PanelSide, Array<keyof CharacterColors>> => {
    const groups: Record<PanelSide, Array<keyof CharacterColors>> = {
      top: [], left: [], right: [], bottom: [],
    };
    for (const key of availableKeys) {
      const centroid = centroidData?.centroids[key];
      const side = centroid
        ? sideFromCentroid(centroid.x, centroid.y)
        : ANATOMICAL_SIDE[key];
      groups[side].push(key);
    }
    return groups;
  }, [availableKeys, centroidData]);

  // Refs
  const outerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const charAreaRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<Map<keyof CharacterColors, HTMLDivElement>>(new Map());

  // Dynamic grid dimensions — computed from available space so the diagram fills
  // the viewport without scrolling. Height overhead = border(2) + padding(16) +
  // grid-gaps(16) + gap-to-reset(8) + reset-btn(32) = 74px.
  // Width fixed elements = pose-strip(144) + connectors(12) + country-strip(144) +
  // center-border+padding(18) + col-gaps(16) = 334px.
  const [gridDims, setGridDims] = useState({
    charH: 400, panelRowH: 100,
    charW: MIN_CHAR_W, panelColW: MIN_PANEL_COL_W,
  });

  // Connector-line state
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
      const side = sideFromCentroid(centroid.x, centroid.y);

      let x2: number, y2: number;
      switch (side) {
        case "left":
          x2 = entryRect.right - containerRect.left;
          y2 = entryRect.top + entryRect.height / 2 - containerRect.top;
          break;
        case "right":
          x2 = entryRect.left - containerRect.left;
          y2 = entryRect.top + entryRect.height / 2 - containerRect.top;
          break;
        case "top":
          x2 = entryRect.left + entryRect.width / 2 - containerRect.left;
          y2 = entryRect.bottom - containerRect.top;
          break;
        case "bottom":
          x2 = entryRect.left + entryRect.width / 2 - containerRect.left;
          y2 = entryRect.top - containerRect.top;
          break;
      }

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

  // Measure available height from the outer wrapper (h-full fills the parent) and
  // compute charH / panelRowH so the grid always fills the viewport without scrolling.
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const compute = () => {
      const availH = el.clientHeight;
      const availW = el.clientWidth;
      if (availH < 200) return;

      // Height: overhead = border(2)+padding(16)+grid-gaps(16)+gap-to-reset(8)+reset-btn(32) = 74px
      const usableH = availH - 74;
      const prh = Math.max(100, Math.floor(usableH * 0.18));
      const ch  = Math.max(200, usableH - 2 * prh);

      // Width: fixed elements = pose-strip(144)+connectors(12)+country-strip(144)
      //        + center-border+padding(18) + col-gaps(16) = 334px
      // Distribute remaining: panels get 22% each, char gets the rest.
      const available = Math.max(0, availW - 334);
      const pcw = Math.max(MIN_PANEL_COL_W, Math.min(MAX_PANEL_COL_W, Math.floor(available * 0.22)));
      const cw  = Math.max(MIN_CHAR_W,      Math.min(MAX_CHAR_W,      available - 2 * pcw));

      setGridDims({ charH: ch, panelRowH: prh, charW: cw, panelColW: pcw });
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

  // Click on character: find nearest centroid
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

  // Pose switch: update internal state, clear active accessory, notify parent.
  const handleShotTypeSwitch = useCallback(
    (newType: ShotType) => {
      setActiveShotType(newType);
      setActiveKey(null);
      entryRefs.current.clear();
      onShotTypeChange?.(newType);
    },
    [setActiveKey, onShotTypeChange]
  );

  // Helper: register entry ref
  const setEntryRef = useCallback(
    (key: keyof CharacterColors) => (el: HTMLDivElement | null) => {
      if (el) entryRefs.current.set(key, el);
    },
    []
  );

  // Helper: render a uniform panel card (no side dependency)
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
    <div ref={outerRef} className={cn("w-full h-full", className)}>
    <div className="flex flex-row items-center justify-center h-full">

      {/* ── Pose strip ── */}
      <div className="flex-shrink-0 border border-zinc-800 rounded-2xl p-2">
        <div className="grid grid-cols-2 gap-1.5">
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
      <div className="flex-shrink-0 w-3 h-px bg-zinc-700" />

      {/* ── Center: fixed-size grid + Reset All, wrapped in one border ── */}
      <div className="flex-shrink-0 border border-zinc-800 rounded-2xl p-2 flex flex-col gap-2">
        <div
          ref={containerRef}
          className="relative grid gap-2"
          style={{
            gridTemplateColumns: `${gridDims.panelColW}px ${gridDims.charW}px ${gridDims.panelColW}px`,
            gridTemplateRows: `${gridDims.panelRowH}px ${gridDims.charH}px ${gridDims.panelRowH}px`,
          }}
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

          {/* ── Top panel row — always present for stable layout ── */}
          <div
            className="flex items-end justify-center gap-2 overflow-hidden"
            style={{ gridColumn: "1 / 4", gridRow: 1 }}
          >
            {panelGroups.top.map(renderEntry)}
          </div>

          {/* ── Left panel column — always present ── */}
          <div
            className="flex flex-col justify-center gap-2 overflow-hidden"
            style={{ gridColumn: 1, gridRow: 2 }}
          >
            {panelGroups.left.map(renderEntry)}
          </div>

          {/* ── Character cell — col 2, row 2 ── */}
          <div
            ref={charAreaRef}
            className="relative cursor-crosshair touch-none"
            style={{ gridColumn: 2, gridRow: 2, width: gridDims.charW, height: gridDims.charH, minWidth: MIN_CHAR_W }}
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

          {/* ── Right panel column — always present ── */}
          <div
            className="flex flex-col justify-center gap-2 overflow-hidden"
            style={{ gridColumn: 3, gridRow: 2 }}
          >
            {panelGroups.right.map(renderEntry)}
          </div>

          {/* ── Bottom panel row — always present ── */}
          <div
            className="flex items-start justify-center gap-2 overflow-hidden"
            style={{ gridColumn: "1 / 4", gridRow: 3 }}
          >
            {panelGroups.bottom.map(renderEntry)}
          </div>
        </div>

        {/* ── Reset All — inside the center border, below the grid ── */}
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
      <div className="flex-shrink-0 w-3 h-px bg-zinc-700" />

      {/* ── Country strip ── */}
      <div className="flex-shrink-0 border border-zinc-800 rounded-2xl p-2">
        <div className="grid grid-cols-2 gap-1.5">
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
