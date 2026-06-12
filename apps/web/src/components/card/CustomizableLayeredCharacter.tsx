"use client";

import { useRef } from "react";
import Image from "next/image";
import type { CharacterColors } from "@/types/card";
import type { LayeredCharacterSources } from "@/components/card/LayeredCharacter";

const KEY_TO_SOURCE: Array<{
  key: keyof CharacterColors;
  src: keyof LayeredCharacterSources;
}> = [
  { key: "cap",       src: "cap" },
  { key: "capAccent", src: "capAccent" },
  { key: "gloves",    src: "gloves" },
  { key: "pads",      src: "pads" },
  { key: "shoes",     src: "shoes" },
  { key: "bat",       src: "bat" },
  { key: "ball",      src: "ball" },
  { key: "wickets",   src: "wickets" },
];

const FILTER_IDLE   = "drop-shadow(0 0 5px #e8257a) drop-shadow(0 0 2px #e8257a)";
const FILTER_ACTIVE = "drop-shadow(0 0 14px #e8257a) drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 3px #e8257a)";

export interface CustomizableLayeredCharacterProps {
  sources: LayeredCharacterSources & { scale?: number };
  colors: Partial<CharacterColors>;
  width?: number;
  height?: number;
  className?: string;
  activeKey?: keyof CharacterColors | null;
  onLayerClick?: (key: keyof CharacterColors) => void;
}

export function CustomizableLayeredCharacter({
  sources,
  colors,
  width = 500,
  height = 425,
  className = "",
  activeKey,
  onLayerClick,
}: CustomizableLayeredCharacterProps) {
  const characterScale = sources.scale ?? 1;

  const visibleLayers = KEY_TO_SOURCE.filter(({ src }) => sources[src] != null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<Map<keyof CharacterColors | "batOutline", HTMLImageElement>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getCanvasContext = () => {
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      canvasRef.current = canvas;
    }
    return canvasRef.current.getContext("2d", { willReadFrequently: true });
  };

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const firstImg = Array.from(imgRefs.current.values()).find(
      (img) => img.complete && img.naturalHeight > 0
    );
    if (!firstImg) return;

    const intrinsicWidth  = firstImg.naturalWidth;
    const intrinsicHeight = firstImg.naturalHeight;
    const characterScale  = sources.scale ?? 1;

    const rect = containerRef.current.getBoundingClientRect();

    const effectiveWidth  = width  * characterScale;
    const effectiveHeight = height * characterScale;

    const fitScale = Math.min(rect.width / effectiveWidth, rect.height / effectiveHeight);

    const renderedWidth  = effectiveWidth  * fitScale;
    const renderedHeight = effectiveHeight * fitScale;

    const offsetX = (rect.width  - renderedWidth)  / 2;
    const offsetY = (rect.height - renderedHeight) / 2;

    const posX = (clientX - rect.left) - offsetX;
    const posY = (clientY - rect.top)  - offsetY;

    if (posX < 0 || posX > renderedWidth || posY < 0 || posY > renderedHeight) return;

    const intrinsicX = Math.floor((posX / renderedWidth)  * intrinsicWidth);
    const intrinsicY = Math.floor((posY / renderedHeight) * intrinsicHeight);

    const ctx = getCanvasContext();
    if (!ctx) return;

    const reversedLayers = [...visibleLayers].reverse();

    for (const { key, src } of reversedLayers) {
      const srcs: Array<keyof CharacterColors | "batOutline"> =
        src === "bat" ? ["bat", "batOutline"] : [key];

      for (const s of srcs) {
        const img = imgRefs.current.get(s);
        if (!img || !img.complete || img.naturalHeight === 0) continue;

        ctx.clearRect(0, 0, 1, 1);
        ctx.drawImage(img, intrinsicX, intrinsicY, 1, 1, 0, 0, 1, 1);
        const alpha = ctx.getImageData(0, 0, 1, 1).data[3];

        if (alpha > 10) {
          onLayerClick?.(key);
          return;
        }
      }
    }
  };

  const onClick = (e: React.MouseEvent) => handleInteraction(e.clientX, e.clientY);
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <div
        ref={containerRef}
        onClick={onClick}
        onTouchStart={onTouchStart}
        className="relative w-full h-full cursor-crosshair touch-none"
        style={{ scale: characterScale }}
      >
        {/* Base layer */}
        <Image
          src={sources.base}
          alt="Character base"
          fill
          sizes={`${width}px`}
          unoptimized
          className="object-contain pointer-events-none select-none"
          priority
        />

        {/* Colored layers */}
        {visibleLayers.map(({ key, src }) => {
          const layerSrc = sources[src] as string;
          const color = colors[key];
          const isActive = activeKey === key;

          return (
            <div
              key={key}
              aria-hidden
              className="absolute inset-0 isolate transition-[filter] duration-150"
              style={{
                pointerEvents: "none",
                filter: isActive ? FILTER_ACTIVE : FILTER_IDLE,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => { if (el) imgRefs.current.set(key, el); }}
                src={layerSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-contain select-none"
                style={{ pointerEvents: "none" }}
                draggable={false}
              />
              {color && (
                <div
                  className="absolute inset-0"
                  style={{
                    pointerEvents: "none",
                    backgroundColor: color,
                    mixBlendMode: "hue",
                    WebkitMaskImage: `url(${layerSrc})`,
                    maskImage: `url(${layerSrc})`,
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

        {/* batOutline ref — invisible, hit-test only */}
        {sources.batOutline && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={(el) => { if (el) imgRefs.current.set("batOutline", el); }}
            src={sources.batOutline}
            alt=""
            className="absolute inset-0 w-full h-full object-contain select-none"
            style={{ pointerEvents: "none", opacity: 0 }}
            draggable={false}
          />
        )}
      </div>
    </div>
  );
}
