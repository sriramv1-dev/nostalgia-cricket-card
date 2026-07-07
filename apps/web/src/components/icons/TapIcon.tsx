export interface TapIconProps {
  className?: string;
}

export function TapIcon({ className }: TapIconProps) {
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
      <path d="M9 11V6a2 2 0 0 1 4 0v5" />
      <path d="M13 11V8a2 2 0 0 1 4 0v5" />
      <path d="M17 11V9.5a2 2 0 0 1 4 0V17a4 4 0 0 1-4 4h-3a4 4 0 0 1-3.16-1.53L5 12a2 2 0 0 1 2.72-2.93L9 11" />
    </svg>
  );
}
