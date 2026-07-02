"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

export type BottomSheetHeight = "35%" | "full";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  height?: BottomSheetHeight;
  children: ReactNode;
}

// Drag past whichever threshold is smaller dismisses the sheet.
const DRAG_DISMISS_PX = 100;
const DRAG_DISMISS_FRACTION = 0.25;

const HEIGHT_CLASSES: Record<BottomSheetHeight, string> = {
  "35%": "h-[35dvh]",
  full: "h-dvh",
};

export function BottomSheet({
  isOpen,
  onClose,
  height = "35%",
  children,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Back-gesture support: push a history entry while open so the hardware /
  // browser back action closes the sheet instead of navigating. If the sheet
  // closes by any other means, pop our entry so history stays balanced.
  useEffect(() => {
    if (!isOpen) return;
    let closedByPop = false;
    window.history.pushState({ bottomSheet: true }, "");
    const handlePop = () => {
      closedByPop = true;
      onCloseRef.current();
    };
    window.addEventListener("popstate", handlePop);
    return () => {
      window.removeEventListener("popstate", handlePop);
      if (!closedByPop) window.history.back();
    };
  }, [isOpen]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const sheetHeight = sheetRef.current?.offsetHeight ?? 0;
    const threshold = Math.min(
      DRAG_DISMISS_PX,
      sheetHeight * DRAG_DISMISS_FRACTION
    );
    if (info.offset.y > threshold) onClose();
  };

  // Always mounted; open/close is driven by animate + pointer-events. This
  // avoids AnimatePresence exit-removal edge cases and keeps SSR trivial.
  return (
    <motion.div
      className={cn("fixed inset-0 z-[60]", !isOpen && "pointer-events-none")}
      aria-hidden={!isOpen}
      initial={false}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        className={cn(
          "absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-zinc-800 bg-zinc-900 pb-[env(safe-area-inset-bottom)] flex flex-col",
          HEIGHT_CLASSES[height]
        )}
        initial={false}
        animate={{ y: isOpen ? 0 : "110%" }}
        transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
        drag={isOpen ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={handleDragEnd}
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>
  );
}
