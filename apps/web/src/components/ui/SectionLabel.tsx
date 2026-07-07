import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionLabel = cva("", {
  variants: {
    variant: {
      /** Muted eyebrow label above a content section. */
      label: "text-zinc-400 text-xs tracking-widest",
      /** Sticky page heading pattern (see ComingSoonPage). */
      heading: "font-display text-3xl text-cream tracking-wider",
    },
  },
  defaultVariants: {
    variant: "label",
  },
});

export interface SectionLabelProps extends VariantProps<typeof sectionLabel> {
  children: ReactNode;
  className?: string;
}

export function SectionLabel({ children, variant, className }: SectionLabelProps) {
  return (
    <p className={cn(sectionLabel({ variant }), className)}>{children}</p>
  );
}
