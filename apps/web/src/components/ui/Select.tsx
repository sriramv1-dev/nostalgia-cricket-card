"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-zinc-800 hover:bg-zinc-700/80 rounded-xl px-4 py-3 text-white transition-all border border-white/5 focus:outline-none focus:ring-2 focus:ring-pink-500/50 group"
      >
        <span className={cn("truncate", !value && "text-zinc-500")}>
          {value || placeholder}
        </span>
        <span className={cn(
          "text-[10px] opacity-40 transition-transform duration-200",
          isOpen ? "rotate-180" : "rotate-0"
        )}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2 z-50 shadow-2xl animate-in fade-in zoom-in duration-150">
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
            {options.map((option) => {
              const isSelected = value === option;
              return (
                <div
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors font-semibold text-[13px] tracking-wide",
                    isSelected 
                      ? "bg-pink-500/10 text-pink-400" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
