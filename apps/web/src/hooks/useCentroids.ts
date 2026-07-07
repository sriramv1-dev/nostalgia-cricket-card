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
 */
export function useCentroids(shotType: ShotType): UseCentroidsResult {
  const [centroids, setCentroids] = useState<CentroidData | null>(
    () => centroidCache.get(shotType) ?? null
  );
  const [loading, setLoading] = useState(!centroidCache.has(shotType));

  useEffect(() => {
    const cached = centroidCache.get(shotType);
    if (cached) {
      setCentroids(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(`/data/centroids/${shotType}.json`)
      .then((r) => r.json())
      .then((data: CentroidData) => {
        centroidCache.set(shotType, data);
        if (!cancelled) {
          setCentroids(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [shotType]);

  return { centroids, loading };
}
