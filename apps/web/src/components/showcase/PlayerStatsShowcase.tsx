"use client";

import { useState, useEffect } from "react";
import { SHOT_SOURCES } from "@/constants/characters";
import { getCountryStyles } from "@/constants/countries";
import { derivePlayerStats } from "@/lib/derivePlayerStats";
import { SECTION_COLORS } from "@/constants/theme";
import { SectionCard } from "./SectionCard";
import {
  StatsTable,
  type StatSection,
  type ActiveStatCell,
} from "./StatsTable";
import type {
  PlayerStatsShowcaseProps,
  CricketFormat,
} from "@/types/player-stats";

export function PlayerStatsShowcase({ player, stats }: PlayerStatsShowcaseProps) {
  const [activeCell, setActiveCell] = useState<ActiveStatCell>(null);

  useEffect(() => {
    if (!activeCell) return;
    function handleDocClick() {
      setActiveCell(null);
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, [activeCell]);

  const {
    presentFormats,
    battingRows,
    bowlingRows,
    fieldingRows,
    hasBatting,
    hasBowling,
    hasFielding,
  } = derivePlayerStats(player, stats);

  const characterColors = getCountryStyles(player.country).character;
  const battingSources = SHOT_SOURCES.alpha;
  const bowlingSources = SHOT_SOURCES.pace;

  function handleCellClick(
    section: StatSection,
    rowKey: string,
    format: CricketFormat,
    e: React.MouseEvent
  ) {
    e.stopPropagation();
    setActiveCell((prev) =>
      prev?.section === section &&
      prev?.rowKey === rowKey &&
      prev?.format === format
        ? null
        : { section, rowKey, format }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {hasBatting && (
        <SectionCard
          title="Batting"
          sectionColor={SECTION_COLORS.batting}
          imageLeft
          sources={battingSources}
          colors={characterColors}
        >
          <StatsTable
            rows={battingRows}
            formats={presentFormats}
            section="batting"
            activeCell={activeCell}
            onCellClick={(rowKey, fmt, e) =>
              handleCellClick("batting", rowKey, fmt, e)
            }
          />
        </SectionCard>
      )}

      {hasBowling && (
        <SectionCard
          title="Bowling"
          sectionColor={SECTION_COLORS.bowling}
          imageLeft={false}
          sources={bowlingSources}
          colors={characterColors}
        >
          <StatsTable
            rows={bowlingRows}
            formats={presentFormats}
            section="bowling"
            activeCell={activeCell}
            onCellClick={(rowKey, fmt, e) =>
              handleCellClick("bowling", rowKey, fmt, e)
            }
          />
        </SectionCard>
      )}

      {hasFielding && (
        <SectionCard title="Fielding" sectionColor={SECTION_COLORS.fielding}>
          <StatsTable
            rows={fieldingRows}
            formats={presentFormats}
            section="fielding"
            activeCell={activeCell}
            onCellClick={(rowKey, fmt, e) =>
              handleCellClick("fielding", rowKey, fmt, e)
            }
          />
        </SectionCard>
      )}
    </div>
  );
}
