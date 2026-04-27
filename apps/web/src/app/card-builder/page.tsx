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
import { SectionLabel, CardButton } from "@/components/ui";
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
  if (role === "batter") return ["cap", "capAccent", "gloves", "pads", "shoes", "bat"];
  if (role === "allrounder") return ["cap", "capAccent", "gloves", "pads", "shoes", "bat"];
  if (role === "keeper") {
    const base: Array<keyof CharacterColors> = ["cap", "capAccent", "gloves", "pads", "shoes", "wickets"];
    if (shot === "keeping1") return [...base, "ball"];
    return base;
  }
  return ["cap", "capAccent", "shoes"];
}

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

function CardBuilderPageInner() {
  const searchParams = useSearchParams();
  const countryParam = searchParams.get("country");
  const roleParam = searchParams.get("role") as PlayerRole | null;

  const [selectedCountry, setSelectedCountry] = useState(countryParam ?? "India");
  const [selectedRole, setSelectedRole] = useState<PlayerRole>(roleParam ?? "batter");
  const [selectedShot, setSelectedShot] = useState<ShotType>(
    DEFAULT_SHOT[roleParam ?? "batter"]
  );
  const [editMode, setEditMode] = useState<"form" | "tap">("form");
  const [presetName, setPresetName] = useState("");
  const [activeTab, setActiveTab] = useState<"card" | "character" | "presets">("card");

  const { styles, save, reset, update } = useCountryTheme(selectedCountry);

  useTitle(
    countryParam
      ? [{ label: "Card Builder", href: "/card-builder" }, { label: selectedCountry }]
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
            <span className="font-display text-sm tracking-widest text-white flex-shrink-0">
              {selectedCountry}
            </span>
            <span className="text-zinc-500 text-xs font-mono ml-3 tracking-wide">
              — changes apply to all {selectedCountry} cards across the app
            </span>
          </>
        }
        right={
          <button
            onClick={() => setEditMode((m) => (m === "form" ? "tap" : "form"))}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest transition-all ${
              editMode === "tap"
                ? "bg-pink-500 text-white"
                : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            }`}
          >
            {editMode === "tap" ? "Tap Mode" : "Form Mode"}
          </button>
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
          <div className="flex-1 max-w-md flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-zinc-900 rounded-2xl p-1">
              {(["card", "character", "presets"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-xs tracking-widest font-bold transition-all ${
                    activeTab === tab
                      ? "bg-pink-500 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
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
                <div className="grid grid-cols-4 gap-2">
                  {(["batter", "bowler", "allrounder", "keeper"] as PlayerRole[]).map((role, i) => (
                    <button
                      key={role}
                      tabIndex={5 + i}
                      onClick={() => handleRoleChange(role)}
                      className={`py-2 rounded-xl text-xs tracking-widest font-bold transition-all ${
                        selectedRole === role
                          ? "bg-pink-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {/* Shot selector */}
                <SectionLabel className="mt-2">Shot</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_SHOTS[selectedRole].map((shot) => (
                    <button
                      key={shot}
                      onClick={() => setSelectedShot(shot)}
                      className={`py-2 rounded-xl text-xs tracking-widest font-bold transition-all ${
                        selectedShot === shot
                          ? "bg-yellow-400 text-zinc-900"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {shot}
                    </button>
                  ))}
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
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  tabIndex={20}
                  className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
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
                <CardButton
                  variant="secondary"
                  tabIndex={23}
                  onClick={reset}
                >
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
