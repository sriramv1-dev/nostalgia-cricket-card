"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PlayerRow, PlayerRole } from "@/types/database.types";
import { CardScaleWrapper, ColorField, CricketCard } from "@/components/card";
import { useCountryTheme, useTitle } from "@/hooks";
import { useAccessoryCustomization } from "@/hooks/useAccessoryCustomization";
import { PageHeader } from "@/components/layout";
import { CardButton, Select, BatSwitch, TabSwitch } from "@/components/ui";
import nextDynamic from "next/dynamic";

const CustomizerMobile = nextDynamic(
  () => import("@/components/card/CustomizerMobile").then((m) => m.CustomizerMobile),
  { ssr: false }
);
import {
  ROLE_SHOTS,
  DEFAULT_SHOT,
  ROLE_OPTIONS,
  MODE_OPTIONS,
  TAB_OPTIONS,
  getActiveKeys,
  type ShotType,
} from "@/constants/characters";
import { COUNTRY_NAMES } from "@/constants/countries";

function CardBuilderPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const countryParam = searchParams.get("country");
  const roleParam = searchParams.get("role") as PlayerRole | null;
  const fromParam = searchParams.get("from");
  const fromLabelParam = searchParams.get("fromLabel");

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
    "character"
  );

  const { styles, save, reset, update } = useCountryTheme(selectedCountry);
  const diagramCustomization = useAccessoryCustomization(selectedShot, selectedCountry);

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
    // Mirrors the root layout chrome: on mobile the root <main> only has a
    // nav-height bottom inset; on md+ it flips to a 112px top inset with no
    // bottom inset (md:pt-28 md:pb-0).
    <main className="h-[calc(100dvh-theme(spacing.nav)-env(safe-area-inset-bottom))] md:h-[calc(100vh-112px)] flex flex-col bg-zinc-950 text-white overflow-hidden">
      <PageHeader
        title="Card Builder"
        back={
          fromParam != null
            ? { label: fromLabelParam ?? "Back" }
            : undefined
        }
        subtitle={
          <>
            <span className="font-display text-md tracking-widest text-white flex-shrink-0">
              {selectedCountry}
            </span>
            <span className="text-zinc-500 text-sm font-body ml-3 tracking-wide">
              — changes apply to all {selectedCountry} cards across the app
            </span>
          </>
        }
        right={
          <div className="hidden md:block h-12 w-full sm:w-40 overflow-visible">
            <BatSwitch
              options={MODE_OPTIONS}
              value={editMode}
              onChange={(v) => {
                if (v === "tap") {
                  router.push(
                    `/admin/card-builder/customize?shot=${encodeURIComponent(selectedShot)}&country=${encodeURIComponent(selectedCountry)}`
                  );
                } else {
                  setEditMode("form");
                }
              }}
            />
          </div>
        }
      />

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row md:items-center md:justify-center md:px-8 md:py-4 overflow-hidden w-full">
        {/* Desktop Layout — card + form panel travel as one centred group */}
        <div className="hidden md:flex flex-row gap-8 items-start min-h-0 max-h-full">
          {/* Card Preview */}
          <div className="flex-shrink-0">
            <CardScaleWrapper scale="detail">
              <CricketCard
                player={PREVIEW_PLAYER}
                stats={null}
                variant="brand"
                themeOverride={styles}
              />
            </CardScaleWrapper>
          </div>

          {/* Form Panel — fixed width on md+ so the group centres predictably */}
          {editMode === "form" && (
            <div className="hidden md:flex w-full md:w-[400px] min-h-0 max-h-full flex-col gap-2 overflow-y-auto">
            {/* Tabs */}
            <div className="h-14 w-full overflow-visible">
              <TabSwitch
                options={TAB_OPTIONS}
                value={activeTab}
                onChange={(v) =>
                  setActiveTab(v as "card" | "character" | "presets")
                }
              />
            </div>

            {/* Tab: Card */}
            {activeTab === "card" && (
              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1 min-h-0">
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
              <>
                {/* Role selector - fixed */}
                <div className="h-14 w-full overflow-visible">
                  <TabSwitch
                    options={ROLE_OPTIONS}
                    value={selectedRole}
                    onChange={(v) => handleRoleChange(v as PlayerRole)}
                    // ballColor={styles.border}
                  />
                </div>

                {/* Shot selector - fixed */}
                <div className="h-12 w-full overflow-visible">
                  <BatSwitch
                    options={ROLE_SHOTS[selectedRole].map((shot) => ({
                      id: shot,
                      label: shot,
                      icon: null,
                    }))}
                    value={selectedShot}
                    onChange={(v) => setSelectedShot(v as ShotType)}
                    handlePosition="left"
                  />
                </div>

                {/* Color fields - scrollable */}
                <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1 min-h-0">
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
              </>
            )}

            {/* Tab: Presets */}
            {activeTab === "presets" && (
              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1 min-h-0">
                <Select
                  options={COUNTRY_NAMES}
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
        {/* Tap Mode — mobile only */}
        <div className="md:hidden flex-1 flex flex-col min-h-0 w-full">
          <CustomizerMobile
            shotType={selectedShot}
            country={selectedCountry}
            customization={diagramCustomization}
            onDone={() => router.push("/")}
          />
        </div>
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
