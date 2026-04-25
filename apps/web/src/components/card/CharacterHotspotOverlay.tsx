"use client";

import { useState, useRef, useEffect } from "react";
import type { CharacterColors } from "@/types/card";

interface Hotspot {
  key: keyof CharacterColors;
  label: string;
  top: string;
  left: string;
  width: string;
  height: string;
}

const HOTSPOTS: Hotspot[] = [
  { key: "cap",       label: "Cap",       top: "2%",  left: "30%", width: "40%", height: "18%" },
  { key: "capAccent", label: "Cap Brim",  top: "18%", left: "20%", width: "60%", height: "10%" },
  { key: "gloves",    label: "Gloves",    top: "45%", left: "55%", width: "30%", height: "20%" },
  { key: "pads",      label: "Pads",      top: "60%", left: "25%", width: "50%", height: "20%" },
  { key: "shoes",     label: "Shoes",     top: "80%", left: "20%", width: "60%", height: "15%" },
  { key: "bat",       label: "Bat",       top: "30%", left: "60%", width: "25%", height: "40%" },
  { key: "ball",      label: "Ball",      top: "25%", left: "5%",  width: "20%", height: "20%" },
  { key: "wickets",   label: "Wickets",   top: "50%", left: "5%",  width: "25%", height: "35%" },
];

interface ColorPopoverProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
  anchorStyle: React.CSSProperties;
}

function ColorPopover({ label, value, onChange, onClose, anchorStyle }: ColorPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState(value);

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
      className="absolute z-50 bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-3 min-w-[200px]"
      style={anchorStyle}
    >
      <p className="font-display text-sm uppercase tracking-widest text-zinc-500">{label}</p>
      <input
        type="color"
        value={hex.startsWith("#") && hex.length === 7 ? hex : "#000000"}
        onChange={(e) => { setHex(e.target.value); onChange(e.target.value); }}
        className="w-full h-10 rounded-lg cursor-pointer border-0"
      />
      <div className="flex gap-2 items-center">
        <span className="text-zinc-400 text-sm">#</span>
        <input
          type="text"
          value={hex.replace("#", "")}
          maxLength={6}
          onChange={(e) => setHex(`#${e.target.value}`)}
          onBlur={handleHexCommit}
          onKeyDown={(e) => e.key === "Enter" && handleHexCommit()}
          className="flex-1 border border-zinc-200 rounded-lg px-3 py-1 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>
    </div>
  );
}

interface CharacterHotspotOverlayProps {
  colors: CharacterColors;
  activeKeys?: Array<keyof CharacterColors>;
  onChange: (key: keyof CharacterColors, color: string) => void;
}

export function CharacterHotspotOverlay({ colors, activeKeys, onChange }: CharacterHotspotOverlayProps) {
  const [active, setActive] = useState<keyof CharacterColors | null>(null);

  const visibleHotspots = activeKeys
    ? HOTSPOTS.filter((h) => activeKeys.includes(h.key))
    : HOTSPOTS;

  const activeHotspot = visibleHotspots.find((h) => h.key === active);

  return (
    <div className="absolute inset-0 z-30">
      {visibleHotspots.map((spot) => (
        <button
          key={spot.key}
          tabIndex={0}
          aria-label={`Edit ${spot.label} color`}
          className="absolute rounded-full hover:bg-white/20 hover:ring-2 hover:ring-white/60 transition-all cursor-crosshair focus:outline-none focus:ring-2 focus:ring-pink-400"
          style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
          onClick={() => setActive(spot.key)}
        />
      ))}
      {active && activeHotspot && (
        <ColorPopover
          label={activeHotspot.label}
          value={colors[active]}
          onChange={(color) => onChange(active, color)}
          onClose={() => setActive(null)}
          anchorStyle={{ top: activeHotspot.top, left: "105%" }}
        />
      )}
    </div>
  );
}
