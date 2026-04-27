import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Rarity } from "@/types";

const rarityBadge = cva(
  "inline-flex items-center font-bold tracking-widest rounded-full",
  {
    variants: {
      rarity: {
        common: "bg-gray-800 text-gray-300 border border-gray-600",
        uncommon: "bg-green-900/40 text-green-300 border border-green-700/60",
        rare: "bg-blue-900/40 text-blue-300 border border-blue-700/60",
        legendary: "bg-yellow-900/40 text-yellow-300 border border-yellow-600/60",
      },
      size: {
        xs: "text-[9px] px-1.5 py-0.5 gap-1",
        sm: "text-[11px] px-2 py-0.5 gap-1",
        md: "text-xs px-2.5 py-1 gap-1.5",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
);

const DOT_COLORS: Record<Rarity, string> = {
  common: "bg-gray-400",
  uncommon: "bg-green-400",
  rare: "bg-blue-400",
  legendary: "bg-yellow-400",
};

const DOT_SIZES = {
  xs: "w-1 h-1",
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
};

interface RarityBadgeProps extends VariantProps<typeof rarityBadge> {
  rarity: Rarity;
  showDot?: boolean;
  className?: string;
}

export function RarityBadge({
  rarity,
  size = "sm",
  showDot = true,
  className,
}: RarityBadgeProps) {
  return (
    <span className={cn(rarityBadge({ rarity, size }), className)}>
      {showDot && (
        <span
          className={cn(
            "rounded-full flex-shrink-0",
            DOT_COLORS[rarity],
            DOT_SIZES[size ?? "sm"]
          )}
        />
      )}
      {rarity}
    </span>
  );
}
