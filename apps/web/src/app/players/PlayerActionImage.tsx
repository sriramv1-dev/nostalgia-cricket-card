import Image from "next/image";
import type { PlayerRow } from "@/types/database.types";
import { ROLE_CONFIGS } from "@/constants/characters";

interface PlayerActionImageProps {
  player: PlayerRow;
}

export function PlayerActionImage({ player }: PlayerActionImageProps) {
  const config = ROLE_CONFIGS[player.role] || ROLE_CONFIGS.batter;

  return (
    <div className="relative flex-1 w-full my-2 px-4">
      <div className="relative w-full h-full">
        {config.parts.map((part) => (
          <Image
            key={part}
            src={`${config.dir}/${config.prefix}-${part}.png`}
            alt={`${player.name} ${part}`}
            fill
            className="object-contain drop-shadow-2xl absolute inset-0"
            unoptimized
          />
        ))}
      </div>
    </div>
  );
}
