"use client";

import Link from "next/link";
import Image from "next/image";
import type { PlayerRow, PlayerStatsRow } from "@/types/database.types";
import { LayeredCharacter } from "@/components/card/LayeredCharacter";
import { getCountryCode, getCountryFlag } from "@/constants/countries";
import { getCharacterSources } from "@/constants/characters";
import { CARD_WIDTH, CARD_HEIGHT, CARD_LOGO } from "@/constants/card";
import { useCountryTheme } from "@/hooks";
import type { CountryStyles } from "@/types/card";

interface CricketCardProps {
  player: PlayerRow;
  stats?: PlayerStatsRow | null;
  variant: "player" | "brand";
  themeOverride?: CountryStyles;
  noLink?: boolean;
}

function CardFooter({
  player,
  stats,
  countryStyles,
}: {
  player: PlayerRow;
  stats?: PlayerStatsRow | null;
  countryStyles: CountryStyles;
}) {
  const isBowler = player.role === "bowler" || player.role === "allrounder";
  const matches = isBowler ? stats?.bowl_matches : stats?.bat_matches;
  const secondaryStatValue = isBowler
    ? stats?.bowl_average
    : stats?.bat_average;
  const primaryStatLabel = isBowler ? "Wkts" : "Runs";
  const primaryStatValue = isBowler ? stats?.bowl_wickets : stats?.bat_runs;

  return (
    <div className="w-full flex gap-3 pb-12 px-12">
      <div
        className="rounded-[2rem] w-24 flex items-center justify-center py-6 shadow-inner flex-shrink-0"
        style={{ backgroundColor: countryStyles.border }}
      >
        <span
          className="font-display text-4xl uppercase rotate-[-90deg] whitespace-nowrap tracking-widest font-bold"
          style={{ color: countryStyles.textColor }}
        >
          {getCountryCode(player.country)}
        </span>
      </div>
      <div className="flex-1 bg-yellow-400 border-[5px] border-green-800 rounded-[2rem] overflow-hidden flex flex-col shadow-lg">
        <div className="bg-yellow-400 border-b-[5px] border-green-800 px-6 py-2 flex justify-center items-center gap-4">
          <span className="text-5xl leading-none">
            {getCountryFlag(player.country)}
          </span>
          <p className="font-display text-4xl text-red-600 uppercase font-bold leading-none truncate">
            {player.name}
          </p>
        </div>
        <div className="flex-1 bg-yellow-400 border-b-[5px] border-green-800 px-6 py-2 flex justify-between items-center text-green-900 font-display font-extrabold text-2xl uppercase">
          <span>Matches</span>
          <span>{matches ?? 0}</span>
        </div>
        <div className="flex-1 flex bg-yellow-400 text-green-900 font-display font-extrabold text-2xl uppercase">
          <div className="flex-1 border-r-[5px] border-green-800 px-6 py-2 flex justify-between items-center">
            <span>Avg.</span>
            <span>{secondaryStatValue ?? "-"}</span>
          </div>
          <div className="flex-1 px-6 py-2 flex justify-between items-center">
            <span>{primaryStatLabel}</span>
            <span>{primaryStatValue ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CricketCard({
  player,
  stats,
  variant,
  themeOverride,
  noLink = false,
}: CricketCardProps) {
  const { styles: countryStyles } = useCountryTheme(player.country);
  const activeStyles = themeOverride ?? countryStyles;
  const characterSources = getCharacterSources(player.role, player.shot);
  const isBrand = variant === "brand";

  const cardClassName = `block relative overflow-hidden select-none transition-transform duration-200 hover:scale-[1.02]${isBrand ? "" : " shadow-2xl"}`;
  const cardStyle = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: activeStyles.border,
  };

  const cardContent = (
    <>
      {/* Inner Panel */}
      <div
        className="absolute inset-[30px] rounded-[3rem] overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${activeStyles.bgStart}, ${activeStyles.bgEnd})`,
        }}
      />
      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center">
        {/* Logo */}
        <div
          className="relative flex-shrink-0 mt-10"
          style={{
            width: isBrand ? CARD_LOGO.brand.width : "100%",
            height: isBrand ? CARD_LOGO.brand.height : CARD_LOGO.player.height,
          }}
        >
          <Image
            src="/images/card/logo-no-bg.png"
            alt="Nostalgia Cricket"
            fill
            sizes={isBrand ? "500px" : undefined}
            unoptimized
            className="object-contain"
            priority
          />
        </div>
        {/* Character */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
          <LayeredCharacter
            sources={characterSources}
            colors={activeStyles.character}
            width={580}
            height={580}
            animate={isBrand}
          />
        </div>
        {/* Footer */}
        <CardFooter
          player={player}
          stats={stats}
          countryStyles={activeStyles}
        />
      </div>
    </>
  );

  if (noLink) {
    return (
      <div className={cardClassName} style={cardStyle}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={isBrand ? "/card-builder" : `/players/${player.id}`}
      className={cardClassName}
      style={cardStyle}
    >
      {cardContent}
    </Link>
  );
}
