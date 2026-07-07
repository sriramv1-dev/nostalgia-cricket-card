export interface BatterIconProps {
  className?: string;
}

export function BatterIcon({ className }: BatterIconProps) {
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
      <path d="M4 20L16 4" />
      <path d="M16 4l4 4" />
      <path d="M4 20l4-4" />
    </svg>
  );
}
