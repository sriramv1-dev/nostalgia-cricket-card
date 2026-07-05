"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export function CustomizerMobile({
  shotType,
  country,
  customization,
  onDone,
}: CustomizerMobileProps) {
  const { colors, applyCountryPreset, activeKey, setActiveKey, updateColor, resetKey, swatches } =
    customization;

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

  useEffect(() => {
    setCentroidData(null);
    fetch(`/data/centroids/${activeShot}.json`)
      .then((r) => r.json())
      .then(setCentroidData)
      .catch(() => null);
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
      </div>

      {/* Inline color editor zone — fixed height so the shot strip below
          never shifts when an accessory is selected/deselected. */}
      <div className="flex-shrink-0 h-24 flex items-center px-4 border-t border-zinc-800">
        {activeKey && (
          <div className="flex items-center gap-3 w-full min-w-0">
            <div className="flex flex-col gap-1 flex-shrink-0">
              <span className="text-zinc-400 text-[10px] tracking-widest uppercase">
                {ACCESSORY_LABELS[activeKey]}
              </span>
              <div className="flex items-center gap-2">
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
            </div>
            <div className="flex-1 min-w-0 flex gap-2 overflow-x-auto">
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
          </div>
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
