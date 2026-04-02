-- Seed: Classic 1990s Cricket Legends
-- 20 players covering all rarities and roles

insert into public.cards (name, era, nationality, role, rarity, stats, special_ability, flavour_text) values

-- ============================================================
-- LEGENDARY (4 cards)
-- ============================================================
(
  'Sachin Tendulkar',
  '1990s',
  'India',
  'batsman',
  'legendary',
  '{
    "batting_avg": 58.45,
    "bowling_avg": 44.49,
    "strike_rate": 86.23,
    "economy": 6.02,
    "catches": 115,
    "test_caps": 200,
    "odi_caps": 463
  }',
  'Desert Storm',
  'Sharjah, 1998. The sandstorm could not stop him. Nobody could.'
),

(
  'Brian Lara',
  '1990s',
  'West Indies',
  'batsman',
  'legendary',
  '{
    "batting_avg": 52.88,
    "bowling_avg": null,
    "strike_rate": 80.14,
    "economy": null,
    "catches": 164,
    "test_caps": 131,
    "odi_caps": 299
  }',
  '400* King',
  'The highest Test score in history. 400 not out. A number that belongs to one man alone.'
),

(
  'Shane Warne',
  '1990s',
  'Australia',
  'bowler',
  'legendary',
  '{
    "batting_avg": 17.32,
    "bowling_avg": 25.41,
    "strike_rate": null,
    "economy": 4.26,
    "catches": 125,
    "test_caps": 145,
    "odi_caps": 194
  }',
  'Ball of the Century',
  'Mike Gatting never saw it coming. Neither did the rest of the world.'
),

(
  'Wasim Akram',
  '1990s',
  'Pakistan',
  'bowler',
  'legendary',
  '{
    "batting_avg": 22.64,
    "bowling_avg": 23.62,
    "strike_rate": null,
    "economy": 3.89,
    "catches": 88,
    "test_caps": 104,
    "odi_caps": 356
  }',
  'Sultan of Swing',
  'Left-arm over the wicket, and the ball did whatever Wasim wanted it to do.'
),

-- ============================================================
-- RARE (9 cards)
-- ============================================================
(
  'Anil Kumble',
  '1990s',
  'India',
  'bowler',
  'rare',
  '{
    "batting_avg": 17.77,
    "bowling_avg": 29.65,
    "strike_rate": null,
    "economy": 3.47,
    "catches": 71,
    "test_caps": 132,
    "odi_caps": 271
  }',
  '10 Wicket Over',
  'Delhi, 1999. Ten wickets in an innings against Pakistan. Perfection.'
),

(
  'Sourav Ganguly',
  '1990s',
  'India',
  'batsman',
  'rare',
  '{
    "batting_avg": 42.17,
    "bowling_avg": 38.49,
    "strike_rate": 73.71,
    "economy": 5.03,
    "catches": 100,
    "test_caps": 113,
    "odi_caps": 311
  }',
  'God of the Off Side',
  'The shirt twirl at Lord''s. A moment India will never forget.'
),

(
  'Rahul Dravid',
  '1990s',
  'India',
  'batsman',
  'rare',
  '{
    "batting_avg": 52.31,
    "bowling_avg": 39.11,
    "strike_rate": 71.22,
    "economy": null,
    "catches": 210,
    "test_caps": 164,
    "odi_caps": 344
  }',
  'The Wall',
  'He did not play shots — he constructed innings. Brick by patient brick.'
),

(
  'Jacques Kallis',
  '1990s',
  'South Africa',
  'allrounder',
  'rare',
  '{
    "batting_avg": 55.37,
    "bowling_avg": 32.65,
    "strike_rate": 72.89,
    "economy": 4.54,
    "catches": 200,
    "test_caps": 166,
    "odi_caps": 328
  }',
  'Iron Allrounder',
  'Perhaps the greatest allrounder the game has ever seen. Both departments, world class.'
),

(
  'Steve Waugh',
  '1990s',
  'Australia',
  'batsman',
  'rare',
  '{
    "batting_avg": 51.06,
    "bowling_avg": 34.56,
    "strike_rate": 72.44,
    "economy": 4.87,
    "catches": 112,
    "test_caps": 168,
    "odi_caps": 325
  }',
  'Iceman',
  'Under pressure, he became colder. Clutch was not a word — it was his identity.'
),

(
  'Curtly Ambrose',
  '1990s',
  'West Indies',
  'bowler',
  'rare',
  '{
    "batting_avg": 12.40,
    "bowling_avg": 20.99,
    "strike_rate": null,
    "economy": 2.93,
    "catches": 53,
    "test_caps": 98,
    "odi_caps": 176
  }',
  'Silent Assassin',
  'He said nothing. He just bowled, and wickets fell.'
),

(
  'Glenn McGrath',
  '1990s',
  'Australia',
  'bowler',
  'rare',
  '{
    "batting_avg": 7.36,
    "bowling_avg": 21.64,
    "strike_rate": null,
    "economy": 3.19,
    "catches": 71,
    "test_caps": 124,
    "odi_caps": 250
  }',
  'Line and Length',
  'Metronome accurate. Off stump, every ball. You knew it was coming. Still couldn''t stop it.'
),

(
  'Muttiah Muralitharan',
  '1990s',
  'Sri Lanka',
  'bowler',
  'rare',
  '{
    "batting_avg": 11.67,
    "bowling_avg": 22.72,
    "strike_rate": null,
    "economy": 3.25,
    "catches": 72,
    "test_caps": 133,
    "odi_caps": 350
  }',
  'Doosra Master',
  '800 Test wickets. The wrist, the spin, the smile. Pure magic from Kandy.'
),

(
  'Waqar Younis',
  '1990s',
  'Pakistan',
  'bowler',
  'rare',
  '{
    "batting_avg": 10.55,
    "bowling_avg": 23.56,
    "strike_rate": null,
    "economy": 4.47,
    "catches": 57,
    "test_caps": 87,
    "odi_caps": 262
  }',
  'Toe Crusher',
  'Reverse swing at 90 mph aimed at the base of off stump. Terror in cleats.'
),

-- ============================================================
-- UNCOMMON (5 cards)
-- ============================================================
(
  'Inzamam-ul-Haq',
  '1990s',
  'Pakistan',
  'batsman',
  'uncommon',
  '{
    "batting_avg": 49.60,
    "bowling_avg": null,
    "strike_rate": 74.24,
    "economy": null,
    "catches": 100,
    "test_caps": 120,
    "odi_caps": 378
  }',
  'Lahore Express',
  'Slow to the crease, but impossible to dismiss once set. A fortress with a bat.'
),

(
  'Jonty Rhodes',
  '1990s',
  'South Africa',
  'batsman',
  'uncommon',
  '{
    "batting_avg": 35.66,
    "bowling_avg": null,
    "strike_rate": 82.12,
    "economy": null,
    "catches": 105,
    "test_caps": 52,
    "odi_caps": 245
  }',
  'Human Highlight Reel',
  'The 1992 World Cup run out. The dive. Cricket''s greatest fielding moment, bar none.'
),

(
  'Mark Taylor',
  '1990s',
  'Australia',
  'batsman',
  'uncommon',
  '{
    "batting_avg": 43.49,
    "bowling_avg": null,
    "strike_rate": 51.83,
    "economy": null,
    "catches": 157,
    "test_caps": 104,
    "odi_caps": 113
  }',
  'Ashes Captain',
  'Led Australia to dominance. His batting built empires, his captaincy cemented them.'
),

(
  'Saeed Anwar',
  '1990s',
  'Pakistan',
  'batsman',
  'uncommon',
  '{
    "batting_avg": 39.21,
    "bowling_avg": null,
    "strike_rate": 80.41,
    "economy": null,
    "catches": 71,
    "test_caps": 55,
    "odi_caps": 247
  }',
  'Chennai Storm',
  '194 against India in Chennai, 1997. The most beautiful innings you never saw live.'
),

(
  'Michael Bevan',
  '1990s',
  'Australia',
  'batsman',
  'uncommon',
  '{
    "batting_avg": 53.58,
    "bowling_avg": 29.46,
    "strike_rate": 74.17,
    "economy": 4.74,
    "catches": 67,
    "test_caps": 18,
    "odi_caps": 232
  }',
  'Finisher Supreme',
  'The best finisher in limited-overs cricket. Australia needed 30 off 15? Solved.'
),

-- ============================================================
-- COMMON (2 cards)
-- ============================================================
(
  'Vinod Kambli',
  '1990s',
  'India',
  'batsman',
  'common',
  '{
    "batting_avg": 54.20,
    "bowling_avg": null,
    "strike_rate": 63.73,
    "economy": null,
    "catches": 14,
    "test_caps": 17,
    "odi_caps": 104
  }',
  'Wankhede Prodigy',
  'Debuted alongside Tendulkar at school. Briefly, they were equals. What if...'
),

(
  'Nayan Mongia',
  '1990s',
  'India',
  'wicketkeeper',
  'common',
  '{
    "batting_avg": 20.79,
    "bowling_avg": null,
    "strike_rate": 60.11,
    "economy": null,
    "catches": 107,
    "test_caps": 44,
    "odi_caps": 140
  }',
  'Glove Work',
  'Behind the stumps, quick as a cat. The unsung guardian of India''s 90s middle order.'
);

-- Seed starter packs
insert into public.packs (name, description, price_coins, card_count, rarity_weights) values
(
  'Classic 90s Pack',
  'Legends of the golden era. Contains 5 cards with a chance of legendary.',
  100,
  5,
  '{"common":60,"uncommon":25,"rare":12,"legendary":3}'
),
(
  'Bowlers'' Special',
  'Pace and spin legends. Higher chance of rare bowlers.',
  150,
  5,
  '{"common":40,"uncommon":30,"rare":22,"legendary":8}'
),
(
  'Subcontinent Stars',
  'The best from India, Pakistan, and Sri Lanka.',
  120,
  5,
  '{"common":50,"uncommon":30,"rare":17,"legendary":3}'
),
(
  'Premium Legends',
  'Guaranteed rare or above. For serious collectors.',
  300,
  3,
  '{"common":0,"uncommon":0,"rare":70,"legendary":30}'
);
