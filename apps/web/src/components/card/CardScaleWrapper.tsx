import type { ReactNode } from "react";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_SCALES,
  CARD_DISPLAY,
  type CardScale,
} from "@/constants/card";

interface CardScaleWrapperProps {
  scale: CardScale;
  children: ReactNode;
}

export function CardScaleWrapper({ scale, children }: CardScaleWrapperProps) {
  const { width, height } = CARD_DISPLAY[scale];
  const factor = CARD_SCALES[scale];

  return (
    <div
      style={{
        width,
        height,
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${factor})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
