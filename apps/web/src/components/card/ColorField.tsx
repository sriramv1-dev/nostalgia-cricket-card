"use client";

import { useState, useEffect } from "react";

export interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  tabIndex: number;
}

export function ColorField({ label, value, onChange, tabIndex }: ColorFieldProps) {
  const [hex, setHex] = useState(value);

  useEffect(() => {
    setHex(value);
  }, [value]);

  function commit() {
    const clean = hex.startsWith("#") ? hex : `#${hex}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) onChange(clean);
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        tabIndex={tabIndex}
        onChange={(e) => {
          setHex(e.target.value);
          onChange(e.target.value);
        }}
        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
      />
      <span className="text-zinc-400 text-xs tracking-widest w-28 flex-shrink-0">
        {label}
      </span>
      <div className="flex items-center flex-1 bg-zinc-800 rounded-xl px-3 py-2 gap-1">
        <span className="text-zinc-500 text-sm">#</span>
        <input
          type="text"
          value={hex.replace("#", "")}
          maxLength={6}
          tabIndex={tabIndex}
          onChange={(e) => setHex(`#${e.target.value}`)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="flex-1 bg-transparent text-sm font-body text-white focus:outline-none"
        />
      </div>
      <div
        className="w-8 h-8 rounded-lg border border-zinc-700 flex-shrink-0"
        style={{ backgroundColor: value }}
      />
    </div>
  );
}
