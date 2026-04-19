import Link from "next/link";
import { MobileContainer } from "@/components/layout/MobileContainer";

const features = [
  {
    icon: "🃏",
    title: "Collect",
    description:
      "Build your collection of legendary 90s cricketers. From common to legendary rarity.",
    href: "/collection",
    color: "border-blue-400/30 bg-blue-400/5",
  },
  {
    icon: "📦",
    title: "Packs",
    description:
      "Open packs to discover new players. Every pack is a mystery waiting to be revealed.",
    href: "/packs",
    color: "border-gold/30 bg-gold/5",
  },
  {
    icon: "🔄",
    title: "Trade",
    description:
      "Trade cards with other collectors. Complete your collection through smart swaps.",
    href: "/trade",
    color: "border-green-400/30 bg-green-400/5",
  },
  {
    icon: "⚔️",
    title: "Battle",
    description:
      "Pit your best players against rivals. Stats decide who reigns supreme.",
    href: "/battle",
    color: "border-brand/30 bg-brand/5",
  },
];

export default function HomePage() {
  return (
    <MobileContainer>
      <main className="flex flex-col min-h-screen pb-20">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center overflow-hidden">
          {/* Background decorative elements */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 0%, #e63946 0%, transparent 60%)",
            }}
          />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-gold to-pitch" />

          {/* Logo / era badge */}
          <div className="relative mb-4">
            <span className="inline-block bg-brand text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              Est. 1990s
            </span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-6xl text-cream leading-none tracking-wider mb-2 text-shadow-retro">
            POCKET
          </h1>
          <h1 className="font-display text-6xl text-brand leading-none tracking-wider mb-1 text-shadow-retro">
            CRICKET
          </h1>
          <h1 className="font-display text-6xl text-gold leading-none tracking-wider mb-6 text-shadow-retro">
            CARDS
          </h1>

          {/* Tagline */}
          <p className="text-gray-300 text-lg font-medium mb-2">
            Relive the 90s. Collect legends.
          </p>
          <p className="text-gray-500 text-sm mb-8 max-w-xs">
            Inspired by Big Babol Pocket Cricket — the cards you traded on the
            playground.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Link
              href="/players"
              className="w-full bg-brand hover:bg-red-600 text-white font-bold py-3.5 px-6 rounded-xl text-base transition-all duration-200 active:scale-95 shadow-lg shadow-brand/20 text-center"
            >
              Start Collecting
            </Link>
            <Link
              href="/packs"
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gold/40 text-gold font-bold py-3.5 px-6 rounded-xl text-base transition-all duration-200 active:scale-95 text-center"
            >
              Open a Pack
            </Link>
          </div>

          {/* Coin starter hint */}
          <p className="mt-4 text-xs text-gray-600">
            New players start with 500 coins — enough for 5 packs!
          </p>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-3 px-6 py-2">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-600 text-xs font-medium uppercase tracking-widest">
            Four Pillars
          </span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* Feature Cards Grid */}
        <section className="px-4 pt-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className={`relative rounded-2xl border p-4 flex flex-col gap-2 transition-all duration-200 active:scale-95 ${feature.color}`}
              >
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h3 className="font-display text-xl text-cream tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Retro footer note */}
        <footer className="px-6 pb-4 text-center">
          <p className="text-gray-700 text-xs">
            Remember blowing the gum wrapper and slipping the card out?
            <br />
            <span className="text-gray-600">That feeling — now digital.</span>
          </p>
        </footer>
      </main>
    </MobileContainer>
  );
}
