-- Fromage & Figue: update 3. Lets customers leave a note with their order.
-- Paste into Supabase > SQL Editor > New query, then press Run. Safe to run more than once.
alter table public.orders add column if not exists customer_note text not null default '';

drop policy if exists "place order" on public.orders;
create policy "place order" on public.orders for insert to anon, authenticated
  with check (
    status = 'new'
    and char_length(customer_name) between 1 and 120
    and char_length(email) between 3 and 200
    and char_length(address) <= 500
    and char_length(customer_note) <= 1000
    and jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 60
    and total between 0 and 5000 and subtotal between 0 and 5000
  );
