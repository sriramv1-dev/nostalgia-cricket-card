"use client";

import { useEffect, useState } from "react";
import type { ShotType } from "@/constants/characters";
import type { CentroidData } from "@/types/card";

// Module-level cache so repeated mounts / shot switches never re-fetch the
// same centroid JSON.
const centroidCache = new Map<ShotType, CentroidData>();

export interface UseCentroidsResult {
  centroids: CentroidData | null;
  loading: boolean;
}

/**
 * Fetch + cache the centroid JSON for a shot. Deliberately keeps the
 * previous shot's data until the new centroids resolve, so switching shots
 * never flashes or jumps. SSR-safe: the fetch only runs in an effect.
 *
 * The cache is read during render (the source of truth); state exists only
 * to keep the previous shot's data visible while a fetch is in flight and
 * to re-render when a fetch settles.
 */
export function useCentroids(shotType: ShotType): UseCentroidsResult {
  const [previous, setPrevious] = useState<CentroidData | null>(
    () => centroidCache.get(shotType) ?? null
  );
  const [failedShot, setFailedShot] = useState<ShotType | null>(null);

  const cached = centroidCache.get(shotType) ?? null;

  useEffect(() => {
    if (centroidCache.has(shotType)) return;

    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/data/centroids/${shotType}.json`);
        const data = (await response.json()) as CentroidData;
        centroidCache.set(shotType, data);
        if (!cancelled) setPrevious(data);
      } catch {
        if (!cancelled) setFailedShot(shotType);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [shotType]);

  return {
    centroids: cached ?? previous,
    loading: cached == null && failedShot !== shotType,
  };
}
