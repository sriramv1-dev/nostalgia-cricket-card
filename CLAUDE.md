# Nostalgia Cricket Card — Claude Code Standards

This file is read automatically by Claude Code at the start of every session.
Follow every rule here before writing any code. Do not deviate unless the user
explicitly overrides a rule in the current session.

---

## Project Overview

Full-stack digital cricket card collectible app. Four pillars: collect, open
packs, trade, battle. All players are retired 1990s legends — no live API.

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion,
Supabase (PostgreSQL + Auth), Cloudinary, Vercel.

**Repo structure:**
```
apps/web/          ← Next.js app
sync-job/          ← Node cron script
docs/claude/       ← Claude chat instruction backups
.github/           ← CI/CD workflows, issue templates
```

**Inside apps/web/src:**
```
app/               ← Pages (Next.js App Router)
components/        ← UI components
constants/         ← Static config and lookup data
hooks/             ← Custom React hooks
lib/               ← Utilities, queries, adapters
types/             ← TypeScript interfaces and types
```

---

## TypeScript Rules

- No `any` types — ever. Use `unknown` and narrow it.
- No non-null assertions (`!`) without an inline comment explaining why it is safe.
- All props interfaces named `[ComponentName]Props` and defined in the same file as the component.
- Types shared across files live in `/types` — never defined inside `/constants` or `/components`.
- Prefer `type` over `interface` for union types. Use `interface` for object shapes that may be extended.

---

## Component Rules

- Functional components only — no class components.
- Named exports for all components. Default exports only for Next.js pages.
- One exported component per file. Private sub-components (e.g. `CardFooter`) may live in the same file if under 40 lines and only used by the parent.
- No prop drilling beyond 2 levels — lift state or use composition.
- No business logic inside components — derived values belong in hooks (`/hooks`) or lib functions (`/lib`).
- No `console.log` in committed code.

---

## Styling Rules

- Tailwind for all styling — no CSS modules, no styled-components.
- Inline `style={{}}` only for values that come from runtime data (e.g. `backgroundColor: countryStyles.border`, `transform: scale(${n})`).
- Static values that never change must use Tailwind classes, not inline styles (e.g. `mt-10` not `style={{ marginTop: 40 }}`).
- No magic numbers in JSX — all card dimensions and scale factors come from `src/constants/card.ts`.

---

## Constants and Configuration

- `src/constants/card.ts` is the single source of truth for card dimensions and scale factors:
  ```ts
  export const CARD_WIDTH = 750
  export const CARD_HEIGHT = 1050
  export const CARD_SCALES = { grid: 0.333, detail: 0.5 } as const
  export const GRID_CARD = { width: 250, height: 350 } as const
  export const DETAIL_CARD = { width: 375, height: 525 } as const
  ```
- `src/constants/countries.ts` exports a single `COUNTRIES` record as source of truth. Helper functions (`getCountryStyles`, `getCountryCode`, `getCountryFlag`) derive from it — no separate switch statements.
- `src/constants/characters.ts` exports `getCharacterSources(role)` returning `CharacterSources` with a `scale: number` per role.
- Never hardcode country names, card dimensions, or scale factors outside their constants files.

---

## File Organisation

- Barrel exports (`index.ts`) for every folder under `/components` and `/lib`.
- No cross-feature imports — `/app/players` never imports from `/app/brand-side`.
- Test files co-located with source: `CricketCard.test.tsx` lives next to `CricketCard.tsx`.
- Raw data files (`.txt` stat files) are local only — never committed. `supabase/seeds/raw/` is in `.gitignore`.

---

## Page Rules

- Pages fetch data and compose components — no layout logic, no transform math inline in page files.
- Scale wrappers use `CardScaleWrapper` component — never raw inline transform divs in pages:
  ```tsx
  <CardScaleWrapper scale="grid">
    <CricketCard player={player} stats={stats} variant="player" />
  </CardScaleWrapper>
  ```
- `CardScaleWrapper` lives at `src/components/card/CardScaleWrapper.tsx` and reads dimensions from `src/constants/card.ts`.

---

## Async and Error Handling

- Always use `async/await` — no `.then()` chains.
- No bare `await` without try/catch or an error boundary above it.
- Supabase queries always check for `error` before using `data`.
- Query functions return `{ data, error }` shaped results — never throw directly.

---

## Card System Rules

- `CricketCard` always renders at exactly `750×1050px` — both variants. It never knows about its display scale.
- Scaling is always handled by the caller via `CardScaleWrapper`.
- `variant="player"` — static character (`animate={false}`), links to `/players/[id]`.
- `variant="brand"` — animated character (`animate={true}`), links to `/brand-side`.
- Both variants share `CardFooter` (country spine + stat box).
- `LayeredCharacter` reads `scale` from `CharacterSources` — never pass a hardcoded scale prop.

---

## Git Discipline

- Branch naming: `feat/`, `fix/`, `chore/` prefixes always.
- No direct commits to `main`.
- Every PR must pass `npm run type-check` before merge.
- Commit messages: imperative mood, present tense — "Add CardScaleWrapper" not "Added" or "Adding".

---

## What to Do Before Writing Any Code

1. Check if the relevant constants exist in `src/constants/card.ts` — if not, add them first.
2. Check if the type belongs in `/types` — if so, define it there before using it.
3. Check if a component already exists that does what you need — search before creating.
4. If creating a new component, create the barrel export entry at the same time.
5. Run `npm run type-check` after every change before marking a task done.

---

## What to Do After Writing Code

- Run `npm run type-check` — fix all errors before finishing.
- Remove all `console.log` statements.
- Confirm no magic numbers remain in JSX.
- Confirm no inline styles for static values.
