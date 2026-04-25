"use client";

import { useState, useEffect } from "react";
import type { PlayerRow, PlayerRole } from "@/types/database.types";
import type { CharacterColors } from "@/types/card";
import {
  CardScaleWrapper,
  CricketCard,
  CharacterHotspotOverlay,
} from "@/components/card";
import { useCountryTheme } from "@/hooks";
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
      <span className="text-zinc-400 text-xs uppercase tracking-widest w-28 flex-shrink-0">
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
          className="flex-1 bg-transparent text-sm font-mono uppercase text-white focus:outline-none"
        />
      </div>
      <div
        className="w-8 h-8 rounded-lg border border-zinc-700 flex-shrink-0"
        style={{ backgroundColor: value }}
      />
    </div>
  );
}

export default function CardBuilderPage() {
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedRole, setSelectedRole] = useState<PlayerRole>("batter");
  const [selectedShot, setSelectedShot] = useState<ShotType>(DEFAULT_SHOT["batter"]);
  const [cardVariant, setCardVariant] = useState<"player" | "brand">("brand");
  const [editMode, setEditMode] = useState<"form" | "tap">("form");
  const [presetName, setPresetName] = useState("");
  const [activeTab, setActiveTab] = useState<"card" | "character" | "presets">("card");

  const { styles, save, reset, update } = useCountryTheme(selectedCountry);

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
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800">
        <h1 className="font-display text-2xl uppercase tracking-widest text-pink-400">
          Card Builder
        </h1>
        <div className="flex gap-3">
          {/* Card variant toggle */}
          <button
            onClick={() =>
              setCardVariant((v) => (v === "player" ? "brand" : "player"))
            }
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold uppercase tracking-widest transition-all"
          >
            {cardVariant === "player" ? "Player" : "Brand"}
          </button>
          {/* Edit mode toggle */}
          <button
            onClick={() => setEditMode((m) => (m === "form" ? "tap" : "form"))}
            className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
              editMode === "tap"
                ? "bg-pink-500 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            }`}
          >
            {editMode === "tap" ? "Tap Mode" : "Form Mode"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row gap-8 p-8 items-start justify-center">
        {/* Left — Card Preview */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <div className="relative">
            <CardScaleWrapper scale="detail">
              <CricketCard
                player={PREVIEW_PLAYER}
                stats={null}
                variant={cardVariant}
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
                  className={`flex-1 py-2 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
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
                <p className="text-zinc-400 text-xs uppercase tracking-widest">Role</p>
                <div className="grid grid-cols-4 gap-2">
                  {(["batter", "bowler", "allrounder", "keeper"] as PlayerRole[]).map((role, i) => (
                    <button
                      key={role}
                      tabIndex={5 + i}
                      onClick={() => handleRoleChange(role)}
                      className={`py-2 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
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
                <p className="text-zinc-400 text-xs uppercase tracking-widest mt-2">Shot</p>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_SHOTS[selectedRole].map((shot) => (
                    <button
                      key={shot}
                      onClick={() => setSelectedShot(shot)}
                      className={`py-2 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${
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
                <button
                  tabIndex={22}
                  onClick={() =>
                    save({
                      ...styles,
                      country: selectedCountry,
                      presetName,
                      savedAt: "",
                    })
                  }
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl uppercase tracking-widest transition-all"
                >
                  Save & Apply to {selectedCountry}
                </button>
                <button
                  tabIndex={23}
                  onClick={reset}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold py-3 rounded-xl uppercase tracking-widest transition-all"
                >
                  Reset to Default
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
