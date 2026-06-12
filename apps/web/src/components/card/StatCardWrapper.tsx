"use client";

import React from "react";
import { CARD_WIDTH, CARD_HEIGHT, CARD_SCALES } from "@/constants/card";

export interface StatCardWrapperProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

/**
 * StatCardWrapper scales the native 750x1050px stat card to a smaller
 * footprint. Default scale comes from CARD_SCALES.preview (240x336px).
 */
export function StatCardWrapper({
  children,
  scale = CARD_SCALES.preview,
  className = "",
}: StatCardWrapperProps) {
  const scaledWidth = CARD_WIDTH * scale;
  const scaledHeight = CARD_HEIGHT * scale;

  return (
    <div
      className={`relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-xl border-2 border-card-border flex-shrink-0 ${className}`}
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
