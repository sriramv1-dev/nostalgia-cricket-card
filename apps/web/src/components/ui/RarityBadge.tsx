import { cn } from "@/lib/utils";
import type { Rarity } from "@/types";

interface RarityBadgeProps {
  rarity: Rarity;
  size?: "xs" | "sm" | "md";
  showDot?: boolean;
  className?: string;
}

const RARITY_STYLES: Record<Rarity, string> = {
  common: "bg-gray-800 text-gray-300 border border-gray-600",
  uncommon: "bg-green-900/40 text-green-300 border border-green-700/60",
  rare: "bg-blue-900/40 text-blue-300 border border-blue-700/60",
  legendary: "bg-yellow-900/40 text-yellow-300 border border-yellow-600/60",
};

const RARITY_DOT: Record<Rarity, string> = {
  common: "bg-gray-400",
  uncommon: "bg-green-400",
  rare: "bg-blue-400",
  legendary: "bg-yellow-400",
};

const SIZE_STYLES = {
  xs: "text-[9px] px-1.5 py-0.5 gap-1",
  sm: "text-[11px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
};

const DOT_SIZES = {
  xs: "w-1 h-1",
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
};

export function RarityBadge({
  rarity,
  size = "sm",
  showDot = true,
  className,
}: RarityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold uppercase tracking-widest rounded-full",
        RARITY_STYLES[rarity],
        SIZE_STYLES[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full flex-shrink-0",
            RARITY_DOT[rarity],
            DOT_SIZES[size]
          )}
        />
      )}
      {rarity}
    </span>
  );
}
