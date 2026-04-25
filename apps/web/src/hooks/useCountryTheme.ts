"use client";

import { useState, useEffect, useCallback } from "react";
import { getCountryStyles } from "@/constants/countries";
import type { CountryTheme, CountryStyles } from "@/types/card";

const STORAGE_KEY = (country: string) => `card-theme:${country}`;

function loadTheme(country: string): CountryStyles {
  if (typeof window === "undefined") return getCountryStyles(country);
  try {
    const raw = localStorage.getItem(STORAGE_KEY(country));
    if (!raw) return getCountryStyles(country);
    const theme = JSON.parse(raw) as CountryTheme;
    return {
      border: theme.border,
      bgStart: theme.bgStart,
      bgEnd: theme.bgEnd,
      textColor: theme.textColor,
      character: theme.character,
    };
  } catch {
    return getCountryStyles(country);
  }
}

function saveTheme(theme: CountryTheme): void {
  localStorage.setItem(
    STORAGE_KEY(theme.country),
    JSON.stringify({ ...theme, savedAt: new Date().toISOString() })
  );
}

function clearTheme(country: string): void {
  localStorage.removeItem(STORAGE_KEY(country));
}

export function useCountryTheme(country: string) {
  const [styles, setStyles] = useState<CountryStyles>(() => getCountryStyles(country));

  useEffect(() => {
    setStyles(loadTheme(country));
  }, [country]);

  const save = useCallback((theme: CountryTheme) => {
    saveTheme(theme);
    setStyles(loadTheme(theme.country));
  }, []);

  const reset = useCallback(() => {
    clearTheme(country);
    setStyles(getCountryStyles(country));
  }, [country]);

  const update = useCallback((partial: Partial<CountryStyles>) => {
    setStyles((prev) => ({ ...prev, ...partial }));
  }, []);

  return { styles, save, reset, update };
}
