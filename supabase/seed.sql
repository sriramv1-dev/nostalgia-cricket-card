-- ============================================================
-- seed.sql
-- Classic 1990s Cricket Legends — 20 cards + ODI stats + packs.
-- Cards table no longer stores stats (see player_stats table).
-- ============================================================

-- ── Cards ────────────────────────────────────────────────────
insert into public.cards (id, name, era, nationality, role, rarity, special_ability, flavour_text) values

-- LEGENDARY (4)
('00000000-0000-0000-0000-000000000001', 'Sachin Tendulkar',   '1990s', 'India',       'batter', 'legendary', 'Desert Storm',        'Sharjah, 1998. The sandstorm could not stop him. Nobody could.'),
('00000000-0000-0000-0000-000000000002', 'Brian Lara',         '1990s', 'West Indies', 'batter', 'legendary', '400* King',            'The highest Test score in history. 400 not out. A number that belongs to one man alone.'),
('00000000-0000-0000-0000-000000000003', 'Shane Warne',        '1990s', 'Australia',   'bowler',  'legendary', 'Ball of the Century',  'Mike Gatting never saw it coming. Neither did the rest of the world.'),
('00000000-0000-0000-0000-000000000004', 'Wasim Akram',        '1990s', 'Pakistan',    'bowler',  'legendary', 'Sultan of Swing',      'Left-arm over the wicket, and the ball did whatever Wasim wanted it to do.'),

-- RARE (9)
('00000000-0000-0000-0000-000000000005', 'Anil Kumble',        '1990s', 'India',        'bowler',     'rare', '10 Wicket Over',     'Delhi, 1999. Ten wickets in an innings against Pakistan. Perfection.'),
('00000000-0000-0000-0000-000000000006', 'Sourav Ganguly',     '1990s', 'India',        'batter',    'rare', 'God of the Off Side','The shirt twirl at Lord''s. A moment India will never forget.'),
('00000000-0000-0000-0000-000000000007', 'Rahul Dravid',       '1990s', 'India',        'batter',    'rare', 'The Wall',           'He did not play shots — he constructed innings. Brick by patient brick.'),
('00000000-0000-0000-0000-000000000008', 'Jacques Kallis',     '1990s', 'South Africa', 'allrounder', 'rare', 'Iron Allrounder',    'Perhaps the greatest allrounder the game has ever seen. Both departments, world class.'),
('00000000-0000-0000-0000-000000000009', 'Steve Waugh',        '1990s', 'Australia',    'batter',    'rare', 'Iceman',             'Under pressure, he became colder. Clutch was not a word — it was his identity.'),
('00000000-0000-0000-0000-000000000010', 'Curtly Ambrose',     '1990s', 'West Indies',  'bowler',     'rare', 'Silent Assassin',    'He said nothing. He just bowled, and wickets fell.'),
('00000000-0000-0000-0000-000000000011', 'Glenn McGrath',      '1990s', 'Australia',    'bowler',     'rare', 'Line and Length',    'Metronome accurate. Off stump, every ball. You knew it was coming. Still couldn''t stop it.'),
('00000000-0000-0000-0000-000000000012', 'Muttiah Muralitharan','1990s','Sri Lanka',    'bowler',     'rare', 'Doosra Master',      '800 Test wickets. The wrist, the spin, the smile. Pure magic from Kandy.'),
('00000000-0000-0000-0000-000000000013', 'Waqar Younis',       '1990s', 'Pakistan',     'bowler',     'rare', 'Toe Crusher',        'Reverse swing at 90 mph aimed at the base of off stump. Terror in cleats.'),

-- UNCOMMON (5)
('00000000-0000-0000-0000-000000000014', 'Inzamam-ul-Haq', '1990s', 'Pakistan',      'batter', 'uncommon', 'Lahore Express',         'Slow to the crease, but impossible to dismiss once set. A fortress with a bat.'),
('00000000-0000-0000-0000-000000000015', 'Jonty Rhodes',    '1990s', 'South Africa',  'batter', 'uncommon', 'Human Highlight Reel',   'The 1992 World Cup run out. The dive. Cricket''s greatest fielding moment, bar none.'),
('00000000-0000-0000-0000-000000000016', 'Mark Taylor',     '1990s', 'Australia',     'batter', 'uncommon', 'Ashes Captain',          'Led Australia to dominance. His batting built empires, his captaincy cemented them.'),
('00000000-0000-0000-0000-000000000017', 'Saeed Anwar',     '1990s', 'Pakistan',      'batter', 'uncommon', 'Chennai Storm',          '194 against India in Chennai, 1997. The most beautiful innings you never saw live.'),
('00000000-0000-0000-0000-000000000018', 'Michael Bevan',   '1990s', 'Australia',     'batter', 'uncommon', 'Finisher Supreme',       'The best finisher in limited-overs cricket. Australia needed 30 off 15? Solved.'),

-- COMMON (2)
('00000000-0000-0000-0000-000000000019', 'Vinod Kambli', '1990s', 'India', 'batter',     'common', 'Wankhede Prodigy', 'Debuted alongside Tendulkar at school. Briefly, they were equals. What if...'),
('00000000-0000-0000-0000-000000000020', 'Nayan Mongia',  '1990s', 'India', 'keeper','common', 'Glove Work',       'Behind the stumps, quick as a cat. The unsung guardian of India''s 90s middle order.');

-- ── Player stats (ODI) ───────────────────────────────────────
insert into public.player_stats (card_id, format, caps, batting_avg, strike_rate, centuries, half_centuries, wickets, bowling_avg, economy_rate, catches) values

-- LEGENDARY
('00000000-0000-0000-0000-000000000001', 'odi', 463, 44.83, 86.23,  49, 96,  154, 44.49, 6.02,  140),
('00000000-0000-0000-0000-000000000002', 'odi', 299, 40.48, 80.14,  19, 63,    4, null,  null,   96),
('00000000-0000-0000-0000-000000000003', 'odi', 194, 17.55, null,    0,  4,  293, 25.73, 4.26,  80),
('00000000-0000-0000-0000-000000000004', 'odi', 356, 16.52, 70.29,   0,  3,  502, 23.52, 3.89,  88),

-- RARE
('00000000-0000-0000-0000-000000000005', 'odi', 271, 23.08, 72.34,   2, 10,  337, 30.89, 3.47,  71),
('00000000-0000-0000-0000-000000000006', 'odi', 311, 41.02, 73.71,  22, 72,  100, 38.49, 5.03, 100),
('00000000-0000-0000-0000-000000000007', 'odi', 344, 39.16, 71.22,  12, 83,    4, 39.11, null,  196),
('00000000-0000-0000-0000-000000000008', 'odi', 328, 44.36, 72.89,  17, 86,  273, 31.79, 4.54,  131),
('00000000-0000-0000-0000-000000000009', 'odi', 325, 32.90, 72.44,   3, 45,  195, 34.56, 4.87,  111),
('00000000-0000-0000-0000-000000000010', 'odi', 176,  8.70, null,    0,  0,  225, 24.13, 2.93,   33),
('00000000-0000-0000-0000-000000000011', 'odi', 250,  2.65, null,    0,  0,  381, 22.02, 3.19,   53),
('00000000-0000-0000-0000-000000000012', 'odi', 350, 10.28, null,    0,  0,  534, 23.08, 3.93,   46),
('00000000-0000-0000-0000-000000000013', 'odi', 262,  7.97, 70.64,   0,  0,  416, 23.84, 4.47,   55),

-- UNCOMMON
('00000000-0000-0000-0000-000000000014', 'odi', 378, 39.52, 74.24,  10, 83,    0, null,  null,  100),
('00000000-0000-0000-0000-000000000015', 'odi', 245, 35.66, 82.12,   2, 33,    0, null,  null,  105),
('00000000-0000-0000-0000-000000000016', 'odi', 113, 32.90, 51.83,   2, 25,    0, null,  null,   57),
('00000000-0000-0000-0000-000000000017', 'odi', 247, 39.21, 80.41,  20, 55,    0, null,  null,   71),
('00000000-0000-0000-0000-000000000018', 'odi', 232, 53.58, 74.17,   0, 46,   36, 29.46, 4.74,   67),

-- COMMON
('00000000-0000-0000-0000-000000000019', 'odi', 104, 43.57, 63.73,   2, 14,    0, null,  null,   14),
('00000000-0000-0000-0000-000000000020', 'odi', 140, 20.79, 60.11,   0,  4,    0, null,  null,  107);

-- ── Starter packs ────────────────────────────────────────────
insert into public.packs (name, description, price_coins, card_count, rarity_weights) values
('Classic 90s Pack',    'Legends of the golden era. Contains 5 cards with a chance of legendary.',   100, 5, '{"common":60,"uncommon":25,"rare":12,"legendary":3}'),
('Bowlers'' Special',   'Pace and spin legends. Higher chance of rare bowlers.',                      150, 5, '{"common":40,"uncommon":30,"rare":22,"legendary":8}'),
('Subcontinent Stars',  'The best from India, Pakistan, and Sri Lanka.',                              120, 5, '{"common":50,"uncommon":30,"rare":17,"legendary":3}'),
('Premium Legends',     'Guaranteed rare or above. For serious collectors.',                          300, 3, '{"common":0,"uncommon":0,"rare":70,"legendary":30}');
