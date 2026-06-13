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

export interface CharacterCustomizerDiagramProps {
  shotType: ShotType;
  /** Pass the result of useAccessoryCustomization — state is owned by the caller. */
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

const CHAR_W = 340;
const CHAR_H = 460;

const ACTIVE_GLOW =
  "drop-shadow(0 0 14px #e8257a) drop-shadow(0 0 6px #fff) drop-shadow(0 0 3px #e8257a)";
const IDLE_GLOW =
  "drop-shadow(0 0 4px #e8257a) drop-shadow(0 0 1px #e8257a)";

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
  isActive: boolean;
  dotColor: string;
}

function ConnectorLine({ x1, y1, x2, y2, isActive, dotColor }: ConnectorLineProps) {
  const midX = (x1 + x2) / 2;
  const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={isActive ? dotColor : "#52525b"}
        strokeWidth={isActive ? 2 : 1}
        strokeDasharray={isActive ? undefined : "4 3"}
        opacity={isActive ? 1 : 0.45}
        className="transition-all duration-200"
      />
      <circle
        cx={x1}
        cy={y1}
        r={isActive ? 5 : 3}
        fill={dotColor}
        stroke="#fff"
        strokeWidth={1}
        className="transition-all duration-200"
      />
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
      <div className="flex gap-1 flex-wrap">
        {swatches.map((swatch, i) => (
          <button
            key={swatch}
            type="button"
            onClick={() => onColorChange(swatch)}
            className={cn(
              "w-5 h-5 rounded-full border-2 flex-shrink-0 transition-transform",
              i === idx
                ? "border-white scale-125"
                : "border-transparent hover:scale-110"
            )}
            style={{ backgroundColor: swatch }}
            aria-label={swatch}
          />
        ))}
      </div>
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

  // Load centroid payload from public JSON
  const [centroidData, setCentroidData] = useState<CentroidPayload | null>(null);
  useEffect(() => {
    setCentroidData(null);
    fetch(`/data/centroids/${shotType}.json`)
      .then((r) => r.json())
      .then(setCentroidData)
      .catch(() => null);
  }, [shotType]);

  // Refs for geometry
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
      next.push({
        key,
        x1: charOffX + charPt.x,
        y1: charOffY + charPt.y,
        x2: entryRect.left - containerRect.left,
        y2: entryRect.top + entryRect.height / 2 - containerRect.top,
        dotColor: (colors[key] as string | undefined) ?? "#e8257a",
      });
    }

    setLines(next);
  }, [centroidData, availableKeys, colors]);

  useLayoutEffect(() => { recomputeLines(); }, [recomputeLines]);

  useEffect(() => {
    const observer = new ResizeObserver(recomputeLines);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [recomputeLines]);

  // Scroll active entry into view
  useEffect(() => {
    if (!activeKey) return;
    entryRefs.current.get(activeKey)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeKey]);

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

      const scale = Math.min(
        CHAR_W / centroidData.imageWidth,
        CHAR_H / centroidData.imageHeight
      );
      const renderW = centroidData.imageWidth * scale;
      const renderH = centroidData.imageHeight * scale;
      const offX = (CHAR_W - renderW) / 2;
      const offY = (CHAR_H - renderH) / 2;
      const nx = (posX - offX) / renderW;
      const ny = (posY - offY) / renderH;

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

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-row gap-4 items-start", className)}
    >
      {/* SVG connector overlay */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        aria-hidden
      >
        {lines.map(({ key, x1, y1, x2, y2, dotColor }) => (
          <ConnectorLine
            key={key}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            isActive={activeKey === key}
            dotColor={dotColor}
          />
        ))}
      </svg>

      {/* Character display */}
      <div
        ref={charAreaRef}
        className="flex-shrink-0 relative cursor-crosshair touch-none"
        style={{ width: CHAR_W, height: CHAR_H }}
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
          const isActive = activeKey === key;
          return (
            <div
              key={src}
              aria-hidden
              className="absolute inset-0 pointer-events-none transition-[filter] duration-150"
              style={{ filter: isActive ? ACTIVE_GLOW : IDLE_GLOW, isolation: "isolate" }}
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

      {/* Accessory panel */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {availableKeys.map((key) => {
          const color = (colors[key] as string | undefined) ?? "#888888";
          const isActive = activeKey === key;

          return (
            <div
              key={key}
              ref={(el) => { if (el) entryRefs.current.set(key, el); }}
              onClick={() => setActiveKey(isActive ? null : key)}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border p-3 cursor-pointer transition-colors duration-150",
                isActive
                  ? "border-pink-500 bg-zinc-800"
                  : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-zinc-600 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-body tracking-widest uppercase text-zinc-300">
                    {KEY_LABELS[key]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="text-zinc-500 hover:text-white text-xs font-body tracking-wide transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg hover:bg-zinc-700"
                  aria-label={`Reset all`}
                >
                  Reset
                </button>
              </div>

              <SwatchSlider
                accessoryKey={key}
                currentColor={color}
                onColorChange={(c) => {
                  updateColor(key, c);
                  setActiveKey(key);
                }}
              />
            </div>
          );
        })}

        <button
          type="button"
          onClick={reset}
          className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-body tracking-widest uppercase py-3 transition-colors"
        >
          Reset All
        </button>
      </div>
    </div>
  );
}
