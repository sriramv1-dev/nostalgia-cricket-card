# Frontend Patterns

## Component Hierarchy

```
layout.tsx (Server — max-w-md wrapper, fonts, metadata)
  │
  ├── page.tsx (Server — hero + feature grid, no auth required)
  │
  ├── (auth)/login/page.tsx (Client — magic link form)
  │
  ├── collection/page.tsx (Server — fetches user_cards, renders grid)
  │   ├── CollectionGrid (Client — filter/sort state)
  │   │   └── CricketCard (Client — Framer Motion hover/tap)
  │   └── BottomNav (Client — usePathname)
  │
  ├── packs/page.tsx (Server — lists available packs)
  │   ├── PackCard (Client — open pack button + animation)
  │   │   └── PackRevealOverlay (Client — card flip reveal sequence)
  │   │       └── CricketCard (Client)
  │   └── BottomNav
  │
  ├── trade/page.tsx (Server — initial trade list)
  │   ├── TradeList (Client — realtime subscription)
  │   │   └── TradeOfferCard (Client)
  │   └── BottomNav
  │
  └── battle/page.tsx (Server — arena shell)
      ├── BattleArena (Client — battle state machine)
      │   ├── CricketCard (battle positions)
      │   └── BattleLog (animated commentary)
      └── BottomNav
```

## Animation Patterns with Framer Motion

### Card Hover / Tap (in CricketCard.tsx)
```tsx
<motion.div
  whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>
```
Spring physics makes it feel natural, not mechanical. `stiffness: 300` is snappy, `damping: 20` prevents oscillation.

### Card Flip (pack reveal)
```tsx
const [flipped, setFlipped] = useState(false)

<motion.div
  animate={{ rotateY: flipped ? 180 : 0 }}
  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
  style={{ transformStyle: 'preserve-3d' }}
>
  {/* Front face */}
  <div style={{ backfaceVisibility: 'hidden' }}>
    <CricketCard card={card} />
  </div>
  {/* Back face */}
  <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
    <CricketCard card={card} showBack />
  </div>
</motion.div>
```

### Pack Opening Reveal (staggered)
```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.3, delayChildren: 0.5 }
  }
}
const cardVariants = {
  hidden: { scale: 0.7, opacity: 0, y: 30 },
  visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200 } }
}

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {cards.map(card => (
    <motion.div key={card.id} variants={cardVariants}>
      <CricketCard card={card} />
    </motion.div>
  ))}
</motion.div>
```

### Battle Round Animation
- Each round: player1 card slides left → collision → player2 card slides right
- Winner card bounces up; loser card dims and shakes
- Commentary text types in using `AnimatePresence` + character-by-character stagger

### Legendary Card Glow Pulse
CSS keyframe `pulse-glow` runs continuously on legendary cards. This is intentionally CSS (not Framer Motion) because it loops forever and doesn't need JS to drive it.

## Mobile-First Layout Strategy

- **Single column always.** No grid layouts for the main shell — everything stacks vertically.
- **`max-w-md mx-auto`** in the root layout. The app never expands beyond 448px.
- **Bottom navigation** at `fixed bottom-0`. All pages add `pb-20` to avoid content hiding behind the nav.
- **Sticky headers** with `backdrop-blur-sm` so content scrolling underneath looks polished.
- **Touch targets:** All interactive elements are minimum 44×44px (Apple HIG standard).
- **`active:scale-95`** on buttons for tactile feedback on mobile (Tailwind utility, no JS).

## State Management Approach

This app uses three layers of state — no Redux, no Zustand needed:

### 1. Server State (React Server Components)
Collection, card details, pack listings — all fetched server-side using `createServerClient`. Zero client JS for data fetching in these cases.

```tsx
// apps/web/src/app/collection/page.tsx
export default async function CollectionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: userCards } = await supabase
    .from('user_cards')
    .select('*, card:cards(*)')
    .eq('user_id', user!.id)

  return <CollectionGrid initialCards={userCards ?? []} />
}
```

### 2. Realtime State (Supabase Realtime in Client Components)
Trade status updates and battle invitations subscribe to `postgres_changes`. The subscription is set up in a `useEffect` and tears down on unmount.

```tsx
useEffect(() => {
  const channel = supabase
    .channel('my-trades')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'trades',
        filter: `receiver_id=eq.${userId}` },
      (payload) => setTrades(prev => updateTrade(prev, payload.new))
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [userId])
```

### 3. Local State (useState / useReducer)
- Pack reveal sequence: `step: 'idle' | 'opening' | 'revealing' | 'done'`
- Battle state machine: `BattleState` with current round, scores, animations
- UI state: selected card for trade, filter value for collection

## Retro Design Philosophy

The aesthetic is deliberate nostalgia — not pixel art, not skeuomorphic, but **warm and analog**:

- **Cream cards on dark backgrounds** — like holding a physical card under a lamp at night
- **Bebas Neue for all headings** — the "sports broadcast" font of the 90s
- **No rounded-full on card borders** — use `rounded-2xl` (physical cards have soft corners, not pill shapes)
- **Grain texture** on card backgrounds via SVG data URI in tailwind config
- **Stats presented as numbers, not bars** — the original cards listed raw numbers, not visualizations
- **Flavour text in italics** — the quote on the back of the card you read a hundred times

The one modern concession is the dark background (`bg-gray-950`) — the original cards were white/cream throughout. The dark theme makes the cream cards pop and reduces eye strain on OLED phones.
