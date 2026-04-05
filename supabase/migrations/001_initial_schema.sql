-- ============================================================
-- 001_initial_schema.sql
-- Concatenation of docs/sql/01–05 for Supabase CLI migrations.
-- Edit the source files in docs/sql/ and regenerate here.
-- ============================================================

-- [01_enums] -------------------------------------------------
create extension if not exists "uuid-ossp";

create type player_role as enum (
  'batter', 'bowler', 'allrounder', 'keeper'
);
create type card_rarity as enum (
  'common', 'uncommon', 'rare', 'legendary'
);
create type trade_status as enum (
  'pending', 'accepted', 'declined', 'cancelled'
);
create type cricket_format as enum (
  'test', 'odi', 't20i'
);

-- [02_players] ------------------------------------------------
create table public.user_profiles (
  id          uuid        references auth.users(id) on delete cascade primary key,
  username    text        unique not null,
  coins       integer     not null default 500,
  xp          integer     not null default 0,
  level       integer     not null default 1,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create table public.cards (
  id               uuid               primary key default uuid_generate_v4(),
  name             text               not null,
  era              text               not null default '1990s',
  nationality      text               not null,
  role             player_role  not null,
  rarity           card_rarity  not null,
  special_ability  text,
  flavour_text     text,
  image_url        text,
  created_at       timestamptz        not null default now()
);

create table public.packs (
  id              uuid        primary key default uuid_generate_v4(),
  name            text        not null,
  description     text,
  price_coins     integer     not null default 100,
  card_count      integer     not null default 5,
  rarity_weights  jsonb       not null default '{"common":60,"uncommon":25,"rare":12,"legendary":3}',
  image_url       text,
  is_active       boolean     not null default true
);

create table public.user_cards (
  id           uuid        primary key default uuid_generate_v4(),
  user_id      uuid        references auth.users(id) on delete cascade not null,
  card_id      uuid        references public.cards(id) on delete cascade not null,
  acquired_at  timestamptz not null default now(),
  is_for_trade boolean     not null default false,
  is_foil      boolean     not null default false
);

create table public.trades (
  id                  uuid                primary key default uuid_generate_v4(),
  initiator_id        uuid                references auth.users(id) on delete cascade not null,
  receiver_id         uuid                references auth.users(id) on delete cascade not null,
  offered_card_ids    uuid[]              not null,
  requested_card_ids  uuid[]              not null,
  status              trade_status not null default 'pending',
  message             text,
  created_at          timestamptz         not null default now()
);

create table public.battles (
  id               uuid        primary key default uuid_generate_v4(),
  player1_id       uuid        references auth.users(id) on delete cascade not null,
  player2_id       uuid        references auth.users(id) on delete cascade not null,
  player1_card_id  uuid        references public.cards(id) not null,
  player2_card_id  uuid        references public.cards(id) not null,
  winner_id        uuid        references auth.users(id),
  battle_log       jsonb       not null default '[]',
  created_at       timestamptz not null default now()
);

-- [03_player_stats] -------------------------------------------
create table public.player_stats (
  id              uuid                  primary key default uuid_generate_v4(),
  card_id         uuid                  references public.cards(id) on delete cascade not null,
  format          cricket_format not null,
  caps            integer,
  batting_avg     numeric(6, 2),
  strike_rate     numeric(6, 2),
  centuries       integer,
  half_centuries  integer,
  wickets         integer,
  bowling_avg     numeric(6, 2),
  economy_rate    numeric(5, 2),
  five_wickets    integer,
  catches         integer,
  stumpings       integer,
  synced_at       timestamptz           not null default now(),
  unique (card_id, format)
);

create view public.card_battle_stats as
select
  c.id,
  c.name,
  c.role,
  c.rarity,
  c.special_ability,
  coalesce(ps.batting_avg,   0) as batting_avg,
  coalesce(ps.bowling_avg,   0) as bowling_avg,
  coalesce(ps.strike_rate,   0) as strike_rate,
  coalesce(ps.economy_rate,  0) as economy_rate,
  coalesce(ps.catches,       0) as catches,
  coalesce(ps.wickets,       0) as wickets
from public.cards c
left join public.player_stats ps
  on ps.card_id = c.id
 and ps.format  = 'odi';

-- [04_indexes] ------------------------------------------------
create index idx_cards_rarity        on public.cards (rarity);
create index idx_cards_role          on public.cards (role);
create index idx_cards_nationality   on public.cards (nationality);
create index idx_cards_era           on public.cards (era);

create index idx_player_stats_card_id on public.player_stats (card_id);
create index idx_player_stats_format  on public.player_stats (format);

create index idx_user_cards_user_id  on public.user_cards (user_id);
create index idx_user_cards_card_id  on public.user_cards (card_id);
create index idx_user_cards_for_trade
  on public.user_cards (user_id)
  where is_for_trade = true;

create index idx_trades_initiator    on public.trades (initiator_id);
create index idx_trades_receiver     on public.trades (receiver_id);
create index idx_trades_status       on public.trades (status);
create index idx_trades_user_status
  on public.trades (receiver_id, status, created_at desc);

create index idx_battles_player1      on public.battles (player1_id);
create index idx_battles_player2      on public.battles (player2_id);
create index idx_battles_created_at   on public.battles (created_at desc);
create index idx_battles_player1_date on public.battles (player1_id, created_at desc);
create index idx_battles_player2_date on public.battles (player2_id, created_at desc);

-- [05_rls] ----------------------------------------------------
alter table public.user_profiles  enable row level security;
alter table public.cards           enable row level security;
alter table public.packs           enable row level security;
alter table public.user_cards      enable row level security;
alter table public.trades          enable row level security;
alter table public.battles         enable row level security;
alter table public.player_stats    enable row level security;

create policy "profiles_select"   on public.user_profiles for select using (true);
create policy "profiles_insert"   on public.user_profiles for insert with check (auth.uid() = id);
create policy "profiles_update"   on public.user_profiles for update using (auth.uid() = id);

create policy "cards_select"        on public.cards        for select using (true);
create policy "player_stats_select" on public.player_stats for select using (true);
create policy "packs_select"        on public.packs        for select using (true);

create policy "user_cards_select" on public.user_cards for select using (true);
create policy "user_cards_insert" on public.user_cards for insert with check (auth.uid() = user_id);
create policy "user_cards_update" on public.user_cards for update using (auth.uid() = user_id);
create policy "user_cards_delete" on public.user_cards for delete using (auth.uid() = user_id);

create policy "trades_select" on public.trades for select
  using (auth.uid() = initiator_id or auth.uid() = receiver_id);
create policy "trades_insert" on public.trades for insert
  with check (auth.uid() = initiator_id);
create policy "trades_update" on public.trades for update
  using (auth.uid() = initiator_id or auth.uid() = receiver_id);

create policy "battles_select" on public.battles for select
  using (auth.uid() = player1_id or auth.uid() = player2_id);
create policy "battles_insert" on public.battles for insert
  with check (auth.uid() = player1_id);
create policy "battles_update" on public.battles for update
  using (auth.uid() = player1_id or auth.uid() = player2_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
