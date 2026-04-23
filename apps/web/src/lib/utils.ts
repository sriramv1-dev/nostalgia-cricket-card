import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const RARITY_COLORS: Record<string, string> = {
  common: "text-gray-400 border-gray-400",
  uncommon: "text-green-400 border-green-400",
  rare: "text-blue-400 border-blue-400",
  legendary: "text-yellow-400 border-yellow-400",
};

export const RARITY_GLOW: Record<string, string> = {
  common: "",
  uncommon: "shadow-green-400/20",
  rare: "shadow-blue-400/30",
  legendary: "shadow-yellow-400/50",
};
