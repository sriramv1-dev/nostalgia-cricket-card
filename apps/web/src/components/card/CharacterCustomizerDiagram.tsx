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

const CHAR_W = 340;
const CHAR_H = 460;
const CURVE_BEND = 60;
const PANEL_COL_W = 140; // px — fixed width for left/right panel columns
const PANEL_ROW_H = 120; // px — fixed height for top/bottom panel rows

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

// ─── PanelEntry ──────────────────────────────────────────────────────────────

interface PanelEntryProps {
  accessoryKey: keyof CharacterColors;
  color: string;
  side: PanelSide;
  isActive: boolean;
  onSelect: () => void;
  onColorChange: (c: string) => void;
  onResetKey: () => void;
  entryRef: (el: HTMLDivElement | null) => void;
}

function PanelEntry({
  accessoryKey,
  color,
  side,
  isActive,
  onSelect,
  onColorChange,
  onResetKey,
  entryRef,
}: PanelEntryProps) {
  const swatches = ACCESSORY_SWATCHES[accessoryKey];
  const idx = findSwatchIndex(color, swatches);
  const isHorizontal = side === "left" || side === "right";
  // Slider on the character-facing edge:
  // right panel → character is to the left → slider goes to the left (flex-row-reverse)
  // bottom panel → character is above → slider goes to the top (flex-col-reverse)
  const sliderFirst = side === "right" || side === "bottom";

  const infoSection = (
    <div className={cn("flex flex-col gap-0.5 min-w-0", isHorizontal && "flex-1")}>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full border border-zinc-600 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-[11px] font-body tracking-widest uppercase text-zinc-300 truncate">
            {KEY_LABELS[accessoryKey]}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onResetKey(); }}
          className="text-zinc-500 hover:text-white text-xs transition-colors min-h-[24px] min-w-[24px] flex items-center justify-center rounded hover:bg-zinc-700 flex-shrink-0"
          title="Reset to default"
        >
          ↺
        </button>
      </div>
      <span className="text-[10px] font-mono text-zinc-500 tracking-wider pl-[14px]">
        {color}
      </span>
    </div>
  );

  const sliderSection = (
    <div className={cn("flex flex-col gap-1 flex-shrink-0", isHorizontal ? "w-[64px]" : "")}>
      <input
        type="range"
        min={0}
        max={swatches.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onColorChange(swatches[parseInt(e.target.value, 10)])}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-1.5 rounded-full cursor-pointer appearance-none"
        style={{
          background: `linear-gradient(to right, ${swatches.join(", ")})`,
        }}
      />
      <div className={cn("flex flex-wrap", isHorizontal ? "gap-0.5" : "gap-1")}>
        {swatches.map((swatch, i) => (
          <button
            key={swatch}
            type="button"
            onClick={(e) => { e.stopPropagation(); onColorChange(swatch); }}
            className={cn(
              "rounded-full border-2 flex-shrink-0 transition-transform",
              isHorizontal ? "w-3 h-3" : "w-3.5 h-3.5",
              i === idx ? "border-white scale-125" : "border-transparent hover:scale-110"
            )}
            style={{ backgroundColor: swatch }}
            aria-label={swatch}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div
      ref={entryRef}
      onClick={onSelect}
      className={cn(
        "rounded-2xl border cursor-pointer transition-colors",
        isHorizontal
          ? cn("p-2 flex gap-2 items-center", sliderFirst ? "flex-row-reverse" : "flex-row")
          : cn("p-2.5 flex flex-col gap-2", sliderFirst ? "flex-col-reverse" : "flex-col"),
        isActive ? "border-zinc-500 bg-zinc-800" : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
      )}
    >
      {infoSection}
      {sliderSection}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const charAreaRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<Map<keyof CharacterColors, HTMLDivElement>>(new Map());

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
        CHAR_W,
        CHAR_H
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

      const scale = Math.min(CHAR_W / centroidData.imageWidth, CHAR_H / centroidData.imageHeight);
      const renderW = centroidData.imageWidth * scale;
      const renderH = centroidData.imageHeight * scale;
      const nx = (posX - (CHAR_W - renderW) / 2) / renderW;
      const ny = (posY - (CHAR_H - renderH) / 2) / renderH;

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

  // Helper: render a panel entry for a given side
  const renderEntry = useCallback(
    (key: keyof CharacterColors, side: PanelSide) => {
      const color = (colors[key] as string | undefined) ?? "#888888";
      return (
        <PanelEntry
          key={key}
          accessoryKey={key}
          color={color}
          side={side}
          isActive={activeKey === key}
          onSelect={() => setActiveKey(activeKey === key ? null : key)}
          onColorChange={(c) => { updateColor(key, c); setActiveKey(key); }}
          onResetKey={() => resetKey(key)}
          entryRef={setEntryRef(key)}
        />
      );
    },
    [colors, activeKey, setActiveKey, updateColor, resetKey, setEntryRef]
  );

  return (
    <div className={cn("flex flex-row items-center justify-center", className)}>

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

      {/* ── Center: fixed-size grid in a border wrapper ── */}
      <div className="flex-shrink-0 border border-zinc-800 rounded-2xl p-3">
        <div
          ref={containerRef}
          className="relative grid gap-3"
          style={{
            gridTemplateColumns: `${PANEL_COL_W}px ${CHAR_W}px ${PANEL_COL_W}px`,
            gridTemplateRows: `${PANEL_ROW_H}px ${CHAR_H}px ${PANEL_ROW_H}px auto`,
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
            {panelGroups.top.map((key) => renderEntry(key, "top"))}
          </div>

          {/* ── Left panel column — always present ── */}
          <div
            className="flex flex-col justify-center gap-2 overflow-hidden"
            style={{ gridColumn: 1, gridRow: 2 }}
          >
            {panelGroups.left.map((key) => renderEntry(key, "left"))}
          </div>

          {/* ── Character cell — col 2, row 2 ── */}
          <div
            ref={charAreaRef}
            className="relative cursor-crosshair touch-none"
            style={{ gridColumn: 2, gridRow: 2, width: CHAR_W, height: CHAR_H }}
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
            {panelGroups.right.map((key) => renderEntry(key, "right"))}
          </div>

          {/* ── Bottom panel row — always present ── */}
          <div
            className="flex items-start justify-center gap-2 overflow-hidden"
            style={{ gridColumn: "1 / 4", gridRow: 3 }}
          >
            {panelGroups.bottom.map((key) => renderEntry(key, "bottom"))}
          </div>

          {/* ── Reset all ── */}
          <div
            className="flex justify-center pt-1"
            style={{ gridColumn: "1 / 4", gridRow: 4 }}
          >
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-zinc-700 bg-zinc-900 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-body tracking-widest uppercase px-6 py-2 transition-colors"
            >
              Reset All
            </button>
          </div>
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
    </div>
  );
}
