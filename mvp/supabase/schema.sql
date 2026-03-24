-- visora/mvp/supabase/schema.sql
-- Run in Supabase SQL editor to set up the database

create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  plan         text not null default 'starter',
  websites     text[] default '{}',
  scan_credits int  not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Scans
create table if not exists public.scans (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references public.profiles(id) on delete set null,
  target_brand     text not null,
  website_url      text,
  category         text not null,
  competitors      text[] default '{}',
  status           text not null default 'running',
  visibility_score int,
  report_json      jsonb,
  error_message    text,
  question_count   int default 10,
  created_at       timestamptz not null default now(),
  completed_at     timestamptz
);

-- Waitlist
create table if not exists public.waitlist (
  id           uuid primary key default uuid_generate_v4(),
  email        text unique not null,
  source       text default 'landing',
  signed_up_at timestamptz not null default now()
);

-- Indexes
create index if not exists scans_user_id_idx on public.scans(user_id);
create index if not exists scans_status_idx  on public.scans(status);
create index if not exists scans_created_idx on public.scans(created_at desc);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.scans     enable row level security;
alter table public.waitlist  enable row level security;

create policy "Users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users read own scans"     on public.scans for select using (auth.uid() = user_id);
create policy "Users insert own scans"   on public.scans for insert with check (auth.uid() = user_id);
create policy "Service full scans"       on public.scans for all using (auth.role() = 'service_role');
create policy "Service full waitlist"    on public.waitlist for all using (auth.role() = 'service_role');

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
