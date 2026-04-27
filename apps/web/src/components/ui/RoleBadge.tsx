import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

const roleBadge = cva(
  "inline-flex items-center gap-1.5 rounded-full text-xs font-bold tracking-wide px-3 py-1",
  {
    variants: {
      role: {
        batter: "bg-orange-900/30 text-orange-400 border border-orange-700/40",
        bowler: "bg-purple-900/30 text-purple-400 border border-purple-700/40",
        allrounder: "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40",
        keeper: "bg-amber-900/30 text-amber-400 border border-amber-700/40",
      },
    },
  }
);

type RoleKey = "batter" | "bowler" | "allrounder" | "keeper";

interface RoleBadgeProps extends VariantProps<typeof roleBadge> {
  role: RoleKey;
  children?: ReactNode;
  className?: string;
}

export function RoleBadge({ role, children, className }: RoleBadgeProps) {
  return (
    <span className={cn(roleBadge({ role }), className)}>
      {children ?? role}
    </span>
  );
}
