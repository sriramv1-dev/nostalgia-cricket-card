"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/context/PageTitleContext";

interface Crumb {
  label: string;
  href?: string;
}

export function useTitle(crumbs: Crumb[]) {
  const { setTitle } = usePageTitle();
  const serialised = JSON.stringify(crumbs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setTitle(JSON.parse(serialised));
    return () => setTitle([]);
  }, [serialised, setTitle]);
}
