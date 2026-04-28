"use client";

import { useRef, useState, useEffect } from "react";
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
      {/* The Main Bar — fills container minus ball radius at top */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-zinc-900 border border-white/5 rounded-xl shadow-2xl"
        style={{ height: "calc(100% - 18px)" }}
      >
        {/* The Sliding Curved Cutout (SVG Mask) */}
        <motion.div
          className="absolute top-0 h-full flex items-start justify-center pointer-events-none"
          initial={false}
          animate={{ x: `${activeIndex * step}%`, width: `${step}%` }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
        >
          {/*
            This SVG creates the "Dip" effect.
            It is filled with the background color of the page (zinc-950).
          */}
          <svg
            viewBox="0 0 100 40"
            className="w-full h-full -mt-[0.5px] fill-zinc-950"
            preserveAspectRatio="none"
          >
            <path d="M0 0 Q10 0 15 2 Q25 10 30 25 A20 20 0 0 0 70 25 Q75 10 85 2 Q90 0 100 0 V40 H0 Z" />
          </svg>
        </motion.div>
      </div>

      {/* The Floating Active Circle — centred on the bar's top edge */}
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

      {/* The Tab Buttons — absolutely positioned over the bar */}
      {options.map((option, index) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "absolute bottom-0 flex flex-col items-center justify-end z-10",
              isActive ? "pb-0.5" : "pb-1.5"
            )}
            style={{
              left: `${(index / options.length) * 100}%`,
              width: `${100 / options.length}%`,
              height: "calc(100% - 18px)",
            }}
          >
            <span
              className={cn(
                "font-bold tracking-widest",
                isActive
                  ? "text-[7px] text-white/80"
                  : "text-[12px] text-white/80"
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
