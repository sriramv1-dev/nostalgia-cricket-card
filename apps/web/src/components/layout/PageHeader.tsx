"use client";

import { type ReactNode } from "react";
import { usePageHeaderContent } from "@/hooks/usePageHeaderContent";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  subtitleFill?: boolean;
  right?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  subtitleFill = false,
  right,
}: PageHeaderProps) {
  usePageHeaderContent(
    <div className="flex items-center w-full">
      <span className="font-display text-sm uppercase tracking-widest flex-shrink-0">
        {title}
      </span>
      {subtitle != null && (
        <>
          <span className="mx-2 flex-shrink-0 text-pink-400 font-bold">
            ›
          </span>
          {subtitleFill ? (
            <div className="flex-1 min-w-0">{subtitle}</div>
          ) : (
            subtitle
          )}
        </>
      )}
      {right != null && <div className="ml-auto flex-shrink-0">{right}</div>}
    </div>
  );
  return null;
}
