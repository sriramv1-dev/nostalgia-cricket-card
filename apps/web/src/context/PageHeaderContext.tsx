"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type SetContent = (node: ReactNode) => void;

const PageHeaderContentCtx = createContext<ReactNode>(null);
const PageHeaderSetterCtx = createContext<SetContent>(() => {});

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<ReactNode>(null);
  const setContent = useCallback((node: ReactNode) => setContentState(node), []);
  return (
    <PageHeaderSetterCtx.Provider value={setContent}>
      <PageHeaderContentCtx.Provider value={content}>
        {children}
      </PageHeaderContentCtx.Provider>
    </PageHeaderSetterCtx.Provider>
  );
}

// Used by PageHeaderSlot to read content
export const usePageHeader = () => useContext(PageHeaderContentCtx);

// Used by usePageHeaderContent to write — stable, never triggers re-renders
export const usePageHeaderSetter = () => useContext(PageHeaderSetterCtx);
