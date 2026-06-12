"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BatSwitchOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface BatSwitchProps {
  options: BatSwitchOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  ballColor?: string;
  handleColor?: string;
  handlePosition?: "left" | "right";
  showHandle?: boolean;
  iconSize?: number;
}

export function BatSwitch({
  options,
  value,
  onChange,
  className,
  ballColor = "#e8257a",
  handleColor = "#ec4899",
  handlePosition = "right",
  showHandle = true,
  iconSize = 18,
}: BatSwitchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.offsetWidth);
    const observer = new ResizeObserver(() =>
      setContainerWidth(el.offsetWidth)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options.length, handlePosition]);

  const activeIndex = options.findIndex((o) => o.id === value);
  const step = 100 / options.length;
  const slotWidth = containerWidth / options.length;
  const activeX = (activeIndex + 0.5) * slotWidth;

  const isLeft = handlePosition === "left";

  // Wrapper is the single source of truth for width
  const dynamicBatWidth = "100%";

  return (
    <div
      className={cn("relative h-full w-full overflow-visible z-50", className)}
    >
      <div
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center drop-shadow-2xl transition-all duration-500",
          isLeft ? "flex-row-reverse" : "flex-row"
        )}
        style={{ height: "calc(100% - 8px)", width: dynamicBatWidth }}
      >
        {/* Blade */}
        <div
          className="h-full bg-zinc-800 z-20 border-y border-white/10 relative shadow-[inset_0_2px_3px_rgba(255,255,255,0.1),inset_0_-3px_5px_rgba(0,0,0,0.4)] transition-all duration-500"
          style={{
            flex: showHandle ? 4 : 1,
            borderTopLeftRadius: !showHandle
              ? "35px 50%"
              : isLeft
                ? "35px 50%"
                : "6px",
            borderBottomLeftRadius: !showHandle
              ? "35px 50%"
              : isLeft
                ? "35px 50%"
                : "6px",
            borderTopRightRadius: !showHandle
              ? "35px 50%"
              : isLeft
                ? "6px"
                : "35px 50%",
            borderBottomRightRadius: !showHandle
              ? "35px 50%"
              : isLeft
                ? "6px"
                : "35px 50%",
            borderLeftWidth: isLeft ? "0px" : "1px",
            borderRightWidth: isLeft ? "1px" : "0px",
          }}
        >
          {/* Blade visual details */}
          <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
            <div
              className={cn(
                "absolute top-0 h-full bg-zinc-950/50 transition-all duration-500",
                isLeft ? "left-0" : "right-0"
              )}
              style={{
                width: "15%",
                clipPath: isLeft
                  ? "polygon(0 0, 100% 50%, 0 100%)"
                  : "polygon(100% 0, 0 50%, 100% 100%)",
              }}
            />
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[60%] border-y border-white/[0.03]" />
          </div>

          {/* Interactive zone — ResizeObserver measures this */}
          <div
            ref={containerRef}
            className="absolute inset-y-0 z-30 overflow-visible transition-all duration-500"
            style={{
              left: isLeft ? "24%" : "0",
              right: isLeft ? "0" : "24%",
            }}
          >
            {/* Sliding position tracker (no visual output) */}
            <motion.div
              className="absolute top-0 h-full pointer-events-none z-30"
              initial={false}
              animate={{ x: `${activeIndex * step}%`, width: `${step}%` }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
            />

            {/* Ball */}
            <motion.div
              className="absolute -top-5 w-10 h-10 rounded-full border-[3px] border-zinc-950 z-40 flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: ballColor,
                backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.2) 0%, transparent 60%)`,
                boxShadow: `inset -1px -2px 3px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.3), 0 6px 15px -4px ${ballColor === "#ffffff" ? "#aaaaaa" : ballColor}80`,
              }}
              initial={false}
              animate={{ x: activeX - 20 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
            >
              <div className="absolute inset-0 flex items-center justify-center -rotate-45 pointer-events-none opacity-25 mix-blend-overlay">
                <div className="w-full h-[4px] border-y-[1px] border-dashed border-white/60" />
              </div>
              <div
                className={cn(
                  "scale-90 relative z-10 flex items-center justify-center w-[18px] h-[18px]",
                  ballColor === "#ffffff" ? "text-zinc-900" : "text-white"
                )}
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={value}
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2 }}
                  >
                    {options[activeIndex]?.icon}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Tab buttons */}
            {options.map((option, index) => {
              const isActive = value === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => onChange(option.id)}
                  className={cn(
                    "absolute top-0 flex flex-col items-center justify-center z-30 transition-all duration-300 h-full"
                    // isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
                  )}
                  style={{
                    left: `${(index / options.length) * 100}%`,
                    width: `${100 / options.length}%`,
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    {(option.icon || isActive) && (
                      <div
                        className="flex items-center justify-center text-zinc-300"
                        style={{ width: iconSize, height: iconSize }}
                      >
                        {option.icon && !isActive && <>{option.icon}</>}
                      </div>
                    )}
                    <span
                      className={cn(
                        "font-bold tracking-widest",
                        isActive
                          ? "text-[9px] text-zinc-400"
                          : "text-[12px] text-zinc-200"
                      )}
                    >
                      {option.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showHandle !== false && (
          <>
            {/* Handle */}
            <div
              className={cn(
                "h-[40%] relative z-10 shrink-0 border-y border-white/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500",
                isLeft ? "-mr-4" : "-ml-4"
              )}
              style={{ flex: 1, backgroundColor: handleColor }}
            >
              <div
                className="absolute inset-0 opacity-25 mix-blend-multiply"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #000, #000 1.5px, transparent 1.5px, transparent 5px)",
                }}
              />
            </div>

            {/* Cap */}
            <div
              className={cn(
                "h-[44%] w-2.5 z-10 shadow-[inset_2px_0_4px_rgba(0,0,0,0.4)] shrink-0 border-y border-white/20 transition-all duration-500",
                isLeft ? "rounded-l-sm border-l" : "rounded-r-sm border-r"
              )}
              style={{
                backgroundColor: handleColor,
                filter: "brightness(0.75)",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
