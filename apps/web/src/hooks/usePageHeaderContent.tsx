"use client";

import { useEffect, type ReactNode } from "react";
import { usePageHeaderSetter } from "@/context/PageHeaderContext";

export function usePageHeaderContent(content: ReactNode) {
  const setContent = usePageHeaderSetter();
  useEffect(() => {
    setContent(content);
    return () => setContent(null);
  });
}
