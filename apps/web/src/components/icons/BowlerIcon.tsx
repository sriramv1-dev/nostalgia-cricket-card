export interface BowlerIconProps {
  className?: string;
}

export function BowlerIcon({ className }: BowlerIconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2 4 2 14 0 18" />
      <path d="M3 12c4-2 14-2 18 0" />
    </svg>
  );
}
