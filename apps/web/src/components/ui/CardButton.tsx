import { cva, type VariantProps } from "class-variance-authority";
import { type ReactNode } from "react";

const cardButton = cva(
  "w-full font-bold py-3 rounded-xl tracking-widest transition-all",
  {
    variants: {
      variant: {
        primary: "bg-pink-500 hover:bg-pink-600 text-white",
        secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-400",
      },
    },
  }
);

interface CardButtonProps extends VariantProps<typeof cardButton> {
  variant: "primary" | "secondary";
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  tabIndex?: number;
}

export function CardButton({
  variant,
  onClick,
  children,
  disabled,
  tabIndex,
}: CardButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
      className={cardButton({ variant })}
    >
      {children}
    </button>
  );
}
