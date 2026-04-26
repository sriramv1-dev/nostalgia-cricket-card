export default function CollectionPage() {
  return (
    <main className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-4 md:px-8 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-cream tracking-wider">
              YOUR COLLECTION
            </h1>
            <p className="text-gray-500 text-xs">0 cards collected</p>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-900 border border-gold/20 rounded-full px-3 py-1.5">
            <span className="text-gold text-sm">🪙</span>
            <span className="text-gold text-sm font-bold">500</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="flex gap-2 py-3 overflow-x-auto scrollbar-none">
          {["All", "Legendary", "Rare", "Uncommon", "Common"].map((filter) => (
            <button
              key={filter}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === "All"
                  ? "bg-brand text-white"
                  : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Card grid */}
      <div className="px-4 md:px-8 lg:px-12 pt-2 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-gray-900/60 border border-gray-800 overflow-hidden animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-full aspect-[3/4] bg-gray-800" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 bg-gray-800 rounded-full w-3/4" />
                <div className="h-2.5 bg-gray-800 rounded-full w-1/2" />
                <div className="flex gap-1.5">
                  <div className="h-2 bg-gray-800 rounded-full w-1/3" />
                  <div className="h-2 bg-gray-800 rounded-full w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state hint */}
        <div className="text-center py-8 mt-4">
          <p className="text-gray-700 text-sm">
            Your collection is empty. Open a pack to get started!
          </p>
          <div
            className="inline-block mt-3 bg-brand/10 border border-brand/20 text-brand text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand/20 transition-colors cursor-not-allowed opacity-60"
          >
            Go to Pack Shop →
          </div>
        </div>
      </div>
    </main>
  );
}
