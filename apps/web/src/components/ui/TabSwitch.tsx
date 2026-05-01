"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabSwitchProps {
  options: TabOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  ballColor?: string;
}

export function TabSwitch({
  options,
  value,
  onChange,
  className,
  ballColor = "#e8257a",
}: TabSwitchProps) {
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
  }, []);

  const activeIndex = options.findIndex((o) => o.id === value);
  const step = 100 / options.length;
  const slotWidth = containerWidth / options.length;
  const activeX = (activeIndex + 0.5) * slotWidth;

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      {/* Bar */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-zinc-900 border border-white/5 rounded-xl shadow-2xl overflow-hidden"
        style={{ height: "calc(100% - 18px)" }}
      ></div>

      {/* Floating ball */}
      <motion.div
        className="absolute h-10 w-10 rounded-full border-[3px] border-zinc-950 z-20 flex items-center justify-center text-white"
        style={{
          bottom: "calc(100% - 36px)",
          backgroundColor: ballColor,
          boxShadow: `0 8px 20px -4px ${ballColor}99`,
        }}
        initial={false}
        animate={{ x: activeX - 20 }}
        transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
      >
        <div className="scale-90">{options[activeIndex]?.icon}</div>
      </motion.div>

      {/* Tab buttons */}
      {options.map((option, index) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "absolute bottom-0 z-10",
              !isActive && "flex flex-col items-center justify-center gap-1"
            )}
            style={{
              left: `${(index / options.length) * 100}%`,
              width: `${100 / options.length}%`,
              height: "calc(100% - 18px)",
            }}
          >
            <>
              {!isActive && <div className="text-zinc-300">{option.icon}</div>}
              <span
                className={cn(
                  "font-bold tracking-widest text-zinc-400",
                  isActive
                    ? "text-[9px] text-zinc-400"
                    : "text-[11px] text-zinc-200"
                )}
              >
                {option.label}
              </span>
            </>
          </button>
        );
      })}
    </div>
  );
}
