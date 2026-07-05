"use client";

import { cva } from "class-variance-authority";
import { ACCESSORY_LABELS } from "@/constants/characters";
import type { CharacterColors } from "@/types/card";
import { cn } from "@/lib/utils";
import { hexToHSL, hslToHex } from "@/lib/color";

const swatchButton = cva("w-10 h-10 rounded-full border-2 flex-shrink-0", {
  variants: {
    selected: {
      true: "border-zinc-300",
      false: "border-zinc-700",
    },
  },
});

export interface ColorEditorPanelProps {
  activeKey: keyof CharacterColors;
  colors: Partial<CharacterColors>;
  swatches: Record<keyof CharacterColors, string[]>;
  onUpdateColor: (key: keyof CharacterColors, color: string) => void;
  onResetKey: (key: keyof CharacterColors) => void;
}

export function ColorEditorPanel({
  activeKey,
  colors,
  swatches,
  onUpdateColor,
  onResetKey,
}: ColorEditorPanelProps) {
  const hex = colors[activeKey] ?? "#888888";
  const [h, s, l] = hexToHSL(hex);

  return (
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
          onClick={() => onResetKey(activeKey)}
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
              onClick={() => onUpdateColor(activeKey, swatch)}
              aria-label={swatch}
              className={cn(swatchButton({ selected: isSelected }))}
              style={{ backgroundColor: swatch }}
            />
          );
        })}
      </div>

      <input
        type="range"
        min={0}
        max={360}
        value={h}
        aria-label="Hue"
        onChange={(e) =>
          onUpdateColor(
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
    </>
  );
}
