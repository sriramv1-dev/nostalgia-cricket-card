-- Seed: India Players
-- Run in Supabase Dashboard → SQL Editor
-- Safe to re-run: ON CONFLICT DO NOTHING

-- ============================================================
-- 1. Sachin Tendulkar
-- ============================================================
WITH player AS (
  INSERT INTO players (id, name, country, role, is_active, external_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Sachin Tendulkar', 'India', 'batter', false, '35320', now(), now())
  ON CONFLICT (external_id) DO NOTHING
  RETURNING id
)
INSERT INTO player_stats (id, player_id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, created_at, updated_at)
SELECT gen_random_uuid(), player.id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, now(), now()
FROM player
CROSS JOIN (VALUES
  ('test'::cricket_format, 200, 15921, 33, 248, 53.78, 51, 68, NULL,  69,  200, 46,  54.17, 3.52, '3/10', 0, 0, 115, 0, NULL),
  ('odi'::cricket_format,  463, 18426, 41, 200, 44.83, 49, 96, 2016, 195,  463, 154, 44.48, 5.10, '5/32', 4, 2, 140, 0, NULL),
  ('t20i'::cricket_format,   1,    10,  0,  10, 10.00,  0,  0,    2,   0,    1,   1, 12.00, 4.80, '1/12', 0, 0,   1, 0, NULL)
) AS s(format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts)
WHERE player.id IS NOT NULL;

-- ============================================================
-- 2. Rahul Dravid
-- ============================================================
WITH player AS (
  INSERT INTO players (id, name, country, role, is_active, external_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Rahul Dravid', 'India', 'batter', false, '28114', now(), now())
  ON CONFLICT (external_id) DO NOTHING
  RETURNING id
)
INSERT INTO player_stats (id, player_id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, created_at, updated_at)
SELECT gen_random_uuid(), player.id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, now(), now()
FROM player
CROSS JOIN (VALUES
  ('test'::cricket_format, 164, 13288, 32, 270, 52.31, 36, 63, 1654,  21, 164,  1, 39.00, 1.95, '1/18', 0, 0, 210,  0, NULL),
  ('odi'::cricket_format,  344, 10889, 40, 153, 39.16, 12, 83,  950,  42, 344,  4, 42.50, 5.48, '2/43', 0, 0, 196, 14, NULL),
  ('t20i'::cricket_format,   1,    31,  0,  31, 31.00,  0,  0,    0,   3,   1,  0,  NULL, NULL,   NULL, 0, 0,   0,  0, NULL)
) AS s(format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts)
WHERE player.id IS NOT NULL;

-- ============================================================
-- 3. Sourav Ganguly
-- ============================================================
WITH player AS (
  INSERT INTO players (id, name, country, role, is_active, external_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Sourav Ganguly', 'India', 'allrounder', false, '28779', now(), now())
  ON CONFLICT (external_id) DO NOTHING
  RETURNING id
)
INSERT INTO player_stats (id, player_id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, created_at, updated_at)
SELECT gen_random_uuid(), player.id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, now(), now()
FROM player
CROSS JOIN (VALUES
  ('test'::cricket_format, 113, 7212, 17, 239, 42.17, 16, 35,  900,  57, 113,  32, 52.53, 3.23, '3/28', 0, 0,  71, 0, NULL),
  ('odi'::cricket_format,  311, 11363, 23, 183, 41.02, 22, 72, 1122, 190, 311, 100, 38.49, 5.06, '5/16', 1, 2, 100, 0, NULL)
) AS s(format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts)
WHERE player.id IS NOT NULL;

-- ============================================================
-- 4. VVS Laxman
-- ============================================================
WITH player AS (
  INSERT INTO players (id, name, country, role, is_active, external_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'VVS Laxman', 'India', 'batter', false, '30750', now(), now())
  ON CONFLICT (external_id) DO NOTHING
  RETURNING id
)
INSERT INTO player_stats (id, player_id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, created_at, updated_at)
SELECT gen_random_uuid(), player.id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, now(), now()
FROM player
CROSS JOIN (VALUES
  ('test'::cricket_format, 134, 8781, 34, 281, 45.97, 17, 56, 1135, 5, 134, 2, 63.00, 2.33, '1/2', 0, 0, 135, 0, NULL),
  ('odi'::cricket_format,   86, 2338,  7, 131, 30.76,  6, 10,  222, 4,  86, 0,  NULL, 5.71,  NULL, 0, 0,  39, 0, NULL)
) AS s(format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts)
WHERE player.id IS NOT NULL;

-- ============================================================
-- 5. Mohammad Azharuddin
-- ============================================================
WITH player AS (
  INSERT INTO players (id, name, country, role, is_active, external_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Mohammad Azharuddin', 'India', 'batter', false, '26329', now(), now())
  ON CONFLICT (external_id) DO NOTHING
  RETURNING id
)
INSERT INTO player_stats (id, player_id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, created_at, updated_at)
SELECT gen_random_uuid(), player.id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, now(), now()
FROM player
CROSS JOIN (VALUES
  ('test'::cricket_format,  99, 6215,  9, 199, 45.03, 22, 21, NULL, 19,  99,  0,  NULL, 7.38,  NULL, 0, 0, 105, 0, NULL),
  ('odi'::cricket_format,  334, 9378, 54, 153, 36.92,  7, 58, NULL, NULL, 334, 12, 39.91, 5.20, '3/19', 0, 0, 156, 0, NULL)
) AS s(format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts)
WHERE player.id IS NOT NULL;

-- ============================================================
-- 6. Anil Kumble
-- ============================================================
WITH player AS (
  INSERT INTO players (id, name, country, role, is_active, external_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Anil Kumble', 'India', 'bowler', false, '30176', now(), now())
  ON CONFLICT (external_id) DO NOTHING
  RETURNING id
)
INSERT INTO player_stats (id, player_id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, created_at, updated_at)
SELECT gen_random_uuid(), player.id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, now(), now()
FROM player
CROSS JOIN (VALUES
  ('test'::cricket_format, 132, 2506, 32, 110, 17.77, 1, 5, 302, 9, 132, 619, 29.65, 2.69, '10/74', 31, 35, 60, 0, NULL),
  ('odi'::cricket_format,  271,  938, 47,  26, 10.53, 0, 0,  57, 6, 271, 337, 30.89, 4.30,  '6/12',  8,  2, 85, 0, NULL)
) AS s(format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts)
WHERE player.id IS NOT NULL;

-- ============================================================
-- 7. Javagal Srinath
-- ============================================================
WITH player AS (
  INSERT INTO players (id, name, country, role, is_active, external_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Javagal Srinath', 'India', 'bowler', false, '34105', now(), now())
  ON CONFLICT (external_id) DO NOTHING
  RETURNING id
)
INSERT INTO player_stats (id, player_id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, created_at, updated_at)
SELECT gen_random_uuid(), player.id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, now(), now()
FROM player
CROSS JOIN (VALUES
  ('test'::cricket_format,  67, 1009, 21, 76, 14.21, 0, 4, 110,  8,  67, 236, 30.49, 2.85, '8/86',  8, 10, 22, 0, NULL),
  ('odi'::cricket_format,  229,  883, 38, 53, 10.63, 0, 1,  62, 17, 229, 315, 28.08, 4.44, '5/23',  7,  3, 32, 0, NULL)
) AS s(format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts)
WHERE player.id IS NOT NULL;

-- ============================================================
-- 8. Venkatesh Prasad
-- ============================================================
WITH player AS (
  INSERT INTO players (id, name, country, role, is_active, external_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Venkatesh Prasad', 'India', 'bowler', false, '32345', now(), now())
  ON CONFLICT (external_id) DO NOTHING
  RETURNING id
)
INSERT INTO player_stats (id, player_id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, created_at, updated_at)
SELECT gen_random_uuid(), player.id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, now(), now()
FROM player
CROSS JOIN (VALUES
  ('test'::cricket_format,  33, 203, 20, 30, 7.51, 0, 0, 11, 0,  33,  96, 35.00, 2.86, '6/33', 1, 7,  6, 0, NULL),
  ('odi'::cricket_format,  161, 221, 31, 19, 6.90, 0, 0,  7, 5, 161, 196, 32.30, 4.67, '5/27', 3, 1, 37, 0, NULL)
) AS s(format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts)
WHERE player.id IS NOT NULL;

-- ============================================================
-- 9. Harbhajan Singh
-- ============================================================
WITH player AS (
  INSERT INTO players (id, name, country, role, is_active, external_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Harbhajan Singh', 'India', 'bowler', false, '29264', now(), now())
  ON CONFLICT (external_id) DO NOTHING
  RETURNING id
)
INSERT INTO player_stats (id, player_id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, created_at, updated_at)
SELECT gen_random_uuid(), player.id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, now(), now()
FROM player
CROSS JOIN (VALUES
  ('test'::cricket_format,  103, 2224, 23, 115, 18.22, 2, 9, 277, 42, 103, 417, 32.46, 2.84, '8/84', 16, 25, 42, 0, NULL),
  ('odi'::cricket_format,   236, 1237, 35,  49, 13.30, 0, 0,  92, 35, 236, 269, 33.35, 4.31, '5/31',  2,  3, 71, 0, NULL),
  ('t20i'::cricket_format,   28,  108,  5,  21, 13.50, 0, 0,  11,  4,  28,  25, 25.32, 6.20, '4/12',  1,  0,  7, 0, NULL)
) AS s(format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts)
WHERE player.id IS NOT NULL;

-- ============================================================
-- 10. Zaheer Khan
-- ============================================================
WITH player AS (
  INSERT INTO players (id, name, country, role, is_active, external_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Zaheer Khan', 'India', 'bowler', false, '30102', now(), now())
  ON CONFLICT (external_id) DO NOTHING
  RETURNING id
)
INSERT INTO player_stats (id, player_id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, created_at, updated_at)
SELECT gen_random_uuid(), player.id, format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts, now(), now()
FROM player
CROSS JOIN (VALUES
  ('test'::cricket_format,   92, 1231, 24, 75, 11.95, 0, 3, 141, 28,  92, 311, 32.94, 3.27, '7/87', 15, 11, 19, 0, NULL),
  ('odi'::cricket_format,   200,  792, 35, 34, 12.00, 0, 0,  69, 24, 200, 282, 29.43, 4.93, '5/42',  7,  1, 43, 0, NULL),
  ('t20i'::cricket_format,   17,   13,  2,  9,  6.50, 0, 0,   0,  1,  17,  17, 26.35, 7.63, '4/19',  1,  0,  2, 0, NULL)
) AS s(format, bat_matches, bat_runs, bat_not_outs, bat_highest, bat_average, bat_100s, bat_50s, bat_fours, bat_sixes, bowl_matches, bowl_wickets, bowl_average, bowl_economy, bowl_best, bowl_4w, bowl_5w, field_catches, field_stumpings, field_runouts)
WHERE player.id IS NOT NULL;
