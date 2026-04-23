import type { CharacterColors } from "@/components/card/LayeredCharacter";

export interface CountryStyles {
  border: string;
  bgStart: string;
  bgEnd: string;
  textColor: string;
  character: CharacterColors;
}

export function getCountryStyles(country: string): CountryStyles {
  const styles: Record<string, CountryStyles> = {
    India: {
      border: "#0038A8",
      bgStart: "#f0f7ff",
      bgEnd: "#cfe3ff",
      textColor: "#ffffff",
      character: {
        cap: "#0038A8",
        capAccent: "#FF9933",
        gloves: "#0038A8",
        pads: "#ffffff",
        shoes: "#ffffff",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    },
    Australia: {
      border: "#FFCD00",
      bgStart: "#fffdf5",
      bgEnd: "#fff2c2",
      textColor: "#00401A",
      character: {
        cap: "#00401A",
        capAccent: "#FFCD00",
        gloves: "#FFCD00",
        pads: "#FFCD00",
        shoes: "#00401A",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    },
    "Sri Lanka": {
      border: "#000080",
      bgStart: "#f0f0ff",
      bgEnd: "#d1d1ff",
      textColor: "#ffffff",
      character: {
        cap: "#000080",
        capAccent: "#FFCD00",
        gloves: "#FFCD00",
        pads: "#ffffff",
        shoes: "#ffffff",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    },
    Pakistan: {
      border: "#00401A",
      bgStart: "#f2fdf5",
      bgEnd: "#d4f7de",
      textColor: "#ffffff",
      character: {
        cap: "#00401A",
        capAccent: "#ffffff",
        gloves: "#00401A",
        pads: "#00401A",
        shoes: "#ffffff",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    },
    "South Africa": {
      border: "#007749",
      bgStart: "#f5fdf9",
      bgEnd: "#dcf7eb",
      textColor: "#ffffff",
      character: {
        cap: "#007749",
        capAccent: "#FFCD00",
        gloves: "#FFCD00",
        pads: "#007749",
        shoes: "#ffffff",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    },
    "West Indies": {
      border: "#7B0041",
      bgStart: "#fdf5f9",
      bgEnd: "#f7d4e6",
      textColor: "#ffffff",
      character: {
        cap: "#7B0041",
        capAccent: "#FFCD00",
        gloves: "#7B0041",
        pads: "#7B0041",
        shoes: "#ffffff",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    },
    England: {
      border: "#CE1126",
      bgStart: "#fff5f5",
      bgEnd: "#ffdada",
      textColor: "#ffffff",
      character: {
        cap: "#000080",
        capAccent: "#ffffff",
        gloves: "#000080",
        pads: "#ffffff",
        shoes: "#ffffff",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    },
    "New Zealand": {
      border: "#000000",
      bgStart: "#fcfcfc",
      bgEnd: "#e0e0e0",
      textColor: "#ffffff",
      character: {
        cap: "#000000",
        capAccent: "#ffffff",
        gloves: "#000000",
        pads: "#000000",
        shoes: "#000000",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    },
    Zimbabwe: {
      border: "#E4332E",
      bgStart: "#fff7f7",
      bgEnd: "#ffe0e0",
      textColor: "#ffffff",
      character: {
        cap: "#E4332E",
        capAccent: "#FFCD00",
        gloves: "#E4332E",
        pads: "#E4332E",
        shoes: "#ffffff",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    },
    Bangladesh: {
      border: "#006A4E",
      bgStart: "#f5fdf9",
      bgEnd: "#dcf7eb",
      textColor: "#ffffff",
      character: {
        cap: "#006A4E",
        capAccent: "#ffffff",
        gloves: "#006A4E",
        pads: "#006A4E",
        shoes: "#ffffff",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    },
  };
  return (
    styles[country] || {
      border: "#CE1126",
      bgStart: "#f8f5e9",
      bgEnd: "#f2ead0",
      textColor: "#ffffff",
      character: {
        cap: "#CE1126",
        capAccent: "#ffffff",
        gloves: "#CE1126",
        pads: "#CE1126",
        shoes: "#ffffff",
        bat: "#8B4513",
        ball: "#CE1126",
      },
    }
  );
}

export function getCountryCode(country: string): string {
  const codes: Record<string, string> = {
    India: "IND",
    Australia: "AUS",
    "Sri Lanka": "SL",
    Pakistan: "PAK",
    "South Africa": "SA",
    England: "ENG",
    "West Indies": "WI",
    "New Zealand": "NZ",
    Zimbabwe: "ZIM",
    Bangladesh: "BAN",
  };
  return codes[country] || country.slice(0, 3).toUpperCase();
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    India: "🇮🇳",
    Australia: "🇦🇺",
    "Sri Lanka": "🇱🇰",
    Pakistan: "🇵🇰",
    "South Africa": "🇿🇦",
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "West Indies": "🌴",
    "New Zealand": "🇳🇿",
    Zimbabwe: "🇿🇼",
    Bangladesh: "🇧🇩",
  };
  return flags[country] || "🏏";
}
