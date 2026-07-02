"use client";

import {
  getCountryStyles,
  getCountryFlag,
  getCountryCode,
} from "@/constants/countries";
import { cn } from "@/lib/utils";

export interface CountryThumbnailProps {
  country: string;
  isActive: boolean;
  onClick: () => void;
}

export function CountryThumbnail({ country, isActive, onClick }: CountryThumbnailProps) {
  const { character } = getCountryStyles(country);
  const flag = getCountryFlag(country);
  const code = getCountryCode(country);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 w-full flex-shrink-0 rounded-xl p-1 lg:p-1.5 transition-colors",
        isActive
          ? "border border-zinc-400 bg-zinc-800"
          : "border border-zinc-800 bg-zinc-900 hover:border-zinc-600"
      )}
    >
      <div
        className="w-full aspect-[3/4] rounded-lg relative overflow-hidden flex items-center justify-center"
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
