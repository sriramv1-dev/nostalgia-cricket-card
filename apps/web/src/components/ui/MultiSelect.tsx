import { useState, useRef, useEffect } from "react";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allLabel?: string;
  badgeColor?: string;
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  allLabel = "All",
  badgeColor = "#e8257a",
}: MultiSelectProps) {
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

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleSelectOnly = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    onChange([option]);
  };

  const isAllSelected = selected.length === 0 || selected.length === options.length;

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[13px] tracking-wide text-white/55 hover:bg-white/5 transition-colors group"
      >
        <span className="group-hover:text-white/80 transition-colors">{label}</span>
        {selected.length > 0 && (
          <span 
            className="text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none"
            style={{ backgroundColor: badgeColor }}
          >
            {selected.length}
          </span>
        )}
        <span className="text-[9px] opacity-40 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 bg-zinc-900 border border-zinc-700 rounded-xl p-2 z-50 min-w-[200px] shadow-2xl animate-in fade-in zoom-in duration-150">
          {/* Select All Option */}
          <div
            onClick={() => onChange([])}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 font-semibold text-[13px] tracking-wide border-b border-white/5 mb-1 group"
          >
            <div
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] shrink-0 transition-all ${
                selected.length === 0
                  ? "border-transparent text-white"
                  : "border-white/20"
              }`}
              style={{ backgroundColor: selected.length === 0 ? badgeColor : 'transparent' }}
            >
              {selected.length === 0 && "✓"}
            </div>
            <span className={selected.length === 0 ? "text-white" : "text-white/60 group-hover:text-white/80"}>
              {allLabel}
            </span>
          </div>

          {/* Individual Options */}
          <div className="max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 font-semibold text-[13px] tracking-wide text-white/60 group transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] shrink-0 transition-all ${
                        isSelected
                          ? "border-transparent text-white"
                          : "border-white/20"
                      }`}
                      style={{ backgroundColor: isSelected ? badgeColor : 'transparent' }}
                    >
                      {isSelected && "✓"}
                    </div>
                    <span className={`truncate ${isSelected ? "text-white" : "group-hover:text-white/80"}`}>
                      {option}
                    </span>
                  </div>
                  
                  {/* Select Only Feature */}
                  <button
                    onClick={(e) => handleSelectOnly(e, option)}
                    className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white/70 hover:text-white transition-all shrink-0"
                  >
                    only
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
