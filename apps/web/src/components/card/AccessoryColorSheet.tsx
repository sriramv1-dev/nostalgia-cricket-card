"use client";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { ACCESSORY_LABELS } from "@/constants/characters";
import type { UseAccessoryCustomizationResult } from "@/hooks/useAccessoryCustomization";
import type { CharacterColors } from "@/types/card";
import { cn } from "@/lib/utils";

export interface AccessoryColorSheetProps {
  /** The accessory being edited; null keeps the sheet closed. */
  accessoryKey: keyof CharacterColors | null;
  customization: UseAccessoryCustomizationResult;
  onClose: () => void;
}

export function AccessoryColorSheet({
  accessoryKey,
  customization,
  onClose,
}: AccessoryColorSheetProps) {
  const { colors, updateColor, resetKey, swatches } = customization;

  const color =
    accessoryKey != null
      ? ((colors[accessoryKey] as string | undefined) ?? "#888888")
      : "#888888";

  return (
    <BottomSheet isOpen={accessoryKey != null} onClose={onClose} height="35%">
      {accessoryKey != null && (
        <div className="flex flex-col gap-4 px-6 py-3">
          {/* Name + hex readout + reset */}
          <div className="flex items-center gap-3">
            <span className="flex-1 text-sm font-body tracking-widest uppercase text-zinc-300">
              {ACCESSORY_LABELS[accessoryKey]}
            </span>
            <span
              style={{ color }}
              className="text-xs font-body tracking-wide uppercase"
            >
              {color}
            </span>
            <button
              type="button"
              onClick={() => resetKey(accessoryKey)}
              className="text-zinc-500 hover:text-white text-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-zinc-800"
              aria-label="Reset to default"
            >
              ↺
            </button>
          </div>

          {/* Swatch row — palette comes from the shared accessory swatches */}
          <div className="flex flex-wrap gap-3">
            {swatches[accessoryKey].map((swatch) => {
              const isSelected =
                swatch.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => updateColor(accessoryKey, swatch)}
                  aria-label={swatch}
                  className={cn(
                    "w-11 h-11 rounded-full border-2 flex-shrink-0",
                    isSelected ? "border-zinc-300" : "border-zinc-700"
                  )}
                  style={{ backgroundColor: swatch }}
                />
              );
            })}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
