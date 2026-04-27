import Link from "next/link";

const features = [
  {
    icon: "🃏",
    title: "Collect",
    description:
      "Build your collection of legendary 90s cricketers. From common to legendary rarity.",
    route: "/collection",
    color: "border-blue-400/30 bg-blue-400/5",
  },
  {
    icon: "📦",
    title: "Packs",
    description:
      "Open packs to discover new players. Every pack is a mystery waiting to be revealed.",
    route: "/packs",
    color: "border-gold/30 bg-gold/5",
  },
  {
    icon: "🔄",
    title: "Trade",
    description:
      "Trade cards with other collectors. Complete your collection through smart swaps.",
    route: "/trade",
    color: "border-green-400/30 bg-green-400/5",
  },
  {
    icon: "⚔️",
    title: "Battle",
    description:
      "Pit your best players against rivals. Stats decide who reigns supreme.",
    route: "/battle",
    color: "border-brand/30 bg-brand/5",
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen pb-10">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-10 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, #e63946 0%, transparent 60%)",
          }}
        />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-gold to-pitch" />

        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center lg:flex-row lg:items-center lg:justify-between lg:text-left gap-10">
          {/* Heading block */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="mb-4">
              <span className="inline-block bg-brand text-white text-xs font-bold tracking-widest px-3 py-1 rounded-full">
                Est. 1990s
              </span>
            </div>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-cream leading-none tracking-wider mb-2 text-shadow-retro">
              POCKET
            </h1>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-brand leading-none tracking-wider mb-1 text-shadow-retro">
              CRICKET
            </h1>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-gold leading-none tracking-wider mb-6 text-shadow-retro">
              CARDS
            </h1>
          </div>

          {/* CTA block */}
          <div className="flex flex-col items-center lg:items-start gap-4 w-full max-w-xs lg:max-w-sm">
            <p className="text-gray-300 text-lg font-medium">
              Relive the 90s. Collect legends.
            </p>
            <p className="text-gray-500 text-sm">
              Inspired by Big Babol Pocket Cricket — the cards you traded on the
              playground.
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full">
              <Link
                href="/players"
                className="w-full bg-brand hover:bg-red-600 text-white font-bold py-3.5 px-6 rounded-xl text-base transition-all duration-200 active:scale-95 shadow-lg shadow-brand/20 text-center"
              >
                Start Collecting
              </Link>
              <div
                className="w-full bg-gray-800 hover:bg-gray-700 border border-gold/40 text-gold font-bold py-3.5 px-6 rounded-xl text-base transition-all duration-200 active:scale-95 text-center cursor-not-allowed opacity-60"
              >
                Open a Pack
              </div>
            </div>
            <p className="text-xs text-gray-600">
              New players start with 500 coins — enough for 5 packs!
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-3 px-6 py-2 max-w-5xl mx-auto w-full">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-gray-600 text-xs font-medium tracking-widest">
          Four Pillars
        </span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      {/* Feature Cards Grid */}
      <section className="px-4 pt-4 pb-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((feature) => {
            const isDisabled = ["/collection", "/packs", "/trade"].includes(
              feature.route
            );
            const sharedClass = `relative rounded-2xl border p-4 flex flex-col gap-2 transition-all duration-200 active:scale-95 hover:scale-[1.02] ${feature.color}`;
            const inner = (
              <>
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h3 className="font-display text-xl text-cream tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </>
            );
            return isDisabled ? (
              <div
                key={feature.title}
                className={`${sharedClass} cursor-not-allowed opacity-60`}
              >
                {inner}
              </div>
            ) : (
              <Link
                key={feature.title}
                href={feature.route}
                className={sharedClass}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
