-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles (extends auth.users)
create table public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  coins integer not null default 500,
  xp integer not null default 0,
  level integer not null default 1,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Cards master table
create table public.cards (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  era text not null default '1990s',
  nationality text not null,
  role text not null check (role in ('batsman','bowler','allrounder','wicketkeeper')),
  rarity text not null check (rarity in ('common','uncommon','rare','legendary')),
  stats jsonb not null default '{}',
  special_ability text,
  flavour_text text,
  image_url text,
  created_at timestamptz not null default now()
);

-- User card inventory
create table public.user_cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id uuid references public.cards(id) on delete cascade not null,
  acquired_at timestamptz not null default now(),
  is_for_trade boolean not null default false,
  is_foil boolean not null default false
);

-- Pack definitions
create table public.packs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price_coins integer not null default 100,
  card_count integer not null default 5,
  rarity_weights jsonb not null default '{"common":60,"uncommon":25,"rare":12,"legendary":3}',
  image_url text,
  is_active boolean not null default true
);

-- Trades
create table public.trades (
  id uuid primary key default uuid_generate_v4(),
  initiator_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  offered_card_ids uuid[] not null,
  requested_card_ids uuid[] not null,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  message text,
  created_at timestamptz not null default now()
);

-- Battles
create table public.battles (
  id uuid primary key default uuid_generate_v4(),
  player1_id uuid references auth.users(id) on delete cascade not null,
  player2_id uuid references auth.users(id) on delete cascade not null,
  player1_card_id uuid references public.cards(id) not null,
  player2_card_id uuid references public.cards(id) not null,
  winner_id uuid references auth.users(id),
  battle_log jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- RLS Policies
alter table public.user_profiles enable row level security;
alter table public.user_cards enable row level security;
alter table public.trades enable row level security;
alter table public.battles enable row level security;

-- Profiles: users can read all, write own
create policy "profiles_select" on public.user_profiles for select using (true);
create policy "profiles_insert" on public.user_profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.user_profiles for update using (auth.uid() = id);

-- User cards: users can read all (for trading), write own
create policy "user_cards_select" on public.user_cards for select using (true);
create policy "user_cards_insert" on public.user_cards for insert with check (auth.uid() = user_id);
create policy "user_cards_update" on public.user_cards for update using (auth.uid() = user_id);
create policy "user_cards_delete" on public.user_cards for delete using (auth.uid() = user_id);

-- Cards: public read
alter table public.cards enable row level security;
create policy "cards_select" on public.cards for select using (true);

-- Packs: public read
alter table public.packs enable row level security;
create policy "packs_select" on public.packs for select using (true);

-- Trades: participants can see their trades
create policy "trades_select" on public.trades for select using (
  auth.uid() = initiator_id or auth.uid() = receiver_id
);
create policy "trades_insert" on public.trades for insert with check (auth.uid() = initiator_id);
create policy "trades_update" on public.trades for update using (
  auth.uid() = initiator_id or auth.uid() = receiver_id
);

-- Battles: participants can see their battles
create policy "battles_select" on public.battles for select using (
  auth.uid() = player1_id or auth.uid() = player2_id
);
create policy "battles_insert" on public.battles for insert with check (
  auth.uid() = player1_id
);

-- Auto-create profile on signup
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
