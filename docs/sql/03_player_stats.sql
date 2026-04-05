create table player_stats (
  id              uuid primary key default gen_random_uuid(),
  player_id       uuid not null references players(id) on delete cascade,
  format          cricket_format not null,

  bat_matches     integer,
  bat_runs        integer,
  bat_not_outs    integer,
  bat_highest     integer,
  bat_average     numeric(5,2),
  bat_100s        integer,
  bat_50s         integer,
  bat_fours       integer,
  bat_sixes       integer,

  bowl_matches    integer,
  bowl_wickets    integer,
  bowl_average    numeric(5,2),
  bowl_economy    numeric(4,2),
  bowl_best       text,
  bowl_4w         integer,
  bowl_5w         integer,

  field_catches   integer,
  field_stumpings integer,
  field_runouts   integer,

  synced_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (player_id, format)
);
