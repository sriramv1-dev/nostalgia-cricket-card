import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SnapStripProps<T> {
  items: T[];
  keyFor: (item: T) => string;
  children: (item: T) => ReactNode;
  className?: string;
}

export function SnapStrip<T>({ items, keyFor, children, className }: SnapStripProps<T>) {
  return (
    <div
      className={cn(
        "flex-shrink-0 flex gap-2 overflow-x-auto snap-x snap-mandatory px-4 py-2",
        className
      )}
    >
      {items.map((item) => (
        <div key={keyFor(item)} className="snap-start w-20 flex-shrink-0">
          {children(item)}
        </div>
      ))}
    </div>
  );
}
