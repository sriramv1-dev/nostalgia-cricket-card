"use client";

import { useState, useRef, useEffect } from "react";

interface ColorPopoverProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

export function ColorPopover({ label, value, onChange, onClose }: ColorPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState(value);

  useEffect(() => {
    setHex(value);
  }, [value]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  function handleHexCommit() {
    const clean = hex.startsWith("#") ? hex : `#${hex}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) onChange(clean);
  }

  return (
    <div
      ref={ref}
      className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3 min-w-[220px] border border-zinc-700"
    >
      <div className="flex items-center justify-between">
        <p className="text-zinc-400 text-[11px] tracking-[0.15em] uppercase m-0">
          {label}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-500 hover:text-white text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <input
        type="color"
        value={hex.startsWith("#") && hex.length === 7 ? hex : "#000000"}
        onChange={(e) => { setHex(e.target.value); onChange(e.target.value); }}
        className="w-full h-10 rounded-lg cursor-pointer border-0 bg-transparent"
      />
      <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2">
        <span className="text-zinc-500 text-sm">#</span>
        <input
          type="text"
          value={hex.replace("#", "")}
          maxLength={6}
          onChange={(e) => setHex(`#${e.target.value}`)}
          onBlur={handleHexCommit}
          onKeyDown={(e) => e.key === "Enter" && handleHexCommit()}
          className="flex-1 bg-transparent text-sm font-mono text-white focus:outline-none uppercase"
        />
        <div
          className="w-6 h-6 rounded-md border border-zinc-600 flex-shrink-0"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}
