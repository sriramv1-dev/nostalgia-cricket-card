"use client";

import { useRouter } from "next/navigation";
import { BatSwitch } from "@/components/ui";
import { GridIcon, TableIcon } from "@/components/icons";

export interface ViewSwitcherProps {
  playerId: string;
  view: string;
}

export function ViewSwitcher({ playerId, view }: ViewSwitcherProps) {
  const router = useRouter();
  return (
    <div className="h-12 w-full sm:w-40 overflow-visible">
      <BatSwitch
        options={[
          { id: "card", label: "Card", icon: <GridIcon /> },
          { id: "table", label: "Table", icon: <TableIcon /> },
        ]}
        value={view}
        onChange={(v) =>
          router.push(`/players/${playerId}?view=${v}`, { scroll: false })
        }
      />
    </div>
  );
}
