"use client";

import { SHOT_SOURCES, type ShotType } from "@/constants/characters";
import { cn } from "@/lib/utils";

export interface PoseThumbnailProps {
  shotType: ShotType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function PoseThumbnail({ shotType, label, isActive, onClick }: PoseThumbnailProps) {
  const src = SHOT_SOURCES[shotType].base;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 w-full flex-shrink-0 rounded-xl p-1 lg:p-1.5 transition-colors",
        isActive
          ? "border border-zinc-400 bg-zinc-800"
          : "border border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-850"
      )}
    >
      <div className="w-full aspect-[3/4] relative overflow-hidden rounded-lg bg-zinc-950">
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
