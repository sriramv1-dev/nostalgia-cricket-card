-- Create shots lookup table
CREATE TABLE shots (
  id           text PRIMARY KEY,
  label        text NOT NULL,
  valid_roles  text[] NOT NULL,
  folder_path  text NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Seed all current shots
INSERT INTO shots (id, label, valid_roles, folder_path) VALUES
  ('pace',     'Pace Bowling',  '{bowler}',              '/images/card/pace-masks'),
  ('spin',     'Spin Bowling',  '{bowler}',              '/images/card/spin-masks'),
  ('alpha',    'Alpha Shot',    '{batter,allrounder}',   '/images/card/alpha-shot'),
  ('loft',     'Loft Shot',     '{batter,allrounder}',   '/images/card/loft-shot'),
  ('scoop',    'Scoop Shot',    '{batter,allrounder}',   '/images/card/scoop-shot'),
  ('sweep',    'Sweep Shot',    '{batter,allrounder}',   '/images/card/sweep-shot'),
  ('uppercut', 'Uppercut Shot', '{batter,allrounder}',   '/images/card/uppercut-shot'),
  ('keeping1', 'Keeping 1',     '{keeper}',              '/images/card/keeping1'),
  ('keeping2', 'Keeping 2',     '{keeper}',              '/images/card/keeping2');

-- Add shot column to players with FK to shots
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS shot text DEFAULT NULL
  REFERENCES shots(id) ON DELETE SET NULL;

-- Index for shot lookups
CREATE INDEX IF NOT EXISTS players_shot_idx ON players (shot);

-- RLS: shots table is publicly readable, no writes from client
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shots_read_all" ON shots
  FOR SELECT USING (true);
