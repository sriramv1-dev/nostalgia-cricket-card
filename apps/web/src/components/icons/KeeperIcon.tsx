export interface KeeperIconProps {
  className?: string;
}

export function KeeperIcon({ className }: KeeperIconProps) {
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
      <path d="M18 11V6a2 2 0 0 0-4 0v5" />
      <path d="M14 10V4a2 2 0 0 0-4 0v6" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M6 14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2.5" />
    </svg>
  );
}
