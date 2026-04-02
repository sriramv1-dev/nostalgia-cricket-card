/**
 * seed-cards.ts
 *
 * Upserts the 20 classic 1990s cricket cards into Supabase using the service role key.
 * Run locally — never run on Vercel or CI.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> npx ts-node sync-job/seed-cards.ts
 *
 * Or with a .env file:
 *   npx ts-node -r dotenv/config sync-job/seed-cards.ts dotenv_config_path=sync-job/.env.local
 */

import { createClient } from '@supabase/supabase-js'
import cardsData from './cards-data.json'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'
type PlayerRole = 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper'

interface CardInput {
  name: string
  era: string
  nationality: string
  role: PlayerRole
  rarity: Rarity
  stats: {
    batting_avg: number | null
    bowling_avg: number | null
    strike_rate: number | null
    economy: number | null
    catches: number | null
    test_caps: number | null
    odi_caps: number | null
  }
  special_ability: string | null
  flavour_text: string | null
  image_url?: string | null
}

// ---------------------------------------------------------------------------
// Supabase setup
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    '❌  Missing environment variables.\n' +
      '   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  )
  process.exit(1)
}

// The service role client bypasses RLS — use only locally and with care.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function seedCards() {
  console.log(`\n🏏  Nostalgia Cricket Card — Seed Script`)
  console.log(`   Upserting ${cardsData.length} cards into Supabase...\n`)

  const cards = cardsData as CardInput[]

  // Upsert by name (treat name as the natural key for seed purposes)
  // In production, use the UUID as the upsert key.
  const { data, error } = await supabase
    .from('cards')
    .upsert(
      cards.map((card) => ({
        name: card.name,
        era: card.era,
        nationality: card.nationality,
        role: card.role,
        rarity: card.rarity,
        stats: card.stats,
        special_ability: card.special_ability ?? null,
        flavour_text: card.flavour_text ?? null,
        image_url: card.image_url ?? null,
      })),
      {
        onConflict: 'name',  // upsert on name
        ignoreDuplicates: false,
      }
    )
    .select('id, name, rarity')

  if (error) {
    console.error('❌  Upsert failed:')
    console.error('   ', error.message)
    if (error.details) console.error('   Details:', error.details)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.warn('⚠️   No rows returned. Cards may already exist with correct data.')
    return
  }

  // Print results grouped by rarity
  const byRarity: Record<string, typeof data> = {}
  for (const card of data) {
    const r = card.rarity as string
    if (!byRarity[r]) byRarity[r] = []
    byRarity[r].push(card)
  }

  const rarityOrder: Rarity[] = ['legendary', 'rare', 'uncommon', 'common']
  const rarityEmoji: Record<string, string> = {
    legendary: '⭐',
    rare: '🔵',
    uncommon: '🟢',
    common: '⚪',
  }

  for (const rarity of rarityOrder) {
    const group = byRarity[rarity]
    if (!group) continue
    console.log(`${rarityEmoji[rarity]}  ${rarity.toUpperCase()} (${group.length})`)
    for (const card of group) {
      console.log(`   ✓ ${card.name} [${card.id}]`)
    }
  }

  console.log(`\n✅  Successfully upserted ${data.length} cards.`)

  // Seed packs if they don't exist
  await seedPacks()
}

async function seedPacks() {
  console.log('\n📦  Seeding packs...')

  const packs = [
    {
      name: 'Classic 90s Pack',
      description: 'Legends of the golden era. Contains 5 cards with a chance of legendary.',
      price_coins: 100,
      card_count: 5,
      rarity_weights: { common: 60, uncommon: 25, rare: 12, legendary: 3 },
      is_active: true,
    },
    {
      name: "Bowlers' Special",
      description: 'Pace and spin legends. Higher chance of rare bowlers.',
      price_coins: 150,
      card_count: 5,
      rarity_weights: { common: 40, uncommon: 30, rare: 22, legendary: 8 },
      is_active: true,
    },
    {
      name: 'Subcontinent Stars',
      description: 'The best from India, Pakistan, and Sri Lanka.',
      price_coins: 120,
      card_count: 5,
      rarity_weights: { common: 50, uncommon: 30, rare: 17, legendary: 3 },
      is_active: true,
    },
    {
      name: 'Premium Legends',
      description: 'Guaranteed rare or above. For serious collectors.',
      price_coins: 300,
      card_count: 3,
      rarity_weights: { common: 0, uncommon: 0, rare: 70, legendary: 30 },
      is_active: true,
    },
  ]

  const { data, error } = await supabase
    .from('packs')
    .upsert(packs, { onConflict: 'name', ignoreDuplicates: false })
    .select('id, name, price_coins')

  if (error) {
    console.warn('⚠️   Pack upsert failed (packs may already exist):', error.message)
    return
  }

  if (data) {
    for (const pack of data) {
      console.log(`   ✓ ${pack.name} (${pack.price_coins} coins) [${pack.id}]`)
    }
  }
  console.log('✅  Packs seeded.')
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
seedCards().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
