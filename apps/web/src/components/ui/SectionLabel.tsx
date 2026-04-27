import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p className={cn("text-zinc-400 text-xs tracking-widest", className)}>
      {children}
    </p>
  );
}
