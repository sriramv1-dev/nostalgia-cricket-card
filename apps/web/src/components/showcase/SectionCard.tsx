import { cn } from "@/lib/utils";
import { LayeredCharacter } from "@/components/card/LayeredCharacter";
import type { LayeredCharacterSources } from "@/components/card/LayeredCharacter";
import type { CharacterColors } from "@/types/card";

export interface SectionCardProps {
  title: string;
  sectionColor: string;
  imageLeft?: boolean;
  sources?: LayeredCharacterSources;
  colors?: Partial<CharacterColors>;
  children: React.ReactNode;
}

export function SectionCard({
  title,
  sectionColor,
  imageLeft = true,
  sources,
  colors = {},
  children,
}: SectionCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      {/* Full-width section header */}
      <div className="px-5 py-2.5" style={{ backgroundColor: sectionColor }}>
        <h3 className="font-bangers text-2xl text-white tracking-widest leading-none">
          {title}
        </h3>
      </div>

      {sources ? (
        /* Two-column: character panel (40%) + stats (60%) */
        <div
          className={cn(
            "flex flex-col",
            imageLeft ? "md:flex-row" : "md:flex-row-reverse"
          )}
        >
          {/* Character panel — transparent, no background */}
          <div className="min-h-[200px] md:min-h-0 self-stretch md:w-2/5 relative flex-shrink-0 overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-center">
              <LayeredCharacter sources={sources} colors={colors} width={400} height={340} animate />
            </div>
          </div>
          {/* Stats */}
          <div className="flex-1 md:w-3/5 px-6 py-5 overflow-visible">{children}</div>
        </div>
      ) : (
        /* Single-column: full-width stats */
        <div className="px-6 py-5 overflow-visible">{children}</div>
      )}
    </div>
  );
}
