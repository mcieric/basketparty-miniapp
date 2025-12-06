-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- USERS TABLE
create table public.users (
  address text primary key, -- Wallet address (lowercase)
  last_free_game_at timestamptz, -- Check for daily quota
  created_at timestamptz default now()
);

-- GAME SESSIONS / SCORES
create table public.game_scores (
  id uuid primary key default gen_random_uuid(),
  user_address text references public.users(address) not null,
  score int not null,
  played_at timestamptz default now(),
  is_paid boolean default false, -- true if paid with USDC, false if free daily
  transaction_hash text, -- if paid
  metadata jsonb -- store checks like 'max_basket_speed' etc for anti-cheat analysis
);

-- LEADERBOARD VIEW
create view public.leaderboard as
select 
  user_address,
  max(score) as high_score,
  count(*) as total_games
from public.game_scores
group by user_address
order by high_score desc;

-- RLS POLICIES (Simple for now)
alter table public.users enable row level security;
alter table public.game_scores enable row level security;

create policy "Public read access" on public.users for select using (true);
create policy "Service role write access" on public.users for all using (true); -- Backend writes

create policy "Public read access" on public.game_scores for select using (true);
create policy "Service role write access" on public.game_scores for all using (true);
