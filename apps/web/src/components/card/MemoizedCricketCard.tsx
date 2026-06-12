"use client";

import { memo } from "react";
import { CricketCard } from "./CricketCard";

/**
 * Memoized wrapper for the sacred CricketCard — NCC rules forbid editing
 * CricketCard.tsx directly, so memoization lives here. Use this in grids
 * and lists where many cards re-render together.
 */
export const MemoizedCricketCard = memo(CricketCard);
