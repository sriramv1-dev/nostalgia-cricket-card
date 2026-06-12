"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePageHeaderContent } from "@/hooks/usePageHeaderContent";

export interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  subtitleFill?: boolean;
  right?: ReactNode;
  back?: { label: string };
}

export function PageHeader({
  title,
  subtitle,
  subtitleFill = false,
  right,
  back,
}: PageHeaderProps) {
  const router = useRouter();

  usePageHeaderContent(
    <div className="flex items-center w-full">
      {back != null && (
        <>
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-1.5 font-display text-md tracking-widest flex-shrink-0 text-zinc-400 hover:text-pink-400 transition-colors cursor-pointer"
          >
            <span className="text-zinc-600 group-hover:text-pink-400 transition-colors text-lg leading-none">
              ←
            </span>
            {back.label}
          </button>
          <span className="mx-2 flex-shrink-0 text-pink-400 font-bold">›</span>
        </>
      )}
      <span className="font-display text-md tracking-widest flex-shrink-0">
        {title}
      </span>
      {subtitle != null && (
        <>
          <span className="mx-2 flex-shrink-0 text-pink-400 font-bold">›</span>
          {subtitleFill ? (
            <div className="flex-1 min-w-0">{subtitle}</div>
          ) : (
            subtitle
          )}
        </>
      )}
      {right != null && <div className="ml-auto flex-shrink-0 overflow-visible">{right}</div>}
    </div>
  );
  return null;
}
