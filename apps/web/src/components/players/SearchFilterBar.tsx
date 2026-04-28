"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleBadge, MultiSelect } from "@/components/ui";

const COUNTRIES = [
  "India",
  "Australia",
  "Pakistan",
  "England",
  "South Africa",
  "West Indies",
  "Sri Lanka",
  "New Zealand",
];

const ROLES = ["Batter", "Bowler", "Allrounder", "Keeper"];


interface SearchFilterBarProps {
  initialSearch: string;
  initialCountries: string[];
  initialRoles: string[];
}

export function SearchFilterBar({
  initialSearch,
  initialCountries,
  initialRoles,
}: SearchFilterBarProps) {
  const router = useRouter();

  const [searchText, setSearchText] = useState(initialSearch);
  const [selectedCountries, setSelectedCountries] =
    useState<string[]>(initialCountries);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);


  const toggleCountry = (c: string) => {
    setSelectedCountries((prev) => {
      if (prev.length === 0) return [c];
      if (prev.includes(c)) return prev.length === 1 ? [] : prev.filter((x) => x !== c);
      return [...prev, c];
    });
  };

  const removeCountry = (c: string) => {
    setSelectedCountries((prev) => prev.filter((x) => x !== c));
  };

  const toggleRole = (r: string) => {
    setSelectedRoles((prev) => {
      if (prev.length === 0) return [r];
      if (prev.includes(r)) return prev.length === 1 ? [] : prev.filter((x) => x !== r);
      return [...prev, r];
    });
  };

  const removeRole = (r: string) => {
    setSelectedRoles((prev) => prev.filter((x) => x !== r));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set("search", searchText.trim());
    selectedCountries.forEach((c) => params.append("country", c));
    selectedRoles.forEach((r) => params.append("role", r.toLowerCase()));
    router.push("/players?" + params.toString());
  };

  return (
    <div>
      {/* Unified bar */}
      <div className="flex items-center bg-white/[0.06] border border-white/[0.12] rounded-2xl px-2 py-1.5 gap-0">
        {/* Search icon + input */}
        <span className="text-white/30 px-2 text-sm">⌕</span>
        <input
          type="text"
          placeholder="Search players…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-[15px] px-2"
          style={{ fontFamily: "var(--font-barlow, sans-serif)" }}
        />

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1.5 shrink-0" />

        {/* Countries dropdown */}
        <MultiSelect
          label="Countries"
          options={COUNTRIES}
          selected={selectedCountries}
          onChange={setSelectedCountries}
          allLabel="All Countries"
        />

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1.5 shrink-0" />

        {/* Player Type dropdown */}
        <MultiSelect
          label="Player Type"
          options={ROLES}
          selected={selectedRoles}
          onChange={setSelectedRoles}
          allLabel="All Roles"
        />

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1.5 shrink-0" />

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="bg-[#e8257a] text-white font-bold text-[13px] tracking-wide px-4 py-1.5 rounded-xl shrink-0"
        >
          Search
        </button>
      </div>

      {/* Active filter pills — always visible */}
      <div className="flex flex-wrap gap-2 mt-3 w-full">
        {(selectedCountries.length === 0 ? COUNTRIES : selectedCountries).map((c) => {
          const isSelected = selectedCountries.includes(c);
          const isAllMode = selectedCountries.length === 0;
          
          return (
            <span
              key={c}
              onClick={() => isAllMode ? setSelectedCountries(COUNTRIES.filter(x => x !== c)) : toggleCountry(c)}
              className={`inline-flex items-center gap-1.5 rounded-full text-xs font-bold tracking-wide px-3 py-1 cursor-pointer transition-colors ${
                isAllMode || isSelected
                  ? "bg-blue-900/50 text-blue-300 border border-blue-700/50"
                  : "bg-zinc-800/60 text-zinc-500 border border-zinc-700/40 hover:text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {c}
              {(isAllMode || isSelected) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAllMode) {
                      setSelectedCountries(COUNTRIES.filter(x => x !== c));
                    } else {
                      removeCountry(c);
                    }
                  }}
                  className="opacity-60 hover:opacity-100 text-[11px] leading-none"
                >
                  ✕
                </button>
              )}
            </span>
          );
        })}

        <div className="w-px h-4 self-center bg-white/10 mx-1 shrink-0" />

        {(selectedRoles.length === 0 ? ROLES : selectedRoles).map((r) => {
          const isSelected = selectedRoles.includes(r);
          const isAllMode = selectedRoles.length === 0;
          const roleKey = r.toLowerCase() as "batter" | "bowler" | "allrounder" | "keeper";

          if (isAllMode || isSelected) {
            return (
              <RoleBadge
                key={r}
                role={roleKey}
                onClick={() => isAllMode ? setSelectedRoles(ROLES.filter(x => x !== r)) : toggleRole(r)}
                className="cursor-pointer"
              >
                {r}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAllMode) {
                      setSelectedRoles(ROLES.filter(x => x !== r));
                    } else {
                      removeRole(r);
                    }
                  }}
                  className="opacity-60 hover:opacity-100 text-[11px] leading-none"
                >
                  ✕
                </button>
              </RoleBadge>
            );
          }

          return (
            <span
              key={r}
              onClick={() => toggleRole(r)}
              className="inline-flex items-center gap-1.5 rounded-full text-xs font-bold tracking-wide px-3 py-1 cursor-pointer bg-zinc-800/60 text-zinc-500 border border-zinc-700/40 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
            >
              {r}
            </span>
          );
        })}
      </div>
    </div>
  );
}
