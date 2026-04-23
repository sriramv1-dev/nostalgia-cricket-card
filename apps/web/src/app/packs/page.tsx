const SAMPLE_PACKS = [
  {
    id: "classic-90s",
    name: "Classic 90s Pack",
    description:
      "Legends of the golden era. Contains 5 cards with a chance of legendary.",
    price: 100,
    cardCount: 5,
    accentColor: "border-gold/40",
    bgColor: "bg-gold/5",
    emoji: "🏆",
    rarityHint: "Common → Legendary",
  },
  {
    id: "bowlers-pack",
    name: "Bowlers' Special",
    description: "Pace and spin legends. Higher chance of rare bowlers.",
    price: 150,
    cardCount: 5,
    accentColor: "border-blue-400/40",
    bgColor: "bg-blue-400/5",
    emoji: "🔴",
    rarityHint: "Uncommon → Legendary",
  },
  {
    id: "subcontinent-pack",
    name: "Subcontinent Stars",
    description: "The best from India, Pakistan, and Sri Lanka.",
    price: 120,
    cardCount: 5,
    accentColor: "border-pitch/40",
    bgColor: "bg-pitch/5",
    emoji: "🌏",
    rarityHint: "Common → Rare",
  },
  {
    id: "premium-pack",
    name: "Premium Legends",
    description: "Guaranteed rare or above. For serious collectors.",
    price: 300,
    cardCount: 3,
    accentColor: "border-brand/40",
    bgColor: "bg-brand/5",
    emoji: "⭐",
    rarityHint: "Rare → Legendary",
  },
];

export default function PacksPage() {
  return (
    <main className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-cream tracking-wider">
              PACK SHOP
            </h1>
            <p className="text-gray-500 text-xs">
              Spend coins, discover legends
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-900 border border-gold/20 rounded-full px-3 py-1.5">
            <span className="text-gold text-sm">🪙</span>
            <span className="text-gold text-sm font-bold">500</span>
          </div>
        </div>
      </div>

      {/* Pack list */}
      <div className="px-4 py-4 flex flex-col gap-4">
        {SAMPLE_PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`rounded-2xl border ${pack.accentColor} ${pack.bgColor} p-4`}
          >
            <div className="flex items-start gap-4">
              {/* Pack icon */}
              <div className="shrink-0 w-16 h-20 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center text-3xl">
                {pack.emoji}
              </div>

              {/* Pack details */}
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl text-cream tracking-wide leading-tight">
                  {pack.name}
                </h2>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  {pack.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500">
                    {pack.cardCount} cards
                  </span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-500">
                    {pack.rarityHint}
                  </span>
                </div>
              </div>
            </div>

            {/* Price + button row */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
              <div className="flex items-center gap-1.5">
                <span className="text-gold text-base">🪙</span>
                <span className="text-gold font-bold text-lg">
                  {pack.price}
                </span>
                <span className="text-gray-600 text-xs">coins</span>
              </div>
              <button
                disabled
                className="bg-gray-800 text-gray-500 text-sm font-medium px-4 py-2 rounded-xl cursor-not-allowed border border-gray-700"
                title="Coming soon"
              >
                Coming Soon
              </button>
            </div>
          </div>
        ))}

        {/* Info note */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-gray-500 text-xs leading-relaxed">
            Pack opening is launching soon. In the meantime, explore the
            collection and familiarize yourself with the legends.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Your 500 starter coins will be waiting when it drops.
          </p>
        </div>
      </div>
    </main>
  );
}
