export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'
export type PlayerRole = 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper'
export type TradeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

export interface CardStats {
  batting_avg: number | null
  bowling_avg: number | null
  strike_rate: number | null
  economy: number | null
  catches: number | null
  test_caps: number | null
  odi_caps: number | null
}

export interface Card {
  id: string
  name: string
  era: string              // e.g. "1990s"
  nationality: string
  role: PlayerRole
  rarity: Rarity
  stats: CardStats
  special_ability: string | null
  flavour_text: string | null
  image_url: string | null
  created_at: string
}

export interface UserCard {
  id: string
  user_id: string
  card_id: string
  acquired_at: string
  is_for_trade: boolean
  is_foil: boolean
  card: Card
}

export interface UserProfile {
  id: string
  username: string
  coins: number
  xp: number
  level: number
  avatar_url: string | null
  created_at: string
}

export interface Pack {
  id: string
  name: string
  description: string
  price_coins: number
  card_count: number
  rarity_weights: Record<Rarity, number>
  image_url: string | null
}

export interface Trade {
  id: string
  initiator_id: string
  receiver_id: string
  offered_card_ids: string[]
  requested_card_ids: string[]
  status: TradeStatus
  message: string | null
  created_at: string
  initiator?: UserProfile
  receiver?: UserProfile
}

export interface Battle {
  id: string
  player1_id: string
  player2_id: string
  player1_card_id: string
  player2_card_id: string
  winner_id: string | null
  battle_log: BattleRound[]
  created_at: string
}

export interface BattleRound {
  round: number
  player1_roll: number
  player2_roll: number
  commentary: string
}
