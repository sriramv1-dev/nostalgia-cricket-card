"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/players", label: "Players", enabled: true },
  { href: "/card-builder", label: "Card Builder", enabled: true },
];

const MOBILE_TABS = [
  { label: "Home", href: "/", enabled: true, icon: "N" },
  { label: "Players", href: "/players", enabled: true, icon: "🃏" },
  { label: "Builder", href: "/card-builder", enabled: true, icon: "🎨" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop / tablet top header */}
      <header
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-nav items-center px-4 md:px-8 border-b border-zinc-800 backdrop-blur-md overflow-visible"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,10,15,0.97) 0%, rgba(20,10,18,0.97) 40%, rgba(232,37,122,0.06) 70%, rgba(10,10,15,0.97) 100%)",
        }}
      >
        <Link href="/" className="flex items-center gap-3 mr-10 flex-shrink-0">
          <span className="font-display text-xl md:text-2xl lg:text-3xl text-pink-500 leading-none">
            Nostalgia
          </span>
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ href, label, enabled }) => {
            if (!enabled) return null;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-1.5 text-lg tracking-wider font-medium transition-colors ${
                  pathname === href || pathname.startsWith(href + "/")
                    ? "text-white after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-[2px] after:bg-brand-pink after:rounded-full"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-nav flex items-stretch border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        {MOBILE_TABS.map(({ href, label, enabled, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          if (!enabled) {
            return (
              <span
                key={href}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 opacity-30 cursor-not-allowed"
              >
                <span className="text-xl leading-none">{icon}</span>
                <span className="text-[10px] font-semibold tracking-wider leading-none text-zinc-600">
                  {label}
                </span>
              </span>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors duration-150 ${
                isActive ? "text-brand-pink" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-pink rounded-full" />
              )}
              <span className={`text-xl leading-none ${href === "/" ? "font-display text-2xl" : ""}`}>{icon}</span>
              <span
                className={`text-[10px] font-semibold tracking-wider leading-none ${
                  isActive ? "text-brand-pink" : "text-zinc-600"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
