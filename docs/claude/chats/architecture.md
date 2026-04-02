# Architecture Decisions

## Why Next.js 14 App Router

The App Router was chosen for three concrete reasons:

1. **React Server Components (RSC) for collection pages.** The collection page needs to fetch `user_cards` joined with `cards` from Supabase. With RSC this happens server-side, ships zero JS for data fetching, and the initial HTML arrives fully rendered. On mobile, this matters — less JS = faster Time to Interactive.

2. **Streaming.** Next.js 14 supports `<Suspense>` boundaries natively. The card grid can stream in while the skeleton placeholder renders immediately, giving perceived performance on slow connections.

3. **Built-in API routes / Server Actions.** Pack opening requires server-side randomness (to prevent cheating). Server Actions let us call `openPack(packId)` directly from a Client Component without building a separate `/api/packs/open` route. The logic never reaches the browser.

## Why Supabase

1. **Free tier generosity.** 500 MB PostgreSQL, 50K auth MAU, realtime included. For a solo side project this covers years of usage without spending a dollar.

2. **Realtime for trade notifications.** When Player B accepts a trade initiated by Player A, Supabase Realtime fires a `postgres_changes` event. No polling, no webhooks, no extra infrastructure. `supabase.channel('trades').on('postgres_changes', ...)` is three lines.

3. **Built-in Auth with magic links.** No password storage, no OAuth app setup. Users receive an email link, click it, they're in. The `on_auth_user_created` trigger auto-creates a `user_profiles` row so there's no additional onboarding step.

4. **Row Level Security.** RLS policies keep the security model close to the data layer. We cannot accidentally build an API endpoint that leaks another user's trade offers — the database simply refuses.

## Monorepo Structure

```
nostalgia-cricket-card/
├── apps/
│   └── web/          <- Next.js app (the only app for now)
├── supabase/         <- migrations + seed (not an app, just SQL files)
├── sync-job/         <- standalone Node scripts (seed-cards.ts)
└── docs/             <- Claude project context
```

The `apps/` directory anticipates a future `packages/game-engine` — a shared TypeScript module containing battle resolution, pack opening algorithm, and XP calculation. These could be extracted when complexity justifies it. For now, that logic lives in Server Actions inside `apps/web`.

## Data Flow Diagram

```
Browser (Client Component)
  │
  │  onClick: "Open Pack"
  ▼
Server Action: openPack(packId)       [apps/web/src/app/packs/actions.ts]
  │
  ├─ Verify user is authenticated      [supabase.auth.getUser()]
  ├─ Verify user has enough coins      [SELECT coins FROM user_profiles]
  ├─ Run weighted random selection     [pure TS, server-only]
  ├─ Insert rows into user_cards       [INSERT INTO user_cards ...]
  ├─ Deduct coins from user_profiles   [UPDATE user_profiles SET coins = coins - N]
  └─ Return card array to client
  │
  ▼
Client Component receives cards
  │
  └─ Framer Motion: pack reveal animation
     Cards fly in one by one


Browser (Collection Page — Server Component)
  │
  └─ createServerClient() + supabase.from('user_cards')
       .select('*, card:cards(*)')
       .eq('user_id', userId)
  │
  ▼
  HTML streamed to browser (no client JS for this fetch)
  └─ CricketCard components rendered server-side


Realtime Trade Notification (Client Component)
  │
  └─ createBrowserClient() + supabase
       .channel('my-trades')
       .on('postgres_changes', { event: 'UPDATE', table: 'trades' }, handler)
       .subscribe()
```

## Key Architectural Constraints from Free Tier

### Supabase 500 MB Database
- The `cards` table will never exceed 100 rows. Trivial.
- `user_cards` is the growth table. At 10 cards per user, 1,000 users = 10,000 rows = well under 1 MB.
- `battles.battle_log` is JSONB. Keep rounds to ≤ 5. A full battle log is < 1 KB.
- **Action:** Add a Supabase dashboard alert at 400 MB.

### Vercel Hobby Function Limits
- Serverless functions: 10s timeout, 1024 MB memory.
- Pack opening Server Action must complete in < 3s (db query + random selection is fast).
- No long-running jobs. The `sync-job/seed-cards.ts` runs locally, not on Vercel.

### Cloudinary 25 GB Bandwidth
- Each card image should be ≤ 100 KB after optimization.
- Use Cloudinary URL transforms: `f_auto,q_auto,w_300` appended to image URLs.
- 20 cards × 100 KB = 2 MB total card images. Even at 10,000 page loads/month = 20 GB. Tight.
- **Action:** Use `next/image` with `sizes` prop to avoid over-fetching large images on mobile.
