export default function BattlePage() {
  return (
    <main className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-4 py-4">
        <div>
          <h1 className="font-display text-3xl text-cream tracking-wider">BATTLE ARENA</h1>
          <p className="text-gray-500 text-xs">Challenge players to card battles</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="bg-brand/5 border border-brand/20 rounded-2xl p-8 w-full max-w-xs">
          <div className="text-5xl mb-4">⚔️</div>
          <h2 className="font-display text-2xl text-cream tracking-wide mb-2">
            ARENA LOADING
          </h2>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            The battle arena is under construction. Soon you will be able to
            challenge other collectors and let your cards do the talking.
          </p>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-500 text-xs">
              Coming soon: stat-based battles with dice rolls and live commentary.
            </p>
          </div>
        </div>

        {/* Battle mechanics preview */}
        <div className="mt-8 w-full max-w-xs text-left">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            How Battles Work
          </h3>
          <div className="space-y-3">
            {[
              {
                icon: '🃏',
                text: 'Pick your best card from your collection',
              },
              {
                icon: '🎲',
                text: 'Stats + dice rolls determine each round',
              },
              {
                icon: '🏆',
                text: 'Best of 5 rounds wins the battle',
              },
              {
                icon: '🪙',
                text: 'Winners earn coins and XP',
              },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-lg">{item.icon}</span>
                <p className="text-gray-500 text-xs leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stat match-ups preview */}
        <div className="mt-6 w-full max-w-xs bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Stat Match-ups
          </h3>
          <div className="space-y-2">
            {[
              { role: 'Batsman vs Bowler', stat: 'Batting Avg vs Economy' },
              { role: 'Bowler vs Batsman', stat: 'Bowling Avg vs Strike Rate' },
              { role: 'Allrounder vs Any', stat: 'Combined rating advantage' },
              { role: 'Keeper vs Any', stat: 'Catches bonus applies' },
            ].map((item) => (
              <div key={item.role} className="flex items-start justify-between gap-2">
                <span className="text-gray-500 text-xs">{item.role}</span>
                <span className="text-gray-600 text-xs text-right shrink-0">{item.stat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
