# Navigation Structure

## Visible pages (nav-linked)
- `/players` — Player listing grid

## Hidden pages (accessible via direct URL, not in nav)
- `/packs` — Pack opening mechanic (Phase 4)
- `/battles` — Battle system (Phase 5)  
- `/trade` — Trading system (Phase 5)
- `/collection` — User collection (requires auth)
- `/admin/card-builder` — Internal dev tool (never in nav)
- `/brandside` — Brand card customiser (internal dev tool)

## Navigation components
- `Header.tsx` — Sticky top bar (desktop/tablet) + bottom tab bar (mobile)
- `CardWrapper.tsx` — ResizeObserver fluid card scaling
