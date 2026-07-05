"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe media query hook. Returns `null` until the first client render
 * so callers can avoid mounting the wrong tree during hydration.
 */
export function useMediaQuery(query: string): boolean | null {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => null
  );
}
