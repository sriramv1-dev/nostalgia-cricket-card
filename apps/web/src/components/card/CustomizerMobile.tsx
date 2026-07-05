"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACCESSORY_LABELS,
  getCharacterSources,
  SHOT_OPTIONS,
  type PlayerRole,
  type ShotType,
} from "@/constants/characters";
import { COUNTRY_NAMES } from "@/constants/countries";
import type { UseAccessoryCustomizationResult } from "@/hooks/useAccessoryCustomization";
import type { CharacterColors } from "@/types/card";
import { cn } from "@/lib/utils";
import { PoseThumbnail } from "./PoseThumbnail";
import { CountryThumbnail } from "./CountryThumbnail";

export interface CustomizerMobileProps {
  shotType: ShotType;
  country: string;
  customization: UseAccessoryCustomizationResult;
  /** Called when the user taps the ✓ FAB with no sheet open. */
  onDone: () => void;
}

// Hitmap region colors → accessory keys (matches the hitmap PNG palette).
const COLOR_TO_KEY: Record<string, keyof CharacterColors> = {
  FF0000: "cap",
  FF8800: "capAccent",
  FFFF00: "gloves",
  "00FF00": "pads",
  "0000FF": "shoes",
  FF00FF: "bat",
  "00FFFF": "ball",
  FFFFFF: "wickets",
};

const CANVAS_PADDING_PX = 32; // breathing room around the character
const MIN_ALPHA = 10; // hitmap sample below this = miss
const TOAST_DURATION_MS = 3000;

function deriveRole(shot: string): PlayerRole {
  if (shot === "pace" || shot === "spin") return "bowler";
  if (shot === "keeping1" || shot === "keeping2") return "keeper";
  return "batter";
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

// Accessory connector boxes floating around the character (mobile hitmap
// entry points, in addition to tapping the body part directly). Positions
// are derived at render time from the shot's centroid JSON — see
// computeBoxLayout below.
const BOX_WIDTH_PX = 84;
const BOX_HEIGHT_PX = 28;
const CONNECTOR_OFFSET_PX = 80; // gap between the centroid and the box edge
const BOX_EDGE_MARGIN_PX = 4; // keep boxes fully inside the canvas

interface BoxLayout {
  side: "left" | "right";
  boxLeft: number;
  boxTop: number;
  lineStart: { x: number; y: number };
  lineEnd: { x: number; y: number };
}

function computeBoxLayout(
  centroid: { x: number; y: number },
  areaSize: { width: number; height: number },
  charOffsetX: number,
  charOffsetY: number,
  displayWidth: number,
  displayHeight: number
): BoxLayout {
  const canvasX = charOffsetX + centroid.x * displayWidth;
  const canvasY = charOffsetY + centroid.y * displayHeight;
  const side: "left" | "right" = centroid.x < 0.5 ? "left" : "right";

  let boxLeft =
    side === "left"
      ? canvasX - CONNECTOR_OFFSET_PX - BOX_WIDTH_PX
      : canvasX + CONNECTOR_OFFSET_PX;
  let boxTop = canvasY - BOX_HEIGHT_PX / 2;

  boxLeft = Math.max(
    BOX_EDGE_MARGIN_PX,
    Math.min(boxLeft, areaSize.width - BOX_WIDTH_PX - BOX_EDGE_MARGIN_PX)
  );
  boxTop = Math.max(
    BOX_EDGE_MARGIN_PX,
    Math.min(boxTop, areaSize.height - BOX_HEIGHT_PX - BOX_EDGE_MARGIN_PX)
  );

  const lineStartX = side === "left" ? boxLeft + BOX_WIDTH_PX : boxLeft;
  const lineStartY = boxTop + BOX_HEIGHT_PX / 2;

  return {
    side,
    boxLeft,
    boxTop,
    lineStart: { x: lineStartX, y: lineStartY },
    lineEnd: { x: canvasX, y: canvasY },
  };
}

export function CustomizerMobile({
  shotType,
  country,
  customization,
  onDone,
}: CustomizerMobileProps) {
  const {
    colors,
    applyCountryPreset,
    activeKey,
    setActiveKey,
    updateColor,
    resetKey,
    swatches,
    availableKeys,
  } = customization;

  const [activeShot, setActiveShot] = useState<ShotType>(shotType);
  const [activeCountry, setActiveCountry] = useState<string>(country);

  const sources = getCharacterSources(deriveRole(activeShot), activeShot);
  const hitmapSrc = `${sources.base.slice(0, sources.base.lastIndexOf("/") + 1)}hitmap.png`;

  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null
  );
  const [areaSize, setAreaSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [centroidData, setCentroidData] = useState<{
    imageWidth: number;
    imageHeight: number;
    centroids: Partial<Record<keyof CharacterColors, { x: number; y: number }>>;
  } | null>(null);

  // Fetch the centroid JSON for the active shot. Deliberately does not
  // clear the previous shot's data first — keeps connector boxes/lines
  // (and character sizing) stable until the new centroids resolve, so
  // switching shots never flashes or jumps.
  useEffect(() => {
    let cancelled = false;
    fetch(`/data/centroids/${activeShot}.json`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCentroidData(data);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [activeShot]);

  // Context toast — shows on entry, re-shows whenever the country changes.
  const [showToast, setShowToast] = useState(false);
  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeCountry]);

  const characterAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track the character area's size so the layout responds to viewport
  // resizes and device rotation. Measure synchronously first — ResizeObserver
  // delivers before paint, so a backgrounded tab may never fire it.
  useEffect(() => {
    const el = characterAreaRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setAreaSize({ width: rect.width, height: rect.height });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fit the character in the available area preserving aspect ratio.
  const displayScale =
    centroidData && areaSize
      ? Math.min(
          (areaSize.width - CANVAS_PADDING_PX) / centroidData.imageWidth,
          (areaSize.height - CANVAS_PADDING_PX) / centroidData.imageHeight
        )
      : 0;
  const displayWidth = Math.floor((centroidData?.imageWidth ?? 0) * displayScale);
  const displayHeight = Math.floor((centroidData?.imageHeight ?? 0) * displayScale);
  const ready = displayWidth > 0 && displayHeight > 0;

  const hitTestAt = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container || !centroidData) return;

      const rect = container.getBoundingClientRect();
      const posX = clientX - rect.left;
      const posY = clientY - rect.top;

      const scale = Math.min(
        rect.width / centroidData.imageWidth,
        rect.height / centroidData.imageHeight
      );
      const renderW = centroidData.imageWidth * scale;
      const renderH = centroidData.imageHeight * scale;
      const nx = (posX - (rect.width - renderW) / 2) / renderW;
      const ny = (posY - (rect.height - renderH) / 2) / renderH;

      let closest: keyof CharacterColors | null = null;
      let minDist = Infinity;
      for (const [key, centroid] of Object.entries(centroidData.centroids)) {
        if (!centroid) continue;
        const d = Math.hypot(nx - centroid.x, ny - centroid.y);
        // Only select if reasonably close (e.g. within 30% of character size)
        if (d < minDist && d < 0.3) {
          minDist = d;
          closest = key as keyof CharacterColors;
        }
      }
      setActiveKey(closest);
    },
    [centroidData, setActiveKey]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => hitTestAt(e.clientX, e.clientY),
    [hitTestAt]
  );

  const handleTouch = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      if (touch) hitTestAt(touch.clientX, touch.clientY);
    },
    [hitTestAt]
  );

  // ✓ FAB: close the sheet if open, otherwise finish.
  const handleFab = useCallback(() => {
    if (activeKey) {
      setActiveKey(null);
      return;
    }
    onDone();
  }, [activeKey, setActiveKey, onDone]);

  // Accessory boxes/connectors — alternate entry points into the same
  // selection as tapping the body part directly. Driven entirely by the
  // active shot's centroid JSON (not `availableKeys`, which tracks the
  // parent page's shot selection and can be stale while browsing shots
  // locally via the shot strip below).
  const boxKeys = centroidData
    ? (Object.keys(centroidData.centroids) as Array<keyof CharacterColors>).filter(
        (key) => centroidData.centroids[key] != null && sources[key] != null
      )
    : [];

  const selectAccessory = useCallback(
    (key: keyof CharacterColors) =>
      (e: React.SyntheticEvent) => {
        e.stopPropagation();
        setActiveKey(key);
      },
    [setActiveKey]
  );

  // Resolve box layouts once per shot/size, then nudge apart any boxes on
  // the same side whose centroids sit too close together vertically (e.g.
  // bat/gloves), so they never visually overlap.
  const boxLayouts = useMemo(() => {
    if (!areaSize || !centroidData) return {} as Partial<Record<keyof CharacterColors, BoxLayout>>;
    const charOffsetX = (areaSize.width - displayWidth) / 2;
    const charOffsetY = (areaSize.height - displayHeight) / 2;

    const entries = boxKeys.map((key) => ({
      key,
      layout: computeBoxLayout(
        centroidData.centroids[key]!,
        areaSize,
        charOffsetX,
        charOffsetY,
        displayWidth,
        displayHeight
      ),
    }));

    const MIN_GAP_PX = BOX_HEIGHT_PX + 6;
    (["left", "right"] as const).forEach((side) => {
      const group = entries
        .filter((e) => e.layout.side === side)
        .sort((a, b) => a.layout.boxTop - b.layout.boxTop);
      for (let i = 1; i < group.length; i++) {
        const prev = group[i - 1].layout;
        const cur = group[i].layout;
        const minTop = prev.boxTop + MIN_GAP_PX;
        if (cur.boxTop < minTop) {
          cur.boxTop = Math.min(
            minTop,
            areaSize.height - BOX_HEIGHT_PX - BOX_EDGE_MARGIN_PX
          );
          cur.lineStart.y = cur.boxTop + BOX_HEIGHT_PX / 2;
        }
      }
    });

    return Object.fromEntries(entries.map((e) => [e.key, e.layout])) as Partial<
      Record<keyof CharacterColors, BoxLayout>
    >;
  }, [boxKeys, centroidData, areaSize, displayWidth, displayHeight]);

  const coloredLayers: Array<{ key: keyof CharacterColors; src: string }> = [];
  if (sources.cap) coloredLayers.push({ key: "cap", src: sources.cap });
  if (sources.capAccent)
    coloredLayers.push({ key: "capAccent", src: sources.capAccent });
  if (sources.gloves)
    coloredLayers.push({ key: "gloves", src: sources.gloves });
  if (sources.pads) coloredLayers.push({ key: "pads", src: sources.pads });
  if (sources.shoes) coloredLayers.push({ key: "shoes", src: sources.shoes });
  if (sources.bat) coloredLayers.push({ key: "bat", src: sources.bat });
  if (sources.batOutline)
    coloredLayers.push({ key: "bat", src: sources.batOutline });
  if (sources.ball) coloredLayers.push({ key: "ball", src: sources.ball });
  if (sources.wickets)
    coloredLayers.push({ key: "wickets", src: sources.wickets });

  return (
    <div className="flex-1 min-h-0 flex flex-col">

      {/* Context toast */}
      {showToast && (
        <div className="fixed top-4 left-4 right-4 z-[60] rounded-xl border border-zinc-700 bg-zinc-900/95 backdrop-blur-md px-4 py-3">
          <p className="text-zinc-300 text-xs font-body tracking-wide text-center">
            changes apply to all {activeCountry} cards across the app
          </p>
        </div>
      )}

      {/* Country strip — above the character */}
      <div className="flex-shrink-0 flex gap-2 overflow-x-auto snap-x snap-mandatory px-4 py-2 border-b border-zinc-800">
        {COUNTRY_NAMES.map((c) => (
          <div key={c} className="snap-start w-20 flex-shrink-0">
            <CountryThumbnail
              country={c}
              isActive={activeCountry === c}
              onClick={() => {
                setActiveCountry(c);
                applyCountryPreset(c);
              }}
            />
          </div>
        ))}
      </div>

      {/* Hint bar */}
      <div className="flex-shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-zinc-800">
        <p className="flex-1 min-w-0 text-zinc-500 text-xs font-body tracking-wide">
          {activeKey
            ? `editing ${ACCESSORY_LABELS[activeKey].toLowerCase()} colour`
            : "tap any part of the character to change its colour"}
        </p>
        <button
          type="button"
          onClick={handleFab}
          aria-label="Done"
          className="flex-shrink-0 w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-card active:scale-95 transition-transform"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>

      {/* Character canvas — fills remaining height */}
      <div
        ref={characterAreaRef}
        className="flex-1 min-h-0 flex items-center justify-center overflow-hidden relative"
      >
        {!ready ? (
          <p className="text-zinc-500 text-sm font-body">Loading…</p>
        ) : (
          <div
            ref={containerRef}
            onClick={handleClick}
            onTouchStart={handleTouch}
            className="relative cursor-crosshair touch-none"
            style={{ width: displayWidth, height: displayHeight }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sources.base}
              alt="Character base"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
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
                  {/* Original PNG — shape, shadow, highlight detail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  />
                  {/* Hue overlay — shifts color, preserves luminance */}
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
        )}

        {/* Accessory boxes + connector lines — positioned over the full
            canvas area (not just the tightly-fit character box) so they
            sit beside the character instead of on top of it. Derived from
            the current shot's centroid JSON, not hardcoded positions. */}
        {ready && areaSize && centroidData && (
          <>
            <svg
              className="absolute inset-0 pointer-events-none"
              width={areaSize.width}
              height={areaSize.height}
            >
              {boxKeys.map((key) => {
                const layout = boxLayouts[key];
                if (!layout) return null;
                const { lineStart, lineEnd } = layout;
                const isSelected = activeKey === key;
                return (
                  <g key={key}>
                    <line
                      x1={lineStart.x}
                      y1={lineStart.y}
                      x2={lineEnd.x}
                      y2={lineEnd.y}
                      stroke={isSelected ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"}
                      strokeWidth={isSelected ? 1.5 : 1}
                    />
                    <line
                      x1={lineStart.x}
                      y1={lineStart.y}
                      x2={lineEnd.x}
                      y2={lineEnd.y}
                      stroke="transparent"
                      strokeWidth={8}
                      style={{ pointerEvents: "stroke", cursor: "pointer" }}
                      onClick={selectAccessory(key)}
                      onTouchStart={(e) => e.stopPropagation()}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Accessory name boxes — alternate tap targets for the same
                selection as tapping the body part via the hitmap. */}
            {boxKeys.map((key) => {
              const layout = boxLayouts[key];
              if (!layout) return null;
              const { boxLeft, boxTop } = layout;
              const isSelected = activeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={selectAccessory(key)}
                  onTouchStart={(e) => e.stopPropagation()}
                  style={{ left: boxLeft, top: boxTop, width: BOX_WIDTH_PX, height: BOX_HEIGHT_PX }}
                  className={cn(
                    "absolute flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/70 border pointer-events-auto",
                    isSelected ? "border-pink-500" : "border-white/20"
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/30"
                    style={{ backgroundColor: colors[key] }}
                  />
                  <span className="text-white text-[9px] font-body tracking-widest uppercase whitespace-nowrap">
                    {ACCESSORY_LABELS[key]}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Inline color editor zone — collapsed to nothing when no accessory
          is selected, so it doesn't leave a gap above the shot strip. */}
      <div
        className={cn(
          "flex-shrink-0 overflow-hidden flex flex-col justify-center gap-2 px-4 transition-[max-height] duration-150",
          activeKey ? "max-h-36 py-2 border-t border-zinc-800" : "max-h-0"
        )}
      >
        {activeKey && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-[10px] tracking-widest uppercase flex-shrink-0">
                {ACCESSORY_LABELS[activeKey]}
              </span>
              <span
                style={{ color: colors[activeKey] }}
                className="text-xs font-body tracking-wide uppercase"
              >
                {colors[activeKey]}
              </span>
              <button
                type="button"
                onClick={() => resetKey(activeKey)}
                aria-label="Reset to default"
                className="text-zinc-500 hover:text-white text-base leading-none flex items-center justify-center w-6 h-6"
              >
                ↺
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {swatches[activeKey].map((swatch) => {
                const isSelected =
                  swatch.toLowerCase() === (colors[activeKey] ?? "").toLowerCase();
                return (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => updateColor(activeKey, swatch)}
                    aria-label={swatch}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex-shrink-0",
                      isSelected ? "border-zinc-300" : "border-zinc-700"
                    )}
                    style={{ backgroundColor: swatch }}
                  />
                );
              })}
            </div>

            {(() => {
              const hex = colors[activeKey] ?? "#888888";
              const [h, s, l] = hexToHSL(hex);
              return (
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={h}
                  aria-label="Hue"
                  onChange={(e) =>
                    updateColor(
                      activeKey,
                      hslToHex(Number(e.target.value), s || 50, l || 50)
                    )
                  }
                  className="w-full h-3 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-900 [&::-webkit-slider-thumb]:shadow-card [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zinc-900"
                  style={{
                    background:
                      "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                  }}
                />
              );
            })()}
          </>
        )}
      </div>

      {/* Shot-type strip — below the character */}
      <div className="flex-shrink-0 flex gap-2 overflow-x-auto snap-x snap-mandatory px-4 py-2 border-t border-zinc-800">
        {SHOT_OPTIONS.map(({ shotType: st, label }) => (
          <div key={st} className="snap-start w-20 flex-shrink-0">
            <PoseThumbnail
              shotType={st}
              label={label}
              isActive={activeShot === st}
              onClick={() => {
                setActiveShot(st);
                setActiveKey(null);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
