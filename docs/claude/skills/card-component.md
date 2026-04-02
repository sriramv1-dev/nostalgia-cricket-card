# Skill: CricketCard Component

**File:** `apps/web/src/components/ui/CricketCard.tsx`

## Props API

```typescript
interface CricketCardProps {
  card: Card          // Required. The card data from the database.
  showBack?: boolean  // Default: false. Show card back instead of face.
  size?: 'sm' | 'md' | 'lg'  // Default: 'md'.
  onClick?: () => void        // If provided, card is interactive (hover/tap animations active).
  isFoil?: boolean    // Default: false. Adds animated rainbow foil overlay.
  isSelected?: boolean // Default: false. Adds brand-red ring (for selection in trade/battle).
  isOffered?: boolean  // Default: false. Adds gold ring (card is part of a trade offer).
}
```

## Size Reference

| Size | Width | Image Height | Use Case |
|------|-------|-------------|----------|
| `sm` | 112px (w-28) | 112px | Grid thumbnails (4+ per row) |
| `md` | 160px (w-40) | 144px | Default — 2-column grid |
| `lg` | 224px (w-56) | 208px | Detail view, battle screen |

## Usage Examples

### Basic card in a collection grid
```tsx
import { CricketCard } from '@/components/ui/CricketCard'

<CricketCard card={userCard.card} size="md" />
```

### Interactive card with click handler
```tsx
<CricketCard
  card={userCard.card}
  size="md"
  onClick={() => openCardDetail(userCard.id)}
/>
```

### Foil legendary card (pack reveal)
```tsx
<CricketCard
  card={sachinCard}
  size="lg"
  isFoil={userCard.is_foil}
/>
```

### Card selected for battle
```tsx
<CricketCard
  card={myCard}
  size="lg"
  isSelected={selectedCardId === myCard.id}
  onClick={() => setSelectedCardId(myCard.id)}
/>
```

### Cards in a trade offer (offered = gold ring, requested = default)
```tsx
{/* Cards you're offering — gold ring */}
{offeredCards.map(c => (
  <CricketCard key={c.id} card={c} size="sm" isOffered />
))}

{/* Cards you're requesting — no ring */}
{requestedCards.map(c => (
  <CricketCard key={c.id} card={c} size="sm" />
))}
```

### Card back (face down during pack opening)
```tsx
<CricketCard card={card} size="md" showBack />
```

## Variants Explained

### Default
Cream background, rarity-colored border, player name, nationality, era, key stats, rarity badge. Hover: lifts with shadow. Tap: slightly squishes.

### Foil (`isFoil={true}`)
Adds an animated `card-foil` CSS class overlay (defined in `globals.css`). The rainbow gradient shifts continuously. Foil badge appears in top-right corner.

### Selected (`isSelected={true}`)
Adds a `ring-2 ring-brand ring-offset-2 ring-offset-gray-950` ring. Used in battle card selection and trade proposal flow.

### Offered (`isOffered={true}`)
Adds a `ring-2 ring-gold ring-offset-2 ring-offset-gray-950` ring. Used when displaying cards that are part of an active trade offer.

### Card Back (`showBack={true}`)
Shows a dark gradient panel with a faded cricket bat emoji. Used for face-down cards during pack reveal animation.

## Animation States

The component uses Framer Motion internally. Animations are only active when `onClick` is provided (i.e., the card is interactive):

| State | Animation |
|-------|-----------|
| Idle | No animation |
| Hover | `scale: 1.04`, elevated shadow |
| Tap | `scale: 0.97` |
| Legendary rarity | Continuous CSS shimmer (`card-shimmer` class) |
| Foil | Continuous CSS foil shift (`card-foil` class) |

## Rarity Visual Summary

| Rarity | Border Color | Header Gradient | Strip |
|--------|-------------|----------------|-------|
| common | `gray-500` | gray-700 → gray-900 | solid gray |
| uncommon | `green-500` | green-900 → gray-900 | solid green |
| rare | `blue-500` | blue-900 → gray-900 | solid blue |
| legendary | `yellow-400` | yellow-900 → gray-900 | animated gold gradient |

## Notes

- The `CricketCard` component is a **Client Component** (`'use client'`) because it uses Framer Motion's `motion.div`. If you need a server-rendered version without animations, create a `StaticCricketCard` that drops the `motion.div`.
- The `Image` from `next/image` is used for `card.image_url`. Always ensure Cloudinary URLs are in the `remotePatterns` in `next.config.ts`.
- Stats are displayed conditionally — if `batting_avg` is `null` (for a bowler), that stat row is hidden automatically.
