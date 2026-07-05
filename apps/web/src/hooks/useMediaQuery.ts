"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook. Returns `null` until the first client render
 * so callers can avoid mounting the wrong tree during hydration.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handle = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handle);
    return () => mql.removeEventListener("change", handle);
  }, [query]);

  return matches;
}
