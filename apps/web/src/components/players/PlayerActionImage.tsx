import Image from "next/image";
import type { PlayerRow } from "@/types/database.types";
import { getCharacterSources } from "@/constants/characters";

interface PlayerActionImageProps {
  player: PlayerRow;
}

export function PlayerActionImage({ player }: PlayerActionImageProps) {
  const sources = getCharacterSources(player.role, null);
  const layers = [
    sources.base,
    sources.cap,
    sources.capAccent,
    sources.gloves,
    sources.pads,
    sources.shoes,
    sources.bat,
    sources.batOutline,
    sources.ball,
    sources.wickets,
  ].filter((src): src is string => Boolean(src));

  return (
    <div className="relative flex-1 w-full my-2 px-4">
      <div className="relative w-full h-full">
        {layers.map((src) => (
          <Image
            key={src}
            src={src}
            alt={`${player.name} character layer`}
            fill
            className="object-contain drop-shadow-2xl absolute inset-0"
            unoptimized
          />
        ))}
      </div>
    </div>
  );
}
