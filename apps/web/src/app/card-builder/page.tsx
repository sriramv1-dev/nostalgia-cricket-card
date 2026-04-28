"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { PlayerRow, PlayerRole } from "@/types/database.types";
import type { CharacterColors } from "@/types/card";
import {
  CardScaleWrapper,
  CricketCard,
  CharacterHotspotOverlay,
} from "@/components/card";
import { useCountryTheme, useTitle } from "@/hooks";
import { PageHeader } from "@/components/layout";
import { SectionLabel, CardButton, Select, TabSwitch } from "@/components/ui";
import {
  ROLE_SHOTS,
  DEFAULT_SHOT,
  type ShotType,
} from "@/constants/characters";

const COUNTRIES = [
  "India",
  "Australia",
  "England",
  "Pakistan",
  "South Africa",
  "West Indies",
  "Sri Lanka",
  "New Zealand",
  "Zimbabwe",
  "Bangladesh",
];

function getActiveKeys(
  role: PlayerRole,
  shot: ShotType
): Array<keyof CharacterColors> {
  if (role === "bowler") return ["cap", "capAccent", "shoes", "ball"];
  if (role === "batter")
    return ["cap", "capAccent", "gloves", "pads", "shoes", "bat"];
  if (role === "allrounder")
    return ["cap", "capAccent", "gloves", "pads", "shoes", "bat"];
  if (role === "keeper") {
    const base: Array<keyof CharacterColors> = [
      "cap",
      "capAccent",
      "gloves",
      "pads",
      "shoes",
      "wickets",
    ];
    if (shot === "keeping1") return [...base, "ball"];
    return base;
  }
  return ["cap", "capAccent", "shoes"];
}

const ROLE_OPTIONS = [
  {
    id: "batter" as const,
    label: "Batter",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20L16 4" />
        <path d="M16 4l4 4" />
        <path d="M4 20l4-4" />
      </svg>
    ),
  },
  {
    id: "bowler" as const,
    label: "Bowler",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3c2 4 2 14 0 18" />
        <path d="M3 12c4-2 14-2 18 0" />
      </svg>
    ),
  },
  {
    id: "allrounder" as const,
    label: "All",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17L9 5" />
        <path d="M9 5l3 3" />
        <circle cx="17" cy="15" r="4" />
      </svg>
    ),
  },
  {
    id: "keeper" as const,
    label: "Keeper",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-4 0v5" />
        <path d="M14 10V4a2 2 0 0 0-4 0v6" />
        <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
        <path d="M6 14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2.5" />
      </svg>
    ),
  },
];

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  tabIndex: number;
}

function ColorField({ label, value, onChange, tabIndex }: ColorFieldProps) {
  const [hex, setHex] = useState(value);

  useEffect(() => {
    setHex(value);
  }, [value]);

  function commit() {
    const clean = hex.startsWith("#") ? hex : `#${hex}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) onChange(clean);
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        tabIndex={tabIndex}
        onChange={(e) => {
          setHex(e.target.value);
          onChange(e.target.value);
        }}
        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
      />
      <span className="text-zinc-400 text-xs tracking-widest w-28 flex-shrink-0">
        {label}
      </span>
      <div className="flex items-center flex-1 bg-zinc-800 rounded-xl px-3 py-2 gap-1">
        <span className="text-zinc-500 text-sm">#</span>
        <input
          type="text"
          value={hex.replace("#", "")}
          maxLength={6}
          tabIndex={tabIndex}
          onChange={(e) => setHex(`#${e.target.value}`)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="flex-1 bg-transparent text-sm font-mono text-white focus:outline-none"
        />
      </div>
      <div
        className="w-8 h-8 rounded-lg border border-zinc-700 flex-shrink-0"
        style={{ backgroundColor: value }}
      />
    </div>
  );
}

const MODE_OPTIONS = [
  {
    id: "form" as const,
    label: "Form",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "tap" as const,
    label: "Tap",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11V6a2 2 0 0 1 4 0v5" />
        <path d="M13 11V8a2 2 0 0 1 4 0v5" />
        <path d="M17 11V9.5a2 2 0 0 1 4 0V17a4 4 0 0 1-4 4h-3a4 4 0 0 1-3.16-1.53L5 12a2 2 0 0 1 2.72-2.93L9 11" />
      </svg>
    ),
  },
];

const TAB_OPTIONS = [
  {
    id: "card" as const,
    label: "Card",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
      </svg>
    ),
  },
  {
    id: "character" as const,
    label: "Character",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    id: "presets" as const,
    label: "Presets",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
];

function CardBuilderPageInner() {
  const searchParams = useSearchParams();
  const countryParam = searchParams.get("country");
  const roleParam = searchParams.get("role") as PlayerRole | null;

  const [selectedCountry, setSelectedCountry] = useState(
    countryParam ?? "India"
  );
  const [selectedRole, setSelectedRole] = useState<PlayerRole>(
    roleParam ?? "batter"
  );
  const [selectedShot, setSelectedShot] = useState<ShotType>(
    DEFAULT_SHOT[roleParam ?? "batter"]
  );
  const [editMode, setEditMode] = useState<"form" | "tap">("form");
  const [presetName, setPresetName] = useState("");
  const [activeTab, setActiveTab] = useState<"card" | "character" | "presets">(
    "card"
  );

  const { styles, save, reset, update } = useCountryTheme(selectedCountry);

  useTitle(
    countryParam
      ? [
          { label: "Card Builder", href: "/card-builder" },
          { label: selectedCountry },
        ]
      : [{ label: "Card Builder" }]
  );

  function handleRoleChange(role: PlayerRole) {
    setSelectedRole(role);
    setSelectedShot(DEFAULT_SHOT[role]);
  }

  const PREVIEW_PLAYER: PlayerRow & { shot?: ShotType } = {
    id: "preview",
    name: "Benny Thunderbat",
    country: selectedCountry,
    role: selectedRole,
    shot: selectedShot,
    photo_url: null,
    is_active: true,
    external_id: "preview",
    synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <PageHeader
        title="Card Builder"
        subtitle={
          <>
            <span className="font-display text-md tracking-widest text-white flex-shrink-0">
              {selectedCountry}
            </span>
            <span className="text-zinc-500 text-sm font-mono ml-3 tracking-wide">
              — changes apply to all {selectedCountry} cards across the app
            </span>
          </>
        }
        right={
          <div className="h-12 w-[120px] overflow-visible">
            <TabSwitch
              options={MODE_OPTIONS}
              value={editMode}
              onChange={(v) => setEditMode(v as "form" | "tap")}
            />
          </div>
        }
      />

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row gap-8 p-8 items-start justify-center">
        {/* Left — Card Preview */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <div className="relative">
            <CardScaleWrapper scale="detail">
              <CricketCard
                player={PREVIEW_PLAYER}
                stats={null}
                variant="brand"
                themeOverride={styles}
              />
            </CardScaleWrapper>
            {editMode === "tap" && (
              <CharacterHotspotOverlay
                colors={styles.character}
                activeKeys={getActiveKeys(selectedRole, selectedShot)}
                onChange={(key, color) =>
                  update({ character: { ...styles.character, [key]: color } })
                }
              />
            )}
          </div>
        </div>

        {/* Right — Form Panel (hidden in tap mode) */}
        {editMode === "form" && (
          <div className="flex-1 min-w-0 max-w-md flex flex-col gap-4">
            {/* Tabs */}
            <div className="h-12 w-full overflow-visible">
              <TabSwitch
                options={TAB_OPTIONS}
                value={activeTab}
                onChange={(v) => setActiveTab(v as "card" | "character" | "presets")}
              />
            </div>

            {/* Tab: Card */}
            {activeTab === "card" && (
              <div className="flex flex-col gap-4">
                <ColorField
                  label="Border"
                  value={styles.border}
                  onChange={(v) => update({ border: v })}
                  tabIndex={1}
                />
                <ColorField
                  label="Background Top"
                  value={styles.bgStart}
                  onChange={(v) => update({ bgStart: v })}
                  tabIndex={2}
                />
                <ColorField
                  label="Background Bottom"
                  value={styles.bgEnd}
                  onChange={(v) => update({ bgEnd: v })}
                  tabIndex={3}
                />
                <ColorField
                  label="Text Color"
                  value={styles.textColor}
                  onChange={(v) => update({ textColor: v })}
                  tabIndex={4}
                />
              </div>
            )}

            {/* Tab: Character */}
            {activeTab === "character" && (
              <div className="flex flex-col gap-4">
                {/* Role selector */}
                <SectionLabel>Role</SectionLabel>
                <div className="h-12 w-full overflow-visible">
                  <TabSwitch
                    options={ROLE_OPTIONS}
                    value={selectedRole}
                    onChange={(v) => handleRoleChange(v as PlayerRole)}
                  />
                </div>

                {/* Shot selector */}
                <SectionLabel className="mt-2">Shot</SectionLabel>
                <div className="h-12 w-full overflow-visible">
                  <TabSwitch
                    options={ROLE_SHOTS[selectedRole].map((shot) => ({
                      id: shot,
                      label: shot,
                    }))}
                    value={selectedShot}
                    onChange={(v) => setSelectedShot(v as ShotType)}
                    ballColor="#facc15"
                  />
                </div>

                {/* Character color fields */}
                {getActiveKeys(selectedRole, selectedShot).map((key, i) => (
                  <ColorField
                    key={key}
                    label={key}
                    value={styles.character[key]}
                    onChange={(v) =>
                      update({ character: { ...styles.character, [key]: v } })
                    }
                    tabIndex={10 + i}
                  />
                ))}
              </div>
            )}

            {/* Tab: Presets */}
            {activeTab === "presets" && (
              <div className="flex flex-col gap-4">
                <Select
                  options={COUNTRIES}
                  value={selectedCountry}
                  onChange={setSelectedCountry}
                  className="w-full"
                />
                <input
                  type="text"
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  tabIndex={21}
                  className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <CardButton
                  variant="primary"
                  tabIndex={22}
                  onClick={() =>
                    save({
                      ...styles,
                      country: selectedCountry,
                      presetName,
                      savedAt: "",
                    })
                  }
                >
                  Save & Apply to {selectedCountry}
                </CardButton>
                <CardButton variant="secondary" tabIndex={23} onClick={reset}>
                  Reset to Default
                </CardButton>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CardBuilderPage() {
  return (
    <Suspense fallback={null}>
      <CardBuilderPageInner />
    </Suspense>
  );
}
