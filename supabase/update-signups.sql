-- Fromage & Figue: update 4. Stores the opening-news email sign-ups from the website footer.
-- Paste into Supabase > SQL Editor > New query, then press Run. Safe to run more than once.
create table if not exists public.signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  source text not null default 'footer'
);
create unique index if not exists signups_email_key on public.signups (lower(email));
alter table public.signups enable row level security;
grant insert on public.signups to anon;
grant select, insert, update, delete on public.signups to authenticated;

drop policy if exists "join list" on public.signups;
create policy "join list" on public.signups for insert to anon, authenticated
  with check (char_length(email) between 5 and 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
drop policy if exists "admin signups" on public.signups;
create policy "admin signups" on public.signups for all to authenticated using (public.is_admin()) with check (public.is_admin());
