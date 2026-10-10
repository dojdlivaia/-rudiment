-- ============================================================================
-- «Рудимент» — схема Supabase (PostgreSQL + RLS)
-- Запустить в SQL Editor проекта. Модель: users → attempts → answers, profiles.
-- ============================================================================

create extension if not exists "pgcrypto";

-- Профили пользователей (1:1 с auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Двуногий без перьев',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Одна попытка прохождения сценария
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_slug text not null,
  bias text not null check (bias in ('anchoring','sunk-cost','confirmation-bias','base-rate','monty-hall','hindsight')),
  susceptibility numeric(4,3) not null check (susceptibility between 0 and 1), -- подверженность: 0..1
  mean_brier numeric(5,4) not null check (mean_brier between 0 and 1),
  overconfidence numeric(5,4) not null, -- уверенность минус точность
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists attempts_user_idx on public.attempts (user_id, finished_at desc);
create index if not exists attempts_slug_idx on public.attempts (scenario_slug);

-- Ответы внутри попытки: выбор/оценка + слайдер уверенности + время реакции
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  value text not null,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  correct boolean not null,
  brier numeric(5,4) not null check (brier between 0 and 1),
  response_ms integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists answers_attempt_idx on public.answers (attempt_id);
create index if not exists answers_user_idx on public.answers (user_id, created_at);

-- Материализованный профиль: радар подверженностей по каждому искажению
create table if not exists public.bias_scores (
  user_id uuid not null references auth.users(id) on delete cascade,
  bias text not null check (bias in ('anchoring','sunk-cost','confirmation-bias','base-rate','monty-hall','hindsight')),
  susceptibility numeric(4,3) not null check (susceptibility between 0 and 1),
  attempts_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, bias)
);

-- ----------------------------------------------------------------------------
-- Row Level Security: каждый видит и пишет только свои данные.
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.attempts enable row level security;
alter table public.answers enable row level security;
alter table public.bias_scores enable row level security;

create policy "profiles: own read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);

create policy "attempts: own rw" on public.attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "answers: own rw" on public.answers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bias_scores: own rw" on public.bias_scores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Триггер: при создании пользователя — строка профиля
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Двуногий без перьев'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
