export interface AllRounderIconProps {
  className?: string;
}

export function AllRounderIcon({ className }: AllRounderIconProps) {
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
      <path d="M3 17L9 5" />
      <path d="M9 5l3 3" />
      <circle cx="17" cy="15" r="4" />
    </svg>
  );
}
