-- Session 14: weekly auto-scan, email prefs, public share links
-- Run in Supabase SQL editor (once per project).

alter table public.profiles
  add column if not exists weekly_scan_config jsonb,
  add column if not exists email_notifications boolean not null default true,
  add column if not exists last_auto_scan_at timestamptz;

alter table public.scans
  add column if not exists share_token text;

create unique index if not exists scans_share_token_unique
  on public.scans (share_token)
  where share_token is not null;
