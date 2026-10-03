-- Fromage & Figue: update 7. The blog.
-- Paste into Supabase > SQL Editor > New query, then press Run. Safe to run more than once.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  excerpt text not null default '',            -- short summary shown on the blog page
  featured_image text not null default '',     -- full image URL
  featured_alt text not null default '',
  category text not null default '',
  author text not null default 'Benoit Severin-Delos',
  content text not null default '',            -- the article, as HTML
  editor_mode text not null default 'visual' check (editor_mode in ('visual', 'html')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,                    -- shown from this moment (can be in the future to schedule)
  seo_title text not null default '',
  seo_description text not null default '',
  read_minutes int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists posts_slug_key on public.posts (lower(slug));
create index if not exists posts_published_idx on public.posts (status, published_at desc);

alter table public.posts enable row level security;
grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.posts to service_role;

drop policy if exists "read published posts" on public.posts;
create policy "read published posts" on public.posts for select to anon, authenticated
  using ((status = 'published' and published_at <= now()) or public.is_admin());
drop policy if exists "admin posts" on public.posts;
create policy "admin posts" on public.posts for all to authenticated using (public.is_admin()) with check (public.is_admin());
