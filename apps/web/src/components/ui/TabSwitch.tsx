"use client";

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
}

export function TabSwitch({ options, value, onChange, className }: TabSwitchProps) {
  return (
    <div 
      className={cn(
        "relative flex p-1 bg-white/[0.03] border border-white/10 rounded-2xl w-fit",
        className
      )}
    >
      {/* Sliding background pill */}
      <motion.div
        className="absolute inset-y-1 rounded-xl bg-white/10 border border-white/5 shadow-xl"
        initial={false}
        animate={{
          x: options.findIndex((o) => o.id === value) * (100 / options.length) + "%",
          width: 100 / options.length + "%",
        }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        style={{
          width: `calc(${100 / options.length}% - 8px)`,
          left: "4px",
        }}
      />

      {options.map((option) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold tracking-wide transition-colors z-10 min-w-[100px]",
              isActive ? "text-white" : "text-white/40 hover:text-white/60"
            )}
          >
            {option.icon && (
              <span className={cn("transition-transform duration-200", isActive ? "scale-110" : "scale-100")}>
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
