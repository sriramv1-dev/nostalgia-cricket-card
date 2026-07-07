export interface ArrowLeftIconProps {
  className?: string;
}

export function ArrowLeftIcon({ className }: ArrowLeftIconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M19 12H5M5 12l7-7M5 12l7 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
