-- Fromage & Figue: database setup.
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run.
-- Safe to run more than once.

-- ---------- tables ----------
create table if not exists public.categories (
  id text primary key,                 -- short slug, for example "soft"
  name text not null,
  section text not null default 'collection' check (section in ('collection', 'gifts')),
  sort int not null default 0,
  active boolean not null default true,
  title text not null default '',      -- gifts page: section heading, *word* shows in italics
  intro text not null default ''       -- gifts page: short paragraph under the heading
);
alter table public.categories add column if not exists title text not null default '';
alter table public.categories add column if not exists intro text not null default '';

create table if not exists public.products (
  id text primary key,                 -- short slug, for example "brie"
  name text not null,
  category text not null references public.categories (id) on update cascade,
  note text not null default '',
  pair text not null default '',
  price numeric(8, 2) not null default 0,
  unit text not null default '',       -- "100g", "loaf", "board" ... shown as "£9 / 100g"
  price_from boolean not null default false,  -- shows "From £5"
  img text not null default '',        -- file name in assets/products, or a full image URL
  images text[] not null default '{}', -- extra gallery photos (file names in assets, or full URLs)
  origin text not null default '',
  milk text not null default '',
  age text not null default '',
  texture text not null default '',
  intensity int not null default 1 check (intensity between 1 and 5),
  notes text[] not null default '{}',
  story text not null default '',
  drink text not null default '',
  serve_with text not null default '',
  serve text not null default '',
  keep text not null default '',
  serves text not null default '',     -- boards and boxes: "Serves 2 to 4"
  includes text[] not null default '{}',
  flag text not null default '',       -- "Most popular"
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null,
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'preparing', 'ready', 'completed', 'cancelled')),
  customer_name text not null,
  email text not null,
  fulfilment text not null check (fulfilment in ('collection', 'delivery')),
  slot_at timestamptz,
  address text not null default '',
  items jsonb not null,
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  payment text not null default 'demo',
  internal_note text not null default '',
  customer_note text not null default '',  -- a note left by the customer at checkout
  cancel_reason text not null default '',  -- why the shop cancelled it (included in the email)
  emails_sent text[] not null default '{}' -- which emails have gone out, so none is sent twice
);
alter table public.orders add column if not exists customer_note text not null default '';
alter table public.orders add column if not exists cancel_reason text not null default '';
alter table public.orders add column if not exists emails_sent text[] not null default '{}';

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

-- ---------- who is the admin ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((auth.jwt() ->> 'email') = 'lukebrennan03@gmail.com', false)
$$;

-- ---------- access rules (row level security) ----------
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.settings   enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.settings to anon;
grant insert on public.orders to anon;
grant select, insert, update, delete on public.categories, public.products, public.orders, public.settings to authenticated;

drop policy if exists "read categories" on public.categories;
create policy "read categories" on public.categories for select to anon, authenticated using (active or public.is_admin());
drop policy if exists "admin categories" on public.categories;
create policy "admin categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read products" on public.products;
create policy "read products" on public.products for select to anon, authenticated using (active or public.is_admin());
drop policy if exists "admin products" on public.products;
create policy "admin products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read settings" on public.settings;
create policy "read settings" on public.settings for select to anon, authenticated using (true);
drop policy if exists "admin settings" on public.settings;
create policy "admin settings" on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- visitors can place an order (and nothing else); only the admin can read or change orders
drop policy if exists "place order" on public.orders;
create policy "place order" on public.orders for insert to anon, authenticated
  with check (
    status = 'new'
    and char_length(customer_name) between 1 and 120
    and char_length(email) between 3 and 200
    and char_length(address) <= 500
    and char_length(customer_note) <= 1000
    and cancel_reason = '' and emails_sent = '{}'
    and jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 60
    and total between 0 and 5000 and subtotal between 0 and 5000
  );
drop policy if exists "admin orders" on public.orders;
create policy "admin orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- photo storage (for photos you upload in the admin) ----------
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;

drop policy if exists "photos are public" on storage.objects;
create policy "photos are public" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists "admin adds photos" on storage.objects;
create policy "admin adds photos" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin changes photos" on storage.objects;
create policy "admin changes photos" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin removes photos" on storage.objects;
create policy "admin removes photos" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- ---------- email sign-ups from the footer ----------
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

-- ---------- order emails (see update-emails.sql) ----------
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_order_email() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform net.http_post(
    url := 'https://gshowmtmibiqaytnyqkr.supabase.co/functions/v1/send-email',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('type', TG_OP, 'order_id', new.id)
  );
  return new;
end $$;

drop trigger if exists orders_email_insert on public.orders;
create trigger orders_email_insert after insert on public.orders
  for each row execute function public.notify_order_email();

drop trigger if exists orders_email_update on public.orders;
create trigger orders_email_update after update of status on public.orders
  for each row when (old.status is distinct from new.status) execute function public.notify_order_email();
