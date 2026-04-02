# Project Instructions for Claude

## Overview

Nostalgia Cricket Card is a mobile-first digital card collecting game inspired by the Big Babol Pocket Cricket physical cards from the 1990s. Users collect cards of legendary cricketers, open packs, trade with others, and battle using card stats.

## Four Pillars

1. **Collect** — Build a collection of 1990s cricket legend cards across four rarity tiers
2. **Packs** — Spend coins to open card packs with weighted random rarity drops
3. **Trade** — Propose and accept card trades with other users (peer-to-peer)
4. **Battle** — Stat-based card battles with dice-roll mechanics and live commentary

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | 14.2.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^3 |
| Animation | Framer Motion | ^11 |
| Database | Supabase (PostgreSQL) | ^2 |
| Auth | Supabase Auth (magic link) | via @supabase/ssr ^0.4 |
| Realtime | Supabase Realtime | built-in |
| Images | Cloudinary | REST API |
| Hosting | Vercel (Hobby) | — |

---

## File Structure

```
nostalgia-cricket-card/
├── apps/
│   └── web/                        # Next.js app
│       ├── src/
│       │   ├── app/                # App Router pages
│       │   │   ├── layout.tsx      # Root layout (max-w-md wrapper)
│       │   │   ├── page.tsx        # Landing page
│       │   │   ├── globals.css     # Tailwind directives + keyframes
│       │   │   ├── (auth)/
│       │   │   │   └── login/page.tsx
│       │   │   ├── collection/page.tsx
│       │   │   ├── packs/page.tsx
│       │   │   ├── trade/page.tsx
│       │   │   └── battle/page.tsx
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   │   ├── CricketCard.tsx    # Core card component
│       │   │   │   └── RarityBadge.tsx
│       │   │   └── layout/
│       │   │       └── BottomNav.tsx      # Mobile bottom nav
│       │   ├── lib/
│       │   │   ├── supabase/
│       │   │   │   ├── client.ts          # Browser client
│       │   │   │   └── server.ts          # Server client (RSC / Server Actions)
│       │   │   └── utils.ts               # cn(), RARITY_COLORS, RARITY_GLOW
│       │   └── types/
│       │       └── index.ts               # All shared TypeScript types
│       ├── middleware.ts                   # Auth session refresh + route protection
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
├── sync-job/
│   ├── seed-cards.ts               # Script to upsert cards via service role key
│   └── cards-data.json             # Card data as JSON
├── docs/
│   └── claude/
│       ├── project-instructions.md (this file)
│       ├── chats/
│       │   ├── architecture.md
│       │   ├── frontend.md
│       │   ├── backend.md
│       │   ├── game-logic.md
│       │   └── devops.md
│       └── skills/
│           ├── card-component.md
│           └── data-model.md
└── .github/
    └── workflows/
        └── ci.yml
```

---

## Coding Conventions

### General
- **No default exports from lib files.** Use named exports in `lib/`, `types/`, and `components/`. Only page files (required by Next.js) and `layout.tsx` use default exports.
- **Always use `cn()` for classnames.** Import from `@/lib/utils`. Never concatenate class strings manually.
- **Framer Motion for all animations.** No CSS `transition` for interactive elements — use `motion.div` with `whileHover`, `whileTap`, `animate`. CSS keyframes only for continuous loops (shimmer, foil).
- **Supabase SSR for auth — never client-only.** Use `createServerClient` from `@/lib/supabase/server` in Server Components and API routes. Use `createBrowserClient` from `@/lib/supabase/client` only in Client Components that need realtime or user interaction.
- **Mobile-first layout with `max-w-md`.** All pages sit inside `max-w-md mx-auto`. Never add `lg:` or `xl:` breakpoints to core layout — this is a mobile app.

### TypeScript
- Strict mode is on. No `any` types unless absolutely unavoidable (comment why).
- Import types with `import type { ... }` when you only need the type.
- All shared types live in `src/types/index.ts`. Add new types there.

### Components
- Client Components (`'use client'`) only when needed: event handlers, hooks, Framer Motion, Supabase realtime.
- Server Components by default for pages that fetch data.
- Props interfaces are defined inline above the component, named `[Component]Props`.

### Styling
- Colors: always use the Tailwind config tokens (`brand`, `gold`, `pitch`, `cream`).
- Fonts: `font-display` (Bebas Neue) for headings, `font-body` (Inter) for body text.
- Dark background: `bg-gray-950` for page backgrounds, `bg-gray-900` for cards/panels.
- Rarity-based styling: use `RARITY_COLORS` and `RARITY_GLOW` from `@/lib/utils`.

---

## Database Conventions

- **Always enable RLS** on every table. No exceptions.
- **UUID primary keys** using `uuid_generate_v4()`.
- **`snake_case` column names** (e.g., `batting_avg`, `is_for_trade`).
- **`timestamptz` for all timestamps**, always with a `default now()`.
- JSONB for flexible fields (`stats`, `battle_log`, `rarity_weights`).
- Foreign keys always reference `auth.users(id) on delete cascade`.

---

## Design System

### Retro Big Babol Aesthetic
The visual language should evoke 1990s Indian cricket card packs:
- Cream card backgrounds (`#fdf8f0`) with colored borders
- Big bold Bebas Neue headings
- Rarity represented through color AND glow intensity
- Foil cards get an animated rainbow shimmer
- Legendary cards get a subtle shimmer animation even without foil

### Colors
```
brand:  #e63946  (Big Babol bubble gum red — CTAs, active states)
gold:   #f4a261  (card border gold — pack shop, coins)
pitch:  #2d6a4f  (cricket pitch green — success states)
cream:  #fdf8f0  (card background — card body)
```

### Rarity Visual Language
| Rarity | Border | Glow | Badge |
|--------|--------|------|-------|
| common | gray-500 | none | gray text |
| uncommon | green-500 | green-400/20 | green text |
| rare | blue-500 | blue-400/30 | blue text |
| legendary | yellow-400 gradient | yellow-400/50 | yellow text + shimmer |

---

## Free Tier Constraints

| Service | Free Limit | Notes |
|---------|-----------|-------|
| Supabase DB | 500 MB | 20 card records = trivial; user_cards grows over time |
| Supabase Realtime | 200 concurrent connections | Fine for solo dev |
| Supabase Auth | 50,000 MAU | More than enough |
| Cloudinary | 25 GB bandwidth/month | Optimize images to <100KB each |
| Vercel Hobby | 100 GB bandwidth/month | RSC reduces client JS |

**Key constraint:** Pack opening must be a Server Action (not client-side) to prevent users from gaming the random number generation. Never send pack opening logic to the client.
