"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageTitleState {
  crumbs: Breadcrumb[];
  setTitle: (crumbs: Breadcrumb[]) => void;
}

const PageTitleContext = createContext<PageTitleState>({
  crumbs: [],
  setTitle: () => {},
});

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [crumbs, setCrumbs] = useState<Breadcrumb[]>([]);
  const setTitle = useCallback((next: Breadcrumb[]) => setCrumbs(next), []);
  return (
    <PageTitleContext.Provider value={{ crumbs, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export const usePageTitle = () => useContext(PageTitleContext);
