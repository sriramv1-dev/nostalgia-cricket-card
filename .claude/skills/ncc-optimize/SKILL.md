---
name: ncc-optimize
description: Audit the apps/web codebase of the Nostalgia Cricket Card app for optimization opportunities across structure, performance, reusability, and maintainability. Use when asked to run an optimization audit, code quality audit, find refactoring opportunities, or review the codebase for magic strings, inline styles, repeated Tailwind patterns, client/server component boundaries, or Supabase query duplication in this repo.
---

# NCC Optimization Audit Skill
# Nostalgia Cricket Card — Code Quality & Optimization

## Purpose
Audit the apps/web codebase for optimization opportunities across
structure, performance, reusability, and maintainability. This skill
encodes project-specific conventions and constraints so the audit is
accurate for THIS codebase, not generic React advice.

---

## Sacred components — READ ONLY, never modify
- CricketCard.tsx
- LayeredCharacter.tsx
- CharacterCustomizerDiagram.tsx
- ColorPopover
- useAccessoryCustomization

Flag findings in these files as HIGH RISK — note only, never propose
direct edits.

---

## Stack context (audit must account for these)
- Next.js 14 App Router — Server Components are valuable, "use client"
  should be minimised
- Tailwind CSS only — no inline styles for static values, no CSS modules,
  no styled-components
- CVA (class-variance-authority) already used for variants — extend it,
  don't duplicate
- Supabase via @supabase/ssr directly — no Prisma, no ORM
- Framer Motion for animations
- TypeScript strict — no any

---

## Audit categories

### 1. FILE LENGTH + RESPONSIBILITY
Flag any file over 200 lines.
For each, identify:
- Mixed concerns (data fetching + layout + sub-components in one file)
- Natural split points
- Names for extracted pieces
- Whether split would touch a sacred component (HIGH RISK if yes)

### 2. MAGIC STRINGS + CONSTANTS
Find every hardcoded value that should be in lib/constants.ts:

Brand colors to extract:
  pink: #e8257a, navy: #1a3a8a, yellow: #ffd600

Section colors to extract:
  batting: #ea580c, bowling: #7c3aed, fielding: #d97706

Format pill colors to extract:
  test: #78350f, odi: #1d4ed8, t20i: #be185d

Routes to extract:
  /, /players, /players/[id], /admin/card-builder,
  /admin/card-builder/customize, /brand-side

Card dimensions to extract:
  nativeWidth: 750, nativeHeight: 1050,
  scaleGrid: 0.333, scaleDetail: 0.5

Nav height to extract: 60 (mobile bottom nav px value)

Flag every file containing these as raw literals.

### 3. INLINE STYLES
Find every instance of style={{}} in JSX.
Classify each as:
- STATIC: should be Tailwind class → flag for conversion
- DYNAMIC: driven by runtime data (centroid positions, country
  colors, accessory colors) → legitimate, leave with comment
  /* dynamic: [reason] */

Known legitimate dynamic styles:
- Connector line x1/y1/x2/y2 coordinates (centroid data)
- Country preset background colors
- Accessory color overlays on character layers

### 4. SVG EXTRACTION
Find all inline SVGs in JSX. Categorise:
- ICON: static, reusable (check icon, reset icon, nav icons)
  → should be components/icons/[Name]Icon.tsx
- DYNAMIC: position/shape driven by JS data (connector lines)
  → keep inline
- DECORATIVE: fixed illustration
  → move to public/, use next/image or SVGR import

### 5. REPEATED TAILWIND PATTERNS
Find class strings appearing identically 2+ times across different
files. For each:
- Quote the repeated string
- List which files contain it
- Suggest CVA variant name
- Check if it overlaps with existing CVA components
  (FormatPill, RoleBadge, SectionLabel, CardButton, RarityBadge)
  before proposing a new one

### 6. MISSING OR DUPLICATED HOOKS
Find logic repeated across 2+ components that should be a hook.
Known hooks that should exist:
- useIsMobile(breakpoint?) — SSR-safe, matchMedia-based,
  defaults to false on server. DO NOT suggest window.innerWidth
  polling or orientationchange events.
- useCentroids(shotType) — fetch + cache centroid JSON
- useCountryPresets() — country color loading if duplicated
Flag any Supabase fetch logic not already in a shared hook.

### 7. SERVER vs CLIENT COMPONENTS
List every "use client" directive found.
For each component, check:
- Does it use useState, useEffect, useRef, or event handlers?
  → Client component justified
- Does it only render JSX with no interactivity?
  → Could be Server Component — flag it
Goal: minimise "use client" surface area to reduce JS bundle.

### 8. IMAGE OPTIMISATION
Find every <img> tag (not next/image <Image>).
Flag:
- Any loading a Cloudinary URL → should use next/image for
  automatic WebP + CDN optimisation
- Any large static asset → should use next/image with
  width/height or fill
- Any below-fold image missing loading="lazy"

### 9. TYPESCRIPT GAPS
Find:
- any types (explicit or implicit)
- Props interfaces missing on components
- Missing return types on async server functions
- Supabase query results used without type assertion or
  generated types
- Enums used as strings instead of the typed enum
  (cricket_format, player_role)

### 10. SUPABASE PATTERNS
Find every supabase.from() call. Flag:
- Duplicate queries across files → should be a shared hook
- Missing .error check after query
- Missing loading state handling
- Using player_format instead of cricket_format (known bug)
- NULL values in seed SQL not explicitly typed

### 11. LAYOUT COMPONENT AUDIT
Check whether these exist and are used consistently:
- components/layout/Header.tsx — desktop/tablet nav
- components/layout/BottomNav.tsx — mobile nav
- components/layout/PageShell.tsx — wraps header + nav +
  correct padding for each breakpoint

If any page implements its own nav or padding logic instead of
using these shared components, flag it.

### 12. RESPONSIVENESS PATTERN AUDIT
Flag any component that:
- Uses window.innerWidth directly → should use matchMedia
- Uses orientationchange event → unreliable, use matchMedia
- Has a useResponsiveness / useBreakpoint hook returning
  multiple values → likely causes unnecessary re-renders
- Uses inline JS breakpoint logic where Tailwind classes would
  suffice (md:hidden, hidden md:flex etc.)

---

## Output format

Produce one section per audit category above.
Within each section, list findings as:
  FILE: path/to/file.tsx (line ~N)
  ISSUE: what is wrong
  FIX: what to do
  RISK: LOW | MED | HIGH

After all categories, produce:

### TOP 15 FIXES
Ranked by: impact × ease (highest first).
Format each as:
  RANK N: [File] — [One-line description] — RISK: LOW/MED/HIGH

### SUGGESTED PASSES
Group the top 15 into logical Fable implementation passes
(3-5 fixes per pass, related concerns together).
Name each pass and list its fixes.

---

## What NOT to suggest
- styled-components, @emotion, or any CSS-in-JS library
- TanStack Router (project is staying on Next.js App Router)
- Prisma or any ORM (project uses @supabase/ssr directly)
- Any modification to sacred components
- useResponsiveness hook returning isMobile + isTablet +
  isDesktop + isWide all at once (over-engineered, causes
  re-renders)
- window.innerWidth polling
- orientationchange events
- Converting Tailwind to CSS modules
