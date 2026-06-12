"use client";

import { useTitle } from "@/hooks";

interface Crumb {
  label: string;
  href?: string;
}

export interface PageTitleProps {
  crumbs: Crumb[];
}

export function PageTitle({ crumbs }: PageTitleProps) {
  useTitle(crumbs);
  return null;
}
