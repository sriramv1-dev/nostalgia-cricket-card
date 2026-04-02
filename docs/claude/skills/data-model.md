# Skill: Data Model

## TypeScript Types → Database Schema Cross-Reference

All TypeScript types are defined in `apps/web/src/types/index.ts`.

### `Card` ↔ `public.cards`

| TypeScript Field | DB Column | DB Type | Notes |
|-----------------|-----------|---------|-------|
| `id` | `id` | `uuid` | PK, `uuid_generate_v4()` |
| `name` | `name` | `text` | e.g. "Sachin Tendulkar" |
| `era` | `era` | `text` | Default `'1990s'` |
| `nationality` | `nationality` | `text` | e.g. "India" |
| `role` | `role` | `text` | CHECK: batsman/bowler/allrounder/wicketkeeper |
| `rarity` | `rarity` | `text` | CHECK: common/uncommon/rare/legendary |
| `stats` | `stats` | `jsonb` | See `CardStats` interface |
| `special_ability` | `special_ability` | `text` | Nullable |
| `flavour_text` | `flavour_text` | `text` | Nullable |
| `image_url` | `image_url` | `text` | Nullable, Cloudinary URL |
| `created_at` | `created_at` | `timestamptz` | Auto |

### `CardStats` (nested in `Card.stats` jsonb)

| Field | Type | Description |
|-------|------|-------------|
| `batting_avg` | `number \| null` | Career batting average |
| `bowling_avg` | `number \| null` | Career bowling average (lower = better) |
| `strike_rate` | `number \| null` | Batting strike rate |
| `economy` | `number \| null` | Bowling economy rate |
| `catches` | `number \| null` | Career catches |
| `test_caps` | `number \| null` | Number of Test matches |
| `odi_caps` | `number \| null` | Number of ODI matches |

Bowlers will have `batting_avg: null`. Batsmen will have `bowling_avg: null`. Allrounders have all fields populated.

### `UserCard` ↔ `public.user_cards`

| TypeScript Field | DB Column | DB Type | Notes |
|-----------------|-----------|---------|-------|
| `id` | `id` | `uuid` | PK |
| `user_id` | `user_id` | `uuid` | FK → `auth.users.id` |
| `card_id` | `card_id` | `uuid` | FK → `cards.id` |
| `acquired_at` | `acquired_at` | `timestamptz` | When card was obtained |
| `is_for_trade` | `is_for_trade` | `boolean` | Owner listed for trade |
| `is_foil` | `is_foil` | `boolean` | Foil variant |
| `card` | — | — | Joined from `cards` (not a DB column) |

### `UserProfile` ↔ `public.user_profiles`

| TypeScript Field | DB Column | DB Type | Notes |
|-----------------|-----------|---------|-------|
| `id` | `id` | `uuid` | PK = `auth.users.id` |
| `username` | `username` | `text` | Unique |
| `coins` | `coins` | `integer` | Default 500 |
| `xp` | `xp` | `integer` | Default 0 |
| `level` | `level` | `integer` | Default 1, computed from xp |
| `avatar_url` | `avatar_url` | `text` | Nullable, Cloudinary URL |
| `created_at` | `created_at` | `timestamptz` | Auto |

### `Pack` ↔ `public.packs`

| TypeScript Field | DB Column | DB Type | Notes |
|-----------------|-----------|---------|-------|
| `id` | `id` | `uuid` | PK |
| `name` | `name` | `text` | Display name |
| `description` | `description` | `text` | Nullable |
| `price_coins` | `price_coins` | `integer` | Default 100 |
| `card_count` | `card_count` | `integer` | Cards per pack |
| `rarity_weights` | `rarity_weights` | `jsonb` | `{common:60, uncommon:25, rare:12, legendary:3}` |
| `image_url` | `image_url` | `text` | Nullable |

Note: `is_active` exists in DB but not in the TypeScript `Pack` type — add when needed for admin filtering.

### `Trade` ↔ `public.trades`

| TypeScript Field | DB Column | DB Type | Notes |
|-----------------|-----------|---------|-------|
| `id` | `id` | `uuid` | PK |
| `initiator_id` | `initiator_id` | `uuid` | FK → auth.users |
| `receiver_id` | `receiver_id` | `uuid` | FK → auth.users |
| `offered_card_ids` | `offered_card_ids` | `uuid[]` | Array of user_cards IDs |
| `requested_card_ids` | `requested_card_ids` | `uuid[]` | Array of user_cards IDs |
| `status` | `status` | `text` | pending/accepted/declined/cancelled |
| `message` | `message` | `text` | Nullable |
| `created_at` | `created_at` | `timestamptz` | Auto |
| `initiator?` | — | — | Joined UserProfile |
| `receiver?` | — | — | Joined UserProfile |

### `Battle` ↔ `public.battles`

| TypeScript Field | DB Column | DB Type | Notes |
|-----------------|-----------|---------|-------|
| `id` | `id` | `uuid` | PK |
| `player1_id` | `player1_id` | `uuid` | FK → auth.users |
| `player2_id` | `player2_id` | `uuid` | FK → auth.users |
| `player1_card_id` | `player1_card_id` | `uuid` | FK → cards |
| `player2_card_id` | `player2_card_id` | `uuid` | FK → cards |
| `winner_id` | `winner_id` | `uuid` | Nullable until battle ends |
| `battle_log` | `battle_log` | `jsonb` | Array of `BattleRound` |
| `created_at` | `created_at` | `timestamptz` | Auto |

---

## Common Query Patterns

### Fetch a user's full collection
```typescript
const { data: userCards } = await supabase
  .from('user_cards')
  .select(`
    id,
    acquired_at,
    is_for_trade,
    is_foil,
    card:cards (
      id, name, era, nationality, role, rarity,
      stats, special_ability, flavour_text, image_url
    )
  `)
  .eq('user_id', userId)
  .order('acquired_at', { ascending: false })
```

### Fetch cards available for trade (from all users)
```typescript
const { data: tradeCards } = await supabase
  .from('user_cards')
  .select(`
    id, user_id, is_foil,
    card:cards (id, name, rarity, role, stats, image_url),
    owner:user_profiles (id, username, avatar_url)
  `)
  .eq('is_for_trade', true)
  .neq('user_id', currentUserId)  // Exclude own cards
```

### Fetch all cards (the master list)
```typescript
const { data: allCards } = await supabase
  .from('cards')
  .select('*')
  .order('rarity', { ascending: false })  // legendary first
```

### Get user's open/pending trades
```typescript
const { data: trades } = await supabase
  .from('trades')
  .select(`
    *,
    initiator:user_profiles!trades_initiator_id_fkey (id, username),
    receiver:user_profiles!trades_receiver_id_fkey (id, username)
  `)
  .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
  .eq('status', 'pending')
  .order('created_at', { ascending: false })
```

### Get a user's battle history
```typescript
const { data: battles } = await supabase
  .from('battles')
  .select(`
    *,
    player1_card:cards!battles_player1_card_id_fkey (id, name, rarity, image_url),
    player2_card:cards!battles_player2_card_id_fkey (id, name, rarity, image_url)
  `)
  .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
  .order('created_at', { ascending: false })
  .limit(20)
```

---

## Important Notes

- **`offered_card_ids` and `requested_card_ids` in trades** store IDs from `user_cards`, not `cards`. This is intentional — a trade involves specific instances (which user owns which copy), not just card types.
- **`battle_log` is JSONB** typed as `BattleRound[]`. When reading battles from the DB, cast: `battle.battle_log as BattleRound[]`.
- **`stats` is JSONB** typed as `CardStats`. Cast when reading: `card.stats as CardStats`.
- **Foreign key hints in select:** When joining the same table twice (e.g., `user_profiles` for both `initiator` and `receiver` in trades), use the explicit FK name format: `user_profiles!trades_initiator_id_fkey`.
