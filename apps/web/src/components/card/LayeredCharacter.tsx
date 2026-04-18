"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence, MotionProps } from "framer-motion";
export interface CharacterColors {
  cap: string
  capAccent: string
  gloves: string
  pads: string
  shoes: string
  bat?: string
  ball?: string
  wickets?: string
}

export interface LayeredCharacterSources {
  /** Base layer — skin, hair, jersey body (no tint applied). */
  base: string;
  cap?: string;
  capAccent?: string;
  gloves?: string;
  pads?: string;
  shoes?: string;
  bat?: string;
  batOutline?: string;
  ball?: string;
  wickets?: string;
}

interface LayeredCharacterProps {
  sources: LayeredCharacterSources;
  colors: CharacterColors;
  /** Visual width in the unscaled 750×1050 coordinate space. */
  width?: number;
  /** Visual height in the unscaled 750×1050 coordinate space. */
  height?: number;
  className?: string;
  motionProps?: MotionProps;
}

const defaultMotion: MotionProps = {
  animate: {
    y: [0, -15, 0],
    rotate: [0.5, -0.5, 0.5],
  },
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
};

/**
 * LayeredCharacter composites pre-split PNG layers, applying a CSS mask-image
 * tint to each colorable part. All sizing is in the unscaled 750×1050px
 * coordinate space; BrandCard scales the result via transform.
 */
export const LayeredCharacter: React.FC<LayeredCharacterProps> = ({
  sources,
  colors,
  width = 500,
  height = 425,
  className = "",
  motionProps,
}) => {
  const activeMotion = motionProps ?? defaultMotion;

  const coloredLayers: Array<{ src: string; color: string }> = [];

  if (sources.cap) coloredLayers.push({ src: sources.cap, color: colors.cap });
  if (sources.capAccent) coloredLayers.push({ src: sources.capAccent, color: colors.capAccent });
  if (sources.gloves) coloredLayers.push({ src: sources.gloves, color: colors.gloves });
  if (sources.pads) coloredLayers.push({ src: sources.pads, color: colors.pads });
  if (sources.shoes) coloredLayers.push({ src: sources.shoes, color: colors.shoes });
  if (sources.bat && colors.bat) coloredLayers.push({ src: sources.bat, color: colors.bat });
  if (sources.batOutline && colors.bat) coloredLayers.push({ src: sources.batOutline, color: colors.bat });
  if (sources.ball && colors.ball) coloredLayers.push({ src: sources.ball, color: colors.ball });
  if (sources.wickets && colors.wickets) coloredLayers.push({ src: sources.wickets, color: colors.wickets });

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={sources.base}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.75, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.15, filter: "blur(12px)" }}
          transition={{
            opacity: { duration: 0.25, ease: "easeInOut" },
            scale: { type: "spring", stiffness: 300, damping: 22 },
            filter: { duration: 0.25, ease: "easeInOut" },
          }}
        >
          <motion.div className="relative w-full h-full" {...activeMotion}>
            {/* Base layer — rendered as a normal image, no tint */}
            <Image
              src={sources.base}
              alt="Character base"
              fill
              sizes={`${width}px`}
              unoptimized
              className="object-contain pointer-events-none select-none"
              priority
            />

            {/* Colored layers — render original image for full detail, then apply a
                color-blend overlay so hue/saturation shifts while luminance (shadows,
                highlights, gradients) is preserved from the source PNG. */}
            {coloredLayers.map(({ src, color }) => (
              <div
                key={src}
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{ isolation: "isolate" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain select-none"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: color,
                    mixBlendMode: "color",
                    WebkitMaskImage: `url(${src})`,
                    maskImage: `url(${src})`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
