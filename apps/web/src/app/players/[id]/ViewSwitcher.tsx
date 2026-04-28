"use client";

import { useRouter } from "next/navigation";
import { TabSwitch } from "@/components/ui";

const CARD_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const TABLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18v18H3z" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    <path d="M9 3v18" />
  </svg>
);

interface ViewSwitcherProps {
  playerId: string;
  view: string;
}

export function ViewSwitcher({ playerId, view }: ViewSwitcherProps) {
  const router = useRouter();
  return (
    <div className="h-12 w-[120px] overflow-visible">
      <TabSwitch
        options={[
          { id: "card", label: "Card", icon: CARD_ICON },
          { id: "table", label: "Table", icon: TABLE_ICON },
        ]}
        value={view}
        onChange={(v) =>
          router.push(`/players/${playerId}?view=${v}`, { scroll: false })
        }
      />
    </div>
  );
}
