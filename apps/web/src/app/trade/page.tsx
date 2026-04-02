export default function TradePage() {
  return (
    <main className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-4 py-4">
        <div>
          <h1 className="font-display text-3xl text-cream tracking-wider">TRADE CENTER</h1>
          <p className="text-gray-500 text-xs">Browse open trades</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {['Browse', 'My Offers', 'Received'].map((tab, i) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              i === 0
                ? 'text-brand border-b-2 border-brand'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Browse trades - empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="bg-green-400/5 border border-green-400/20 rounded-2xl p-8 w-full max-w-xs">
          <div className="text-5xl mb-4">🔄</div>
          <h2 className="font-display text-2xl text-cream tracking-wide mb-2">
            NO OPEN TRADES
          </h2>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            The trade floor is quiet right now. Once players list their cards for
            trade, offers will appear here.
          </p>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-500 text-xs">
              Build your collection first, then mark cards you want to trade
              from your collection page.
            </p>
          </div>
        </div>

        {/* How trading works */}
        <div className="mt-8 w-full max-w-xs text-left">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            How Trading Works
          </h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Mark cards as "for trade" in your collection' },
              { step: '2', text: 'Browse what others are offering' },
              { step: '3', text: 'Propose a swap — offer your card, request theirs' },
              { step: '4', text: 'Both players confirm to complete the trade' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-gray-900 border border-gray-700 text-xs text-gray-400 flex items-center justify-center font-bold">
                  {item.step}
                </span>
                <p className="text-gray-500 text-xs leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
