export type PlayerRole = 'batter' | 'bowler' | 'allrounder' | 'keeper'
export type CricketFormat = 'test' | 'odi' | 't20i'

export type PlayerRow = {
  id: string
  name: string
  country: string
  role: PlayerRole
  photo_url: string | null
  is_active: boolean
  external_id: string
  synced_at: string | null
  created_at: string
  updated_at: string
}

export type PlayerStatsRow = {
  id: string
  player_id: string
  format: CricketFormat
  bat_matches: number | null
  bat_runs: number | null
  bat_not_outs: number | null
  bat_highest: number | null
  bat_average: number | null
  bat_100s: number | null
  bat_50s: number | null
  bat_fours: number | null
  bat_sixes: number | null
  bowl_matches: number | null
  bowl_wickets: number | null
  bowl_average: number | null
  bowl_economy: number | null
  bowl_best: string | null
  bowl_4w: number | null
  bowl_5w: number | null
  field_catches: number | null
  field_stumpings: number | null
  field_runouts: number | null
  synced_at: string | null
  created_at: string
  updated_at: string
}

export type PlayerInsert = Omit<PlayerRow, 'id' | 'created_at' | 'updated_at'>
export type PlayerUpdate = Partial<PlayerInsert>
export type PlayerStatsInsert = Omit<PlayerStatsRow, 'id' | 'created_at' | 'updated_at'>
export type PlayerStatsUpdate = Partial<PlayerStatsInsert>

export interface Database {
  public: {
    Tables: {
      players: {
        Row: PlayerRow
        Insert: PlayerInsert
        Update: PlayerUpdate
        Relationships: []
      }
      player_stats: {
        Row: PlayerStatsRow
        Insert: PlayerStatsInsert
        Update: PlayerStatsUpdate
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      player_role: PlayerRole
      cricket_format: CricketFormat
    }
  }
}
