alter table players      enable row level security;
alter table player_stats enable row level security;

create policy "Anyone can read players"
  on players for select using (true);

create policy "Anyone can read player stats"
  on player_stats for select using (true);
