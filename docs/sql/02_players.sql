create table players (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  country       text not null,
  role          player_role not null,
  photo_url     text,
  is_active     boolean not null default true,
  external_id   text unique,
  synced_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
