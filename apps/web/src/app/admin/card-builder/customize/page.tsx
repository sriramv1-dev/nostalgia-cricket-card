"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCharacterSources, type PlayerRole } from "@/constants/characters";
import { useCountryTheme } from "@/hooks/useCountryTheme";
import { ColorPopover } from "@/components/card";
import { PageHeader } from "@/components/layout";
import { BatSwitch, CardButton } from "@/components/ui";
import type { CharacterColors } from "@/types/card";

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

// Same Form/Tap options as card-builder/page.tsx — the customize page IS
// tap mode, so the switch shows "tap" selected and "Form" navigates back.
const MODE_OPTIONS = [
  {
    id: "form" as const,
    label: "Form",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "tap" as const,
    label: "Tap",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11V6a2 2 0 0 1 4 0v5" />
        <path d="M13 11V8a2 2 0 0 1 4 0v5" />
        <path d="M17 11V9.5a2 2 0 0 1 4 0V17a4 4 0 0 1-4 4h-3a4 4 0 0 1-3.16-1.53L5 12a2 2 0 0 1 2.72-2.93L9 11" />
      </svg>
    ),
  },
];

const IDLE_GLOW =
  "drop-shadow(0 0 5px #e8257a) drop-shadow(0 0 2px #e8257a)";
const ACTIVE_GLOW =
  "drop-shadow(0 0 14px #e8257a) drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 3px #e8257a)";

function getLayerGlow(isDone: boolean, isActive: boolean): string {
  if (isDone) return "none";
  if (isActive) return ACTIVE_GLOW;
  return IDLE_GLOW;
}

function deriveRole(shot: string): PlayerRole {
  if (shot === "pace" || shot === "spin") return "bowler";
  if (shot === "keeping1" || shot === "keeping2") return "keeper";
  return "batter";
}

function CustomizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const shot = searchParams.get("shot") ?? "alpha";
  const country = searchParams.get("country") ?? "India";

  const sources = getCharacterSources(deriveRole(shot), shot);
  const hitmapSrc = `${sources.base.slice(0, sources.base.lastIndexOf("/") + 1)}hitmap.png`;

  const { styles, update, reset } = useCountryTheme(country);

  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null
  );
  const [isDone, setIsDone] = useState(false);
  const [areaSize, setAreaSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [activeKey, setActiveKey] = useState<keyof CharacterColors | null>(
    null
  );

  const characterAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hitmapRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // The hitmap may finish loading before React attaches onLoad (cached image,
  // complete=true on mount) — check on mount so we don't hang on "Loading…".
  useEffect(() => {
    const img = hitmapRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      setDims({ width: img.naturalWidth, height: img.naturalHeight });
    }
  }, []);

  function handleHitmapLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setDims({ width: img.naturalWidth, height: img.naturalHeight });
  }

  // Track the character area's size so the layout responds to viewport
  // resizes and device rotation without reading window dimensions.
  useEffect(() => {
    const el = characterAreaRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setAreaSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fit the character in the available area while preserving the exact
  // aspect ratio. Hit-test math is unaffected: it divides by
  // rect.width/height, which shrink together with the container.
  const displayScale =
    dims && areaSize
      ? Math.min(
          (areaSize.width - 32) / dims.width,
          (areaSize.height - 32) / dims.height
        )
      : 0;
  const displayWidth = Math.floor((dims?.width ?? 0) * displayScale);
  const displayHeight = Math.floor((dims?.height ?? 0) * displayScale);
  const ready = displayWidth > 0 && displayHeight > 0;

  // ColorPopover closes itself on document-level mousedown outside its own
  // ref, which would fire on character clicks and make the popover flicker
  // closed/open. A synthetic onMouseDown stopPropagation can't block it:
  // in the App Router React delegates events on `document`, the same node
  // the popover listens on, and stopPropagation doesn't affect same-node
  // listeners. A native listener on the container stops the event below
  // document, before the popover's listener sees it.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stop = (e: MouseEvent) => e.stopPropagation();
    el.addEventListener("mousedown", stop);
    return () => el.removeEventListener("mousedown", stop);
  }, [ready]);

  const hitTestAt = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      const hitmap = hitmapRef.current;
      if (isDone || !container || !hitmap || !dims) return;

      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
        canvasRef.current.width = 1;
        canvasRef.current.height = 1;
      }
      const ctx = canvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const intrinsicX = Math.floor(
        ((clientX - rect.left) / rect.width) * dims.width
      );
      const intrinsicY = Math.floor(
        ((clientY - rect.top) / rect.height) * dims.height
      );

      ctx.clearRect(0, 0, 1, 1);
      ctx.drawImage(hitmap, intrinsicX, intrinsicY, 1, 1, 0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;

      if (a < 10) return;

      const hex = [r, g, b]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
      setActiveKey(COLOR_TO_KEY[hex] ?? null);
    },
    [dims, isDone]
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

  const handleColorChange = useCallback(
    (color: string) => {
      if (!activeKey) return;
      update({ character: { ...styles.character, [activeKey]: color } });
    },
    [activeKey, styles.character, update]
  );

  function handleReset() {
    reset();
    setIsDone(false);
    setActiveKey(null);
  }

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
    // Mirrors the root layout chrome: 112px top padding everywhere, plus a
    // 60px bottom inset on mobile (pb-[60px] md:pb-0) for the bottom bar.
    <main className="h-[calc(100vh-172px)] md:h-[calc(100vh-112px)] flex flex-col bg-zinc-950 text-white overflow-hidden">
      <PageHeader
        title="Customize"
        back={{ label: country }}
        subtitle={
          <span className="text-zinc-500 text-sm font-body tracking-wide">
            — changes apply to all {country} cards across the app
          </span>
        }
        right={
          <div className="h-12 w-full sm:w-40 overflow-visible">
            <BatSwitch
              options={MODE_OPTIONS}
              value="tap"
              onChange={(v) => {
                if (v === "form") {
                  router.push(
                    `/card-builder?country=${encodeURIComponent(country)}`
                  );
                }
              }}
            />
          </div>
        }
      />

      {/* Hidden hitmap — drives container dimensions and canvas hit-testing */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={hitmapRef}
        src={hitmapSrc}
        alt=""
        className="hidden"
        onLoad={handleHitmapLoad}
      />

      {/* Character area — fills remaining height */}
      <div
        ref={characterAreaRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
      >
        {!ready ? (
          <p className="text-zinc-500 text-sm font-body">Loading…</p>
        ) : (
          <div
            ref={containerRef}
            onClick={handleClick}
            onTouchStart={handleTouch}
            className="relative cursor-crosshair touch-none"
            style={{
              width: displayWidth,
              height: displayHeight,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sources.base}
              alt="Character base"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            />
            {coloredLayers.map(({ key, src }) => {
              const color = styles.character[key];
              return (
                <div
                  key={src}
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    filter: getLayerGlow(isDone, activeKey === key),
                    transition: "filter 0.15s ease",
                    isolation: "isolate",
                  }}
                >
                  {/* Original PNG — visible, provides shape, shadow, highlight detail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  />
                  {/* Hue overlay — shifts color while preserving luminance from original */}
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

        {/* Popover floats over character */}
        {activeKey && !isDone && (
          <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none">
            <div className="pointer-events-auto">
              <ColorPopover
                label={KEY_LABELS[activeKey]}
                value={styles.character[activeKey]}
                onChange={handleColorChange}
                onClose={() => setActiveKey(null)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-t border-zinc-800">
        <p className="text-zinc-500 text-xs font-body tracking-wide">
          {isDone
            ? "colours locked in — looking good!"
            : "tap any part of the character to change its colour"}
        </p>

        <div className="flex items-center gap-3">
          {isDone ? (
            <>
              <div className="w-24">
                <CardButton variant="secondary" onClick={handleReset}>
                  Reset
                </CardButton>
              </div>
              <div className="w-40">
                <CardButton
                  variant="primary"
                  onClick={() =>
                    router.push(
                      `/card-builder?country=${encodeURIComponent(country)}`
                    )
                  }
                >
                  Back to Builder
                </CardButton>
              </div>
            </>
          ) : (
            <div className="w-28">
              <CardButton
                variant="primary"
                onClick={() => {
                  setIsDone(true);
                  setActiveKey(null);
                }}
              >
                Done
              </CardButton>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={null}>
      <CustomizeContent />
    </Suspense>
  );
}
