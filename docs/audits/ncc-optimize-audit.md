# NCC Optimization Audit — apps/web

Generated: 2026-07-05 · Skill: `.claude/skills/ncc-optimize/SKILL.md` · Scope: `apps/web/src`
Branch: `chore/code-optimization` (audit is read-only; no source files modified)

Paths below are relative to `apps/web/`.

---

## 1. FILE LENGTH + RESPONSIBILITY

FILE: src/components/card/CharacterCustomizerDiagram.tsx (792 lines)
ISSUE: Largest file in the app — centroid fetching, hue-slider UI, panel layout, connector SVG, and grid math in one file.
FIX: None directly — SACRED component. Note only: if ever refactored under explicit instruction, natural seams are `ColorPanel` (~319-390), centroid loading (~415), and grid layout math (~530-700).
RISK: HIGH

FILE: src/components/card/CustomizerMobile.tsx (576 lines)
ISSUE: Still large after the recent extraction of ColorEditorPanel/SnapStrip. Hitmap canvas sampling, box-layout math, centroid fetch, toast state, and render all co-located.
FIX: Extract `useHitmapSampler` hook (canvas + MIN_ALPHA sampling), `computeBoxLayout` → `lib/` pure function, and centroid fetch → shared `useCentroids` hook (see §6).
RISK: MED

FILE: src/app/card-builder/page.tsx (552 lines)
ISSUE: Page file contains a >40-line private component (`ColorField`, lines 133-186 — violates the 40-line private sub-component rule), three option config arrays (`ROLE_OPTIONS`, `MODE_OPTIONS`, `TAB_OPTIONS`), and domain logic (`getActiveKeys`, lines 25-48). Pages should fetch + compose only.
FIX: Move `ColorField` to `components/card/` (or reuse `ColorEditorPanel`/`ColorPopover` field pattern), option arrays to `src/constants/`, `getActiveKeys` to `src/constants/characters.ts` next to `getCharacterSources`.
RISK: MED

FILE: src/components/showcase/PlayerStatsShowcase.tsx (547 lines)
ISSUE: Three private sub-components (`StatCell`, `StatsTable`, `SectionCard` — each near/over the 40-line limit), five local constant maps, and stat-formatting functions (`bv`, `bolv`, `fldv`, `rowValues`) in one file.
FIX: Move formatting fns to `lib/` (e.g. `lib/statFormat.ts`), constant maps to `src/constants/` (see §2), and promote `StatsTable`/`SectionCard` to sibling files with barrel entries.
RISK: MED

FILE: src/components/card/StatsGrid.tsx (412 lines)
ISSUE: Local `tokens`/`variantTokens` theme objects plus three sub-components (`StatRow`, `SplitPill`, `SplitRow`).
FIX: Extract token maps to `src/constants/` and split `SplitRow` (68 lines) into its own file.
RISK: LOW

FILE: src/components/ui/BatSwitch.tsx (247 lines)
ISSUE: Over 200 lines; single responsibility (animated switch) but with heavy inline style blocks (see §3).
FIX: Acceptable to leave; optional extraction of the bat-handle sub-tree if it grows.
RISK: LOW

FILE: src/components/players/SearchFilterBar.tsx (224 lines)
ISSUE: Over 200 lines; combines search input, role multi-select, and URL param plumbing.
FIX: Extract URL param read/write into a small `usePlayersFilterParams` hook.
RISK: LOW

FILE: src/components/card/CustomizableLayeredCharacter.tsx (211 lines)
ISSUE: Marginally over 200 lines; cohesive. Contains duplicated glow-filter constants (see §2).
FIX: Only the constant extraction; no split needed.
RISK: LOW

(`src/constants/countries.ts` at 269 lines is pure data and exempt.)

---

## 2. MAGIC STRINGS + CONSTANTS

Note: `tailwind.config` already defines `brand.*`, `gold`, `cream`, `pitch`, `card-border`, and `nav: '60px'` tokens — but there is **no TS-side constants file for these colors**, so runtime code re-hardcodes hex values.

FILE: src/app/admin/card-builder/customize/page.tsx (line 103)
ISSUE: `ACTIVE_GLOW` drop-shadow string hardcodes `#e8257a` twice — and is an exact duplicate of `FILTER_ACTIVE` in CustomizableLayeredCharacter.tsx:23.
FIX: Export `CHARACTER_GLOW_FILTERS` from `src/constants/characters.ts`; import in both files.
RISK: LOW

FILE: src/components/card/CustomizableLayeredCharacter.tsx (lines 22-23)
ISSUE: `FILTER_IDLE`/`FILTER_ACTIVE` hardcode brand pink `#e8257a`.
FIX: Same shared constant as above, built from a `BRAND_COLORS.pink` value.
RISK: LOW

FILE: src/components/ui/BatSwitch.tsx (line 30)
ISSUE: Default prop `ballColor = "#e8257a"` hardcodes brand pink.
FIX: Import from a new `src/constants/theme.ts` (`BRAND_COLORS.pink`).
RISK: LOW

FILE: src/components/showcase/PlayerStatsShowcase.tsx (lines 163-190)
ISSUE: `SECTION_COLOR` (batting `#ea580c`, bowling `#7c3aed`, fielding `#d97706`), `FORMAT_LABEL`, `FORMAT_COLOR_DARK/LIGHT` all defined locally — exactly the values the design system owns.
FIX: Move to `src/constants/` (e.g. `stats.ts` or `theme.ts`); StatsGrid's token maps should draw from the same source.
RISK: LOW

FILE: src/app/page.tsx (line 45)
ISSUE: Hero gradient uses `#e63946` — an off-palette red that is not brand pink `#e8257a`, navy, or yellow. Likely a leftover from an earlier palette.
FIX: Confirm intent; replace with `BRAND_COLORS.pink` (or a Tailwind arbitrary class using the `brand` token).
RISK: LOW

FILE: src/components/card/CharacterCustomizerDiagram.tsx (line 499) and src/hooks/useAccessoryCustomization.ts (lines 10-36)
ISSUE: Brand pink and country palette hexes hardcoded — both SACRED.
FIX: Note only; fold into `BRAND_COLORS` if these files are ever opened under explicit instruction.
RISK: HIGH

FILE: src/app/layout.tsx (line 68), src/components/layout/PageHeaderSlot.tsx (line 9), src/app/card-builder/page.tsx (line 352), src/app/admin/card-builder/customize/page.tsx (line 125)
ISSUE: Mobile nav height `60px` appears as raw literals (`pb-[calc(60px+…)]`, `top-[60px]`, `h-[calc(100dvh-60px-…)]`, `100vh-172px` comment math) even though `nav: '60px'` exists in the Tailwind theme (`h-nav` is already used by Header.tsx).
FIX: Use the theme token: `top-nav`, `pb-[calc(theme(spacing.nav)+env(safe-area-inset-bottom))]` etc., or a CSS var `--nav-h` set once in layout.
RISK: LOW

FILE: multiple (routes)
ISSUE: `/card-builder?country=…` push target is built inline in 3 places (card-builder/page.tsx:377/538 area, customize/page.tsx:142/166) and `/players?…` in CountrySelect.tsx:21 + SearchFilterBar.tsx:102. Static hrefs elsewhere are fine.
FIX: Add `src/constants/routes.ts` with `ROUTES.cardBuilder(country)`, `ROUTES.players(params)`, `ROUTES.player(id, view?)` helpers.
RISK: LOW

Card dimensions: ✅ CLEAN — no raw `750`/`1050`/`0.333` outside `src/constants/card.ts` (only comments and display copy in stat-side/page.tsx:62).

---

## 3. INLINE STYLES

STATIC (should be Tailwind classes):

FILE: src/app/page.tsx (line 45)
ISSUE: Static radial-gradient background in `style={{}}`.
FIX: Tailwind arbitrary value: `bg-[radial-gradient(circle_at_50%_0%,#e63946_0%,transparent_60%)]` (after resolving the off-palette color, §2).
RISK: LOW

FILE: src/components/layout/Header.tsx (line 25)
ISSUE: Static 4-stop linear-gradient in `style={{}}`.
FIX: Move to a Tailwind arbitrary class or a named `bg-header-gradient` utility in the config.
RISK: LOW

FILE: src/components/ui/TabSwitch.tsx (line 52)
ISSUE: `style={{ height: "calc(100% - 18px)" }}` — static value.
FIX: `h-[calc(100%-18px)]`.
RISK: LOW

FILE: src/components/ui/BatSwitch.tsx (line 74)
ISSUE: `height: "calc(100% - 8px)"` is static (`width` beside it is dynamic and fine).
FIX: `h-[calc(100%-8px)]` and keep only `width` in `style`.
RISK: LOW

FILE: src/components/card/CustomizableLayeredCharacter.tsx (lines 169, 204)
ISSUE: `pointerEvents: "none"` / `opacity: 0` are static.
FIX: `pointer-events-none`, `opacity-0` classes.
RISK: LOW

FILE: src/components/card/CustomizerMobile.tsx (line 498)
ISSUE: `pointerEvents: "stroke", cursor: "pointer"` — static values on SVG hit line.
FIX: `[pointer-events:stroke] cursor-pointer` arbitrary classes.
RISK: LOW

FILE: src/app/players/[id]/page.tsx (lines 129-143)
ISSUE: Raw inline transform/scale wrapper divs in a **page** — direct violation of the CardScaleWrapper rule, and it re-implements exactly what `StatCardWrapper` does.
FIX: Replace both divs with `<StatCardWrapper scale={CARD_SCALES.detail}>` (already exists).
RISK: LOW (drop-in; visual diff check only)

DYNAMIC (legitimate — leave, optionally annotate `/* dynamic: … */`):
- CricketCard.tsx:44/48/106 — country styles (SACRED).
- LayeredCharacter.tsx, CharacterCustomizerDiagram.tsx — layer tints, centroid geometry, grid dims (SACRED).
- CardScaleWrapper.tsx / StatCardWrapper.tsx — scale-derived width/height.
- MultiSelect.tsx, CountryThumbnail.tsx, ColorPopover.tsx, ColorEditorPanel.tsx, CustomizerMobile box layout — runtime colors/positions.
- collection/page.tsx:45 — staggered `animationDelay`.
- BatSwitch ballColor/handleColor, TabSwitch ball position.

---

## 4. SVG EXTRACTION

FILE: src/components/layout/BottomNav.tsx (5 inline SVGs)
ISSUE: Static nav icons defined inline.
FIX: Extract to `components/icons/` (`HomeIcon`, `PlayersIcon`, …) with a barrel; reuse across Header if applicable.
RISK: LOW

FILE: src/app/card-builder/page.tsx (9 inline SVGs)
ISSUE: Largest inline-icon cluster in the app — mode/tab/role option icons defined in page-level config arrays.
FIX: Extract to `components/icons/` and reference from the (also-extracted, §1) option arrays.
RISK: LOW

FILE: src/app/admin/card-builder/customize/page.tsx (2), src/app/(auth)/login/page.tsx (2), src/components/players/ViewSwitcher.tsx (2)
ISSUE: Static icons inline.
FIX: Same `components/icons/` extraction; ViewSwitcher's grid/table icons are reusable.
RISK: LOW

FILE: src/components/card/CustomizerMobile.tsx (2 inline SVGs)
ISSUE: Connector-line SVG driven by centroid data.
FIX: None — DYNAMIC, keep inline.
RISK: —

FILE: src/components/card/CharacterCustomizerDiagram.tsx
ISSUE: Dynamic connector SVG — SACRED anyway.
FIX: Keep inline. RISK: HIGH (note only)

---

## 5. REPEATED TAILWIND PATTERNS

FILE: src/app/{collection,battle,trade,packs}/page.tsx (+ admin/login for the heading)
ISSUE: The four placeholder pages repeat identical strings:
- `"flex flex-col min-h-screen pb-20"` (4×)
- `"font-display text-3xl text-cream tracking-wider"` (5×)
- `"sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-4 py-4"` (3×)
- `"text-gray-400 text-xs font-semibold tracking-wider mb-3"` (3×)
FIX: One `ComingSoonPage` (or `PageShell`, §11) component with `title`/`children` props kills all four duplicates. Does not overlap existing CVA components — heading style could become the missing `SectionLabel` variant.
RISK: LOW

FILE: src/app/(auth)/login/page.tsx + src/app/admin/login/page.tsx
ISSUE: `"w-full bg-gray-900 border border-gray-700 focus:border-brand rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors disabled:opacity-50"` duplicated.
FIX: New CVA component `InputField` in `components/ui/` (no overlap with FormatPill/RoleBadge/RarityBadge/CardButton).
RISK: LOW

FILE: character-layer components (6×)
ISSUE: `"absolute inset-0 w-full h-full object-contain select-none"` repeated across LayeredCharacter (SACRED), CharacterCustomizerDiagram (SACRED), CustomizableLayeredCharacter, CustomizerMobile.
FIX: Export `LAYER_IMG_CLASS` from `src/constants/characters.ts`; adopt in the two non-sacred files only.
RISK: LOW (non-sacred) / HIGH (sacred occurrences — note only)

Also noted: `SectionLabel` is listed in CLAUDE.md as an existing CVA component but no `cva()` file for it exists — only FormatPill, RoleBadge, RarityBadge, CardButton (+ new ColorEditorPanel/CustomizerMobile usages). Worth reconciling docs vs code.

---

## 6. MISSING OR DUPLICATED HOOKS

FILE: src/hooks/useMediaQuery.ts
ISSUE: SSR-safe matchMedia hook exists — exactly the prescribed pattern — but has **zero call sites**. Dead code.
FIX: Either delete it, or keep it as the sanctioned `useIsMobile` building block (`const useIsMobile = () => useMediaQuery("(max-width: 767px)")`). Currently breakpoint switching is done in CSS (`md:hidden`), which is better — so deletion is the honest option unless JS breakpoint logic is planned.
RISK: LOW

FILE: src/components/card/CustomizerMobile.tsx (line 150) + src/components/card/CharacterCustomizerDiagram.tsx (line 415)
ISSUE: Identical `fetch(\`/data/centroids/${shot}.json\`)` logic duplicated; no caching between the two.
FIX: Create `useCentroids(shotType)` in `src/hooks/` with a module-level cache. Adopt in CustomizerMobile now; the Diagram copy is SACRED — note only.
RISK: MED (hook + one adoption LOW; sacred side HIGH)

FILE: src/components/card/CustomizerMobile.tsx (line 46) + src/app/admin/card-builder/customize/page.tsx (line 106)
ISSUE: `deriveRole(shot)` duplicated verbatim in two files.
FIX: Move to `src/constants/characters.ts` (it is a shot→role domain mapping) and import in both.
RISK: LOW

FILE: src/app/card-builder/page.tsx (lines 25-48)
ISSUE: `getActiveKeys(role, shot)` — role→colorable-keys domain mapping living in a page; overlaps conceptually with availability logic inside useAccessoryCustomization (SACRED).
FIX: Move to `src/constants/characters.ts`; do not touch the sacred hook.
RISK: LOW

FILE: src/app/admin/page.tsx (line 8)
ISSUE: Raw `supabase.from("players")` in a page — the only Supabase fetch outside `lib/queries`/API routes.
FIX: Add `fetchPendingPlayers()` to `src/lib/queries/players.ts` returning `QueryResult`.
RISK: LOW

---

## 7. SERVER vs CLIENT COMPONENTS

41 files carry `"use client"`. Justified (state/effects/handlers/context): all pages with forms or customizer state, BatSwitch, TabSwitch, Select, MultiSelect, BottomSheet, CardWrapper, CountryThumbnail, ColorEditorPanel, ColorPopover, PoseThumbnail, SearchFilterBar, CountrySelect, ViewSwitcher, Header, BottomNav, PageHeader/Slot/Title (context), contexts, hooks, MemoizedCricketCard (`memo` requires client), PlayerStatsShowcaseLazy (`next/dynamic ssr:false`).

FILE: src/components/card/StatCardWrapper.tsx (line 1)
ISSUE: `"use client"` but no hooks, handlers, or browser APIs — pure derived-value rendering (its sibling CardScaleWrapper is correctly a Server Component).
FIX: Delete the `"use client"` directive.
RISK: LOW

FILE: src/components/card/CricketCard.tsx (line 1)
ISSUE: `"use client"` with zero hooks/handlers — could in principle be a Server Component, shrinking the bundle for every grid page.
FIX: None — SACRED. Note only.
RISK: HIGH

---

## 8. IMAGE OPTIMISATION

9 `<img>` tags found; **no Cloudinary URLs anywhere** (all character-layer PNGs are local `/characters/...` assets). `next/image` is already used in CricketCard, StatCard, PlayerActionImage.

FILE: src/components/card/PoseThumbnail.tsx (line 28)
ISSUE: `<img>` for pose thumbnails in a picker grid; no `loading="lazy"`, no `next/image` sizing benefits.
FIX: Switch to `next/image` with explicit width/height, or minimally add `loading="lazy" decoding="async"`.
RISK: LOW

FILE: src/components/card/CustomizerMobile.tsx (lines 419, 435) + src/components/card/CustomizableLayeredCharacter.tsx (lines 163, 198)
ISSUE: Plain `<img>` for character layers. Caution: CustomizerMobile samples the hitmap through a canvas — `next/image` URL rewriting can complicate pixel sampling, and layer stacking relies on exact intrinsic sizing.
FIX: Add `loading="lazy"`/`decoding="async"` where below-fold; do NOT force `next/image` on hitmap-related images without testing canvas sampling.
RISK: MED

FILE: src/components/card/LayeredCharacter.tsx (line 114), src/components/card/CharacterCustomizerDiagram.tsx (lines 183, 700, 716)
ISSUE: Same pattern — SACRED files.
FIX: Note only.
RISK: HIGH

---

## 9. TYPESCRIPT GAPS

`any` types: ✅ ZERO found (explicit or `as any`). Strict mode holding.

FILE: src/lib/queries/insertPlayer.ts (lines 7-8), src/lib/supabase/client.ts (lines 12-13), src/lib/supabase/server.ts (lines 25-26, 33-34)
ISSUE: Non-null assertions on `process.env.*` without the required inline safety comment.
FIX: Add `// safe: validated at boot / required by Vercel env config` comments, or a small `requireEnv()` helper.
RISK: LOW

FILE: src/app/admin/card-builder/customize/page.tsx (lines 113, 155, 164)
ISSUE: `shot as ShotType` casts an unvalidated URL search param — a bad `?shot=` value flows into `SHOT_SOURCES[shot]` and crashes or 404s layers.
FIX: Validate with a `isShotType(x): x is ShotType` guard (derive from the keys of `SHOT_SOURCES`), fall back to `"alpha"`.
RISK: LOW

FILE: src/components/ui/RoleBadge.tsx (line 19) + src/components/players/SearchFilterBar.tsx (line 190)
ISSUE: `"batter" | "bowler" | "allrounder" | "keeper"` union defined locally in RoleBadge and re-asserted via cast in SearchFilterBar — shared type living in a component file, against the `/types` rule.
FIX: Export `PlayerRole`-aligned `RoleKey` from `src/types/` and import in both.
RISK: LOW

FILE: src/lib/queries/insertPlayer.ts (lines 32, 53)
ISSUE: Throws (`throw new Error("DB_INSERT_FAILED…")`) instead of returning `{ data, error }` — violates the query-function contract used everywhere else in `lib/queries`.
FIX: Return `QueryResult<string>`; adjust the API route caller.
RISK: MED

---

## 10. SUPABASE PATTERNS

All 11 `.from()` call sites checked. Error handling: ✅ every query in `lib/queries/players.ts` and both API routes checks `error` before `data`. `player_format` known bug: ✅ not present anywhere.

FILE: src/app/admin/page.tsx (line 8)
ISSUE: Direct query in page (duplicates the `players` select pattern in lib/queries); error is passed to `renderQueue` rather than the standard `QueryResult` shape.
FIX: Move to `lib/queries/players.ts` as `fetchPendingPlayers()` (same fix as §6).
RISK: LOW

FILE: src/lib/queries/insertPlayer.ts (lines 5-10)
ISSUE: Defines its own `createSupabaseServiceClient()` — duplicate of the factory already exported by `src/lib/supabase/server.ts` (line 33).
FIX: Delete the local copy; import from `@/lib/supabase/server`.
RISK: LOW

FILE: src/lib/queries/insertPlayer.ts (lines 32, 53)
ISSUE: Throw-based error handling (cross-listed in §9).
FIX: `QueryResult` shape.
RISK: MED

Seed SQL NULL typing: out of `apps/web` scope (`supabase/seeds/` at repo root) — not audited here.

---

## 11. LAYOUT COMPONENT AUDIT

- `components/layout/Header.tsx` — ✅ exists, used via root layout, uses the `h-nav` token correctly.
- `components/layout/BottomNav.tsx` — ✅ exists, mobile nav.
- `components/layout/PageShell.tsx` — ❌ DOES NOT EXIST (`MobileContainer.tsx` exists but is narrower in purpose).

FILE: src/app/card-builder/page.tsx (lines 350-352) + src/app/admin/card-builder/customize/page.tsx (lines 124-126)
ISSUE: Both pages hand-compute viewport chrome offsets (`h-[calc(100dvh-60px-env(safe-area-inset-bottom))]`, `h-[calc(100vh-172px)]`) with comments admitting they "mirror the root layout chrome" — layout knowledge leaking into pages, and the two calculations have already drifted (dvh vs vh, 172 vs 112+60).
FIX: Create `PageShell` (full-height variant) that owns nav-offset math once, using the `nav` token; both pages consume it.
RISK: MED

FILE: src/app/{collection,battle,trade,packs}/page.tsx
ISSUE: Each re-implements the same shell + sticky header (cross-listed in §5).
FIX: Same `PageShell`/`ComingSoonPage` extraction.
RISK: LOW

---

## 12. RESPONSIVENESS PATTERN AUDIT

- `window.innerWidth`: ✅ none.
- `orientationchange`: ✅ none (CustomizerMobile uses ResizeObserver for canvas measurement — legitimate).
- Multi-value breakpoint hooks: ✅ none (useMediaQuery returns a single boolean|null — correct design, just unused, §6).
- Breakpoint switching is CSS-first (`hidden md:flex` in CharacterCustomizationWrapper and customize page): ✅ the prescribed pattern.

FILE: src/components/card/CharacterCustomizerDiagram.tsx (line 530)
ISSUE: Direct `window.matchMedia("(min-width: 1024px)")` call instead of the shared hook.
FIX: None — SACRED. Note only: this is the natural adopter of `useMediaQuery` if ever opened.
RISK: HIGH

FILE: src/components/card/CharacterCustomizationWrapper.tsx + src/app/admin/card-builder/customize/page.tsx (lines 154-170)
ISSUE: The customize page re-implements the wrapper's responsive split inline (Diagram on `md:`, mobile branch below) instead of using/extending CharacterCustomizationWrapper — and both card-builder pages duplicate the `nextDynamic(CustomizerMobile)` import block.
FIX: Add a `mobileVariant="customizer" | "tap"` prop to the wrapper (wrapper is NOT sacred) or export a shared `CustomizerMobileLazy` (pattern already exists: PlayerStatsShowcaseLazy).
RISK: MED

---

## TOP 15 FIXES

RANK 1: [src/app/players/[id]/page.tsx] — Replace raw inline transform divs (lines 129-143) with existing StatCardWrapper — rule violation, drop-in fix — RISK: LOW
RANK 2: [src/hooks/useMediaQuery.ts] — Delete (or formally adopt) the dead useMediaQuery hook — RISK: LOW
RANK 3: [CustomizerMobile.tsx + customize/page.tsx] — De-duplicate `deriveRole()` into src/constants/characters.ts — RISK: LOW
RANK 4: [customize/page.tsx + CustomizableLayeredCharacter.tsx] — Share one `CHARACTER_GLOW_FILTERS` constant (removes 2× hardcoded #e8257a strings) — RISK: LOW
RANK 5: [src/lib/queries/insertPlayer.ts] — Reuse the existing service-client factory from lib/supabase/server and return QueryResult instead of throwing — RISK: MED
RANK 6: [src/app/admin/page.tsx] — Move inline players query to lib/queries as `fetchPendingPlayers()` — RISK: LOW
RANK 7: [collection/battle/trade/packs pages] — Extract `ComingSoonPage` component (kills 4× duplicated shell/heading/sticky-header class strings) — RISK: LOW
RANK 8: [src/components/layout/BottomNav.tsx + card-builder/page.tsx] — Extract ~18 inline SVGs to components/icons/ with barrel — RISK: LOW
RANK 9: [src/components/showcase/PlayerStatsShowcase.tsx] — Move SECTION_COLOR / FORMAT_LABEL / FORMAT_COLOR maps to src/constants — RISK: LOW
RANK 10: [src/hooks/] — New `useCentroids(shotType)` hook; adopt in CustomizerMobile (Diagram copy is sacred — note only) — RISK: MED
RANK 11: [customize/page.tsx] — Validate `shot` URL param with a ShotType guard instead of `as ShotType` casts — RISK: LOW
RANK 12: [src/app/card-builder/page.tsx] — Split page: ColorField → component, option arrays + getActiveKeys → constants — RISK: MED
RANK 13: [layout.tsx / PageHeaderSlot / card-builder pages] — Replace raw 60px literals with the existing `nav` theme token; longer-term PageShell owns offset math — RISK: MED
RANK 14: [StatCardWrapper.tsx + login pages] — Drop unneeded "use client" from StatCardWrapper; extract shared CVA `InputField` for the duplicated login input class — RISK: LOW
RANK 15: [src/constants/theme.ts (new)] — Introduce BRAND_COLORS TS constants aligned with tailwind.config; replace raw hex in BatSwitch, page.tsx (incl. off-palette #e63946), glow filters — RISK: MED

---

## SUGGESTED PASSES

### Pass 1 — Constants consolidation (Ranks 3, 4, 9, 15)
Create `src/constants/theme.ts` (BRAND_COLORS, section/format color maps), move `deriveRole` + glow filters into `src/constants/characters.ts`, resolve the off-palette `#e63946`. Pure extractions, no behavior change; `npm run type-check` is the gate.

### Pass 2 — Card & page conformance (Ranks 1, 11, 12)
Fix the StatCardWrapper violation on the player detail page, add the ShotType guard, and slim `card-builder/page.tsx` down to fetch-and-compose (ColorField, option arrays, getActiveKeys out).

### Pass 3 — Data layer hygiene (Ranks 5, 6, 10)
Unify Supabase client factories, convert insertPlayer to `QueryResult`, move the admin queue query into `lib/queries`, and introduce `useCentroids` (CustomizerMobile only — sacred Diagram untouched).

### Pass 4 — Shared UI extraction (Ranks 7, 8, 14)
`ComingSoonPage` for the four placeholder pages, `components/icons/` barrel for the ~18 static inline SVGs, CVA `InputField`, and remove the stray `"use client"` from StatCardWrapper.

### Pass 5 — Layout tokens (Ranks 2, 13)
Replace 60px literals with the `nav` token, decide keep-or-delete on `useMediaQuery`, and (optionally, as its own follow-up) introduce `PageShell` to own viewport-offset math for the two customizer pages.

---

## Clean bill of health (verified, no findings)
- Zero `any` types anywhere in src.
- Zero `window.innerWidth` / `orientationchange` usage.
- Card dimension constants (750/1050/0.333/0.5) fully centralized in `src/constants/card.ts`.
- All Supabase queries check `error` before `data` (except the throw-pattern in insertPlayer, flagged above).
- `player_format` bug: absent.
- No Cloudinary `<img>` regressions.
- Barrel exports present for every `components/*` and `lib/*` folder.
- Breakpoint handling is CSS-first (`md:hidden`) as prescribed.
