import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const formatPill = cva(
  "inline-flex items-center rounded-full text-xs font-bold tracking-wide px-3 py-1",
  {
    variants: {
      format: {
        test: "bg-amber-900/40 text-amber-200",
        odi: "bg-blue-900/50 text-blue-300",
        t20i: "bg-pink-900/50 text-pink-300",
      },
    },
  }
);

interface FormatPillProps extends VariantProps<typeof formatPill> {
  format: "test" | "odi" | "t20i";
  children?: React.ReactNode;
  className?: string;
}

export function FormatPill({ format, children, className }: FormatPillProps) {
  return (
    <span className={cn(formatPill({ format }), className)}>
      {children ?? format.toUpperCase()}
    </span>
  );
}
