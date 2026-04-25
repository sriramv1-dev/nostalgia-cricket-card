"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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

const ROLE_PILL_CLASSES: Record<string, string> = {
  Batter: "bg-orange-900/30 text-orange-400 border border-orange-700/40",
  Bowler: "bg-purple-900/30 text-purple-400 border border-purple-700/40",
  Allrounder: "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40",
  Keeper: "bg-amber-900/30 text-amber-400 border border-amber-700/40",
};

const COUNTRY_PILL_CLASS =
  "bg-blue-900/50 text-blue-300 border border-blue-700/50";

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
  const [countryOpen, setCountryOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!countryRef.current?.contains(e.target as Node))
        setCountryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!roleRef.current?.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleCountry = (c: string) => {
    setSelectedCountries((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const removeCountry = (c: string) => {
    setSelectedCountries((prev) => prev.filter((x) => x !== c));
  };

  const toggleRole = (r: string) => {
    setSelectedRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
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
        <div className="relative shrink-0" ref={countryRef}>
          <button
            onClick={() => setCountryOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[13px] uppercase tracking-wide text-white/55 hover:bg-white/5 transition-colors"
          >
            Countries
            {selectedCountries.length > 0 && (
              <span className="bg-[#e8257a] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {selectedCountries.length}
              </span>
            )}
            <span className="text-[9px] opacity-40">
              {countryOpen ? "▴" : "▾"}
            </span>
          </button>
          {countryOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 bg-zinc-900 border border-zinc-700 rounded-xl p-2 z-50 min-w-[180px] shadow-xl">
              {COUNTRIES.map((c) => (
                <div
                  key={c}
                  onClick={() => toggleCountry(c)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 font-semibold text-[13px] uppercase tracking-wide text-white/60"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] shrink-0 transition-all ${
                      selectedCountries.includes(c)
                        ? "bg-[#e8257a]/40 border-[#e8257a] text-white"
                        : "border-white/20"
                    }`}
                  >
                    {selectedCountries.includes(c) && "✓"}
                  </div>
                  <span
                    className={selectedCountries.includes(c) ? "text-white" : ""}
                  >
                    {c}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1.5 shrink-0" />

        {/* Player Type dropdown */}
        <div className="relative shrink-0" ref={roleRef}>
          <button
            onClick={() => setRoleOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[13px] uppercase tracking-wide text-white/55 hover:bg-white/5 transition-colors"
          >
            Player Type
            {selectedRoles.length > 0 && (
              <span className="bg-[#e8257a] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {selectedRoles.length}
              </span>
            )}
            <span className="text-[9px] opacity-40">
              {roleOpen ? "▴" : "▾"}
            </span>
          </button>
          {roleOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 bg-zinc-900 border border-zinc-700 rounded-xl p-2 z-50 min-w-[160px] shadow-xl">
              {ROLES.map((r) => (
                <div
                  key={r}
                  onClick={() => toggleRole(r)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 font-semibold text-[13px] uppercase tracking-wide text-white/60"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] shrink-0 transition-all ${
                      selectedRoles.includes(r)
                        ? "bg-[#e8257a]/40 border-[#e8257a] text-white"
                        : "border-white/20"
                    }`}
                  >
                    {selectedRoles.includes(r) && "✓"}
                  </div>
                  <span
                    className={selectedRoles.includes(r) ? "text-white" : ""}
                  >
                    {r}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1.5 shrink-0" />

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="bg-[#e8257a] text-white font-bold text-[13px] uppercase tracking-wide px-4 py-1.5 rounded-xl shrink-0"
        >
          Search
        </button>
      </div>

      {/* Active pills row — full width, flex wrap */}
      {(selectedCountries.length > 0 || selectedRoles.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-3 w-full">
          {selectedCountries.map((c) => (
            <span
              key={c}
              className={`inline-flex items-center gap-1.5 rounded-full text-xs font-bold uppercase tracking-wide px-3 py-1 ${COUNTRY_PILL_CLASS}`}
            >
              {c}
              <button
                onClick={() => removeCountry(c)}
                className="opacity-60 hover:opacity-100 text-[11px] leading-none"
              >
                ✕
              </button>
            </span>
          ))}
          {selectedRoles.map((r) => (
            <span
              key={r}
              className={`inline-flex items-center gap-1.5 rounded-full text-xs font-bold uppercase tracking-wide px-3 py-1 ${ROLE_PILL_CLASSES[r]}`}
            >
              {r}
              <button
                onClick={() => removeRole(r)}
                className="opacity-60 hover:opacity-100 text-[11px] leading-none"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
