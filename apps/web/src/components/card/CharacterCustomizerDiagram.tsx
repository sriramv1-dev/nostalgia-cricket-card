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
  type UseAccessoryCustomizationResult,
} from "@/hooks/useAccessoryCustomization";
import { SHOT_SOURCES, type ShotType } from "@/constants/characters";
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

// Anatomical grouping — determines which grid cell a panel entry sits in.
// Keys on the character's body top → top cell, hands/bat → left, ball/wickets → right, legs → bottom.
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
const CURVE_BEND = 60; // control-point offset for bezier curves

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── ConnectorLine ───────────────────────────────────────────────────────────

interface ConnectorLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  side: PanelSide;
  dotColor: string;
}

function ConnectorLine({ x1, y1, x2, y2, side, dotColor }: ConnectorLineProps) {
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
    <g>
      <path
        d={d}
        fill="none"
        stroke="#52525b"
        strokeWidth={1}
        strokeDasharray="4 3"
        opacity={0.55}
      />
      <circle cx={x1} cy={y1} r={3} fill={dotColor} stroke="#27272a" strokeWidth={1} />
    </g>
  );
}

// ─── SwatchSlider ────────────────────────────────────────────────────────────

interface SwatchSliderProps {
  accessoryKey: keyof CharacterColors;
  currentColor: string;
  onColorChange: (color: string) => void;
}

function SwatchSlider({ accessoryKey, currentColor, onColorChange }: SwatchSliderProps) {
  const swatches = ACCESSORY_SWATCHES[accessoryKey];
  const idx = findSwatchIndex(currentColor, swatches);

  return (
    <div className="flex flex-col gap-1.5">
      <input
        type="range"
        min={0}
        max={swatches.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onColorChange(swatches[parseInt(e.target.value, 10)])}
        className="w-full h-2 rounded-full cursor-pointer appearance-none"
        style={{
          background: `linear-gradient(to right, ${swatches.join(", ")})`,
        }}
      />
      <div className="flex gap-1">
        {swatches.map((swatch, i) => (
          <button
            key={swatch}
            type="button"
            onClick={() => onColorChange(swatch)}
            className={cn(
              "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-transform",
              i === idx ? "border-white scale-125" : "border-transparent hover:scale-110"
            )}
            style={{ backgroundColor: swatch }}
            aria-label={swatch}
          />
        ))}
      </div>
    </div>
  );
}

// ─── PanelEntry ──────────────────────────────────────────────────────────────

interface PanelEntryProps {
  accessoryKey: keyof CharacterColors;
  color: string;
  onSelect: () => void;
  onColorChange: (c: string) => void;
  onReset: () => void;
  entryRef: (el: HTMLDivElement | null) => void;
}

function PanelEntry({
  accessoryKey,
  color,
  onSelect,
  onColorChange,
  onReset,
  entryRef,
}: PanelEntryProps) {
  return (
    <div
      ref={entryRef}
      onClick={onSelect}
      className="flex flex-col gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 p-3 cursor-pointer hover:border-zinc-500 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="w-3 h-3 rounded-full border border-zinc-600 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-body tracking-widest uppercase text-zinc-300 whitespace-nowrap">
            {KEY_LABELS[accessoryKey]}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="text-zinc-500 hover:text-white text-xs font-body transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center rounded-lg hover:bg-zinc-700 flex-shrink-0"
          aria-label="Reset"
        >
          ↺
        </button>
      </div>
      <SwatchSlider
        accessoryKey={accessoryKey}
        currentColor={color}
        onColorChange={onColorChange}
      />
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function CharacterCustomizerDiagram({
  shotType,
  customization,
  className,
}: CharacterCustomizerDiagramProps) {
  const { colors, updateColor, reset, activeKey, setActiveKey, availableKeys } =
    customization;

  const sources = SHOT_SOURCES[shotType];

  // Centroid payload
  const [centroidData, setCentroidData] = useState<CentroidPayload | null>(null);
  useEffect(() => {
    setCentroidData(null);
    fetch(`/data/centroids/${shotType}.json`)
      .then((r) => r.json())
      .then(setCentroidData)
      .catch(() => null);
  }, [shotType]);

  // Group available keys by anatomical side
  const panelGroups = useMemo((): Record<PanelSide, Array<keyof CharacterColors>> => {
    const groups: Record<PanelSide, Array<keyof CharacterColors>> = {
      top: [], left: [], right: [], bottom: [],
    };
    for (const key of availableKeys) {
      groups[ANATOMICAL_SIDE[key]].push(key);
    }
    return groups;
  }, [availableKeys]);

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
      const side = ANATOMICAL_SIDE[key];

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

  // Helper: register entry ref
  const setEntryRef = useCallback(
    (key: keyof CharacterColors) => (el: HTMLDivElement | null) => {
      if (el) entryRefs.current.set(key, el);
    },
    []
  );

  // Helper: render a panel entry
  const renderEntry = useCallback(
    (key: keyof CharacterColors) => {
      const color = (colors[key] as string | undefined) ?? "#888888";
      return (
        <PanelEntry
          key={key}
          accessoryKey={key}
          color={color}
          onSelect={() => setActiveKey(activeKey === key ? null : key)}
          onColorChange={(c) => { updateColor(key, c); setActiveKey(key); }}
          onReset={reset}
          entryRef={setEntryRef(key)}
        />
      );
    },
    [colors, activeKey, setActiveKey, updateColor, reset, setEntryRef]
  );

  return (
    // Outer wrapper: centers the grid inside whatever container is provided.
    // The grid has equal left/right columns (1fr each) so the character cell
    // is always horizontally centered regardless of panel entry counts.
    <div className={cn("flex items-start justify-center", className)}>
      <div
        ref={containerRef}
        className="relative grid gap-3"
        style={{
          gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
          gridTemplateRows: "auto auto auto",
          minWidth: 0,
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
            />
          ))}
        </svg>

        {/* ── Top panel (cap, capAccent) ── */}
        {panelGroups.top.length > 0 && (
          <div
            className="flex flex-row gap-2 items-end"
            style={{ gridColumn: "1 / 4", gridRow: 1 }}
          >
            {/* spacer to align entries above the character center */}
            <div className="flex-1" />
            <div className="flex flex-row gap-2">
              {panelGroups.top.map(renderEntry)}
            </div>
            <div className="flex-1" />
          </div>
        )}

        {/* ── Left panel (gloves, bat) ── */}
        {panelGroups.left.length > 0 && (
          <div
            className="flex flex-col gap-2 justify-center"
            style={{ gridColumn: 1, gridRow: 2, minWidth: 160 }}
          >
            {panelGroups.left.map(renderEntry)}
          </div>
        )}
        {/* Placeholder if left is empty — keeps character in col 2 */}
        {panelGroups.left.length === 0 && (
          <div style={{ gridColumn: 1, gridRow: 2 }} />
        )}

        {/* ── Character cell — always col 2, row 2 ── */}
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

        {/* ── Right panel (ball, wickets) ── */}
        {panelGroups.right.length > 0 && (
          <div
            className="flex flex-col gap-2 justify-center"
            style={{ gridColumn: 3, gridRow: 2, minWidth: 160 }}
          >
            {panelGroups.right.map(renderEntry)}
          </div>
        )}
        {/* Placeholder if right is empty */}
        {panelGroups.right.length === 0 && (
          <div style={{ gridColumn: 3, gridRow: 2 }} />
        )}

        {/* ── Bottom panel (pads, shoes) ── */}
        {panelGroups.bottom.length > 0 && (
          <div
            className="flex flex-row gap-2 items-start"
            style={{ gridColumn: "1 / 4", gridRow: 3 }}
          >
            <div className="flex-1" />
            <div className="flex flex-row gap-2">
              {panelGroups.bottom.map(renderEntry)}
            </div>
            <div className="flex-1" />
          </div>
        )}

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
  );
}
