import type { ReactNode } from "react";

export interface ComingSoonPageProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Right-hand header slot (e.g. the coin balance badge). */
  right?: ReactNode;
  /** Wider gutters + max-w-7xl header content (collection-style pages). */
  wide?: boolean;
  children?: ReactNode;
}

/**
 * Shared shell for the placeholder feature pages (collection, packs, trade,
 * battle): full-height column with the sticky blurred header and display
 * heading. Page-specific preview content renders as children.
 */
export function ComingSoonPage({
  title,
  subtitle,
  icon,
  right,
  wide = false,
  children,
}: ComingSoonPageProps) {
  return (
    <main className="flex flex-col min-h-screen pb-20">
      <div
        className={`sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 py-4 ${
          wide ? "px-4 md:px-8 lg:px-12" : "px-4"
        }`}
      >
        <div
          className={`flex items-center justify-between ${
            wide ? "max-w-7xl mx-auto" : ""
          }`}
        >
          <div>
            <h1 className="font-display text-3xl text-cream tracking-wider">
              {icon && <span className="mr-2">{icon}</span>}
              {title}
            </h1>
            {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
          </div>
          {right}
        </div>
      </div>
      {children}
    </main>
  );
}
