"use client";

import { usePageHeader } from "@/context/PageHeaderContext";

export function PageHeaderSlot() {
  const content = usePageHeader();
  if (!content) return null;
  return (
    <div className="block fixed top-[60px] left-0 right-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-4 md:px-8">
      <div className="flex items-center min-h-[52px] py-2">
        {content}
      </div>
    </div>
  );
}
