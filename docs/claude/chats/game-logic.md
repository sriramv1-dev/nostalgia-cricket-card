# Game Mechanics

## Pack Opening Algorithm

Pack opening runs entirely server-side (Server Action). The algorithm:

```typescript
// Conceptual — implement in src/app/packs/actions.ts

function weightedRandom(weights: Record<Rarity, number>): Rarity {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (const [rarity, weight] of Object.entries(weights)) {
    rand -= weight
    if (rand <= 0) return rarity as Rarity
  }
  return 'common' // fallback
}

async function selectCardsForPack(pack: Pack, supabase: SupabaseClient): Promise<Card[]> {
  const selectedCards: Card[] = []

  for (let i = 0; i < pack.card_count; i++) {
    const rarity = weightedRandom(pack.rarity_weights)

    // Fetch a random card of that rarity
    // Supabase doesn't have RANDOM() natively in the client, so:
    const { data: cards } = await supabase
      .from('cards')
      .select('*')
      .eq('rarity', rarity)

    if (cards && cards.length > 0) {
      const randomIndex = Math.floor(Math.random() * cards.length)
      selectedCards.push(cards[randomIndex])
    }
  }

  return selectedCards
}
```

### Rarity Weights by Pack
| Pack | Common | Uncommon | Rare | Legendary |
|------|--------|----------|------|-----------|
| Classic 90s | 60% | 25% | 12% | 3% |
| Bowlers' Special | 40% | 30% | 22% | 8% |
| Subcontinent Stars | 50% | 30% | 17% | 3% |
| Premium Legends | 0% | 0% | 70% | 30% |

### Foil Cards
1% chance on any card pull (applied after rarity selection). The foil flag is set on the `user_cards` row, not the `cards` master record — the same card can exist as both foil and non-foil.

```typescript
const isFoil = Math.random() < 0.01
```

---

## Battle Resolution Algorithm

Battles are best-of-5 rounds. Each round compares a derived **power score** from each player's chosen card.

### Power Score Calculation

The base power varies by role matchup:

```typescript
type RoleMatchup = {
  stat: keyof CardStats
  multiplier: number
}

function getPowerScore(card: Card, opponentRole: PlayerRole): number {
  const stats = card.stats

  if (card.role === 'batsman') {
    // Batsmen are judged on batting average and strike rate
    const battingScore = (stats.batting_avg ?? 25) * 0.6
    const srScore = (stats.strike_rate ?? 70) * 0.2
    return battingScore + srScore
  }

  if (card.role === 'bowler') {
    // Bowlers: lower bowling avg = better. Invert it.
    const bowlingScore = (100 - (stats.bowling_avg ?? 35)) * 0.7
    const economyScore = (10 - (stats.economy ?? 5)) * 3
    return Math.max(0, bowlingScore + economyScore)
  }

  if (card.role === 'allrounder') {
    // Average of batting and bowling contributions
    const battingScore = (stats.batting_avg ?? 30) * 0.4
    const bowlingScore = (100 - (stats.bowling_avg ?? 30)) * 0.4
    return battingScore + bowlingScore
  }

  if (card.role === 'wicketkeeper') {
    // Keepers: batting + catches bonus
    const battingScore = (stats.batting_avg ?? 25) * 0.5
    const catchesBonus = Math.min(stats.catches ?? 0, 200) * 0.05
    return battingScore + catchesBonus
  }

  return 30 // fallback
}
```

### Round Resolution
```typescript
function resolveRound(
  card1: Card,
  card2: Card,
  round: number
): BattleRound {
  const base1 = getPowerScore(card1, card2.role)
  const base2 = getPowerScore(card2, card1.role)

  // Dice roll: 1d20 added to each score
  const roll1 = Math.floor(Math.random() * 20) + 1
  const roll2 = Math.floor(Math.random() * 20) + 1

  const final1 = base1 + roll1
  const final2 = base2 + roll2

  const commentary = generateCommentary(card1, card2, roll1, roll2, final1, final2)

  return {
    round,
    player1_roll: roll1,
    player2_roll: roll2,
    commentary,
  }
}
```

### Commentary Templates
```typescript
const COMMENTARY_TEMPLATES = {
  big_win: [
    '{winner} absolutely dominates this round!',
    '{winner} is in sublime form — {loser} has no answer!',
  ],
  close: [
    'An absolute nail-biter — {winner} edges it by the slimmest margin!',
    'Too close to call, but {winner} sneaks through!',
  ],
  legendary_moment: [
    // Triggered when a legendary card wins a round
    '{winner} reminds everyone why they are a legend of the game.',
  ],
}
```

### Battle Winner
The player who wins 3 out of 5 rounds wins the battle.

---

## Trade Validation Rules

Before a trade can be accepted, the server validates:

1. **Ownership check:** Every `offered_card_id` must be owned by `initiator_id`, and every `requested_card_id` must be owned by `receiver_id`.
2. **For-trade flag:** Offered cards must have `is_for_trade = true` (the initiator agreed to trade them).
3. **Status check:** Trade status must be `pending` before it can be accepted or declined.
4. **No duplicates:** A user cannot be in more than 5 active trades simultaneously (prevents locking up a card in multiple pending trades).

On acceptance:
- Transfer ownership: update `user_cards.user_id` for all involved cards.
- Update `trades.status = 'accepted'`.
- Award 10 XP to both parties.

---

## Coin Economy

### Starting Coins
Every new user receives **500 coins** (set in the `handle_new_user` trigger default).

### Earning Coins
| Action | Coins Earned |
|--------|-------------|
| Win a battle | 50 |
| Complete a trade | 20 (both parties) |
| Daily login streak (day 1) | 10 |
| Daily login streak (day 7) | 50 |
| First card collected | 25 (one-time) |

### Spending Coins
| Item | Cost |
|------|------|
| Classic 90s Pack | 100 |
| Bowlers' Special Pack | 150 |
| Subcontinent Stars Pack | 120 |
| Premium Legends Pack | 300 |

### Economy Sustainability
500 starting coins = 5 Classic packs. After that, you must earn through play. This encourages engagement without being predatory (no real money involved).

---

## XP and Leveling System

### XP Sources
| Action | XP |
|--------|-----|
| Open a pack | 25 |
| Win a battle | 50 |
| Lose a battle | 15 (participation) |
| Complete a trade | 20 |
| Collect a legendary card | 100 |
| Collect a rare card | 40 |

### Level Thresholds
```typescript
const XP_THRESHOLDS = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  900,  // Level 5
  1500, // Level 6
  2400, // Level 7
  3800, // Level 8
  6000, // Level 9
  9500, // Level 10 (max for now)
]

function getLevel(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1
  }
  return 1
}
```

Level is **computed from XP** — the `level` column in `user_profiles` is updated by a Server Action after every XP-earning event, not stored as the source of truth (XP is the source of truth).
