-- Fromage & Figue: update 5. Order emails.
-- Adds the fields the emails need, and makes the database ask the "send-email" function to send them.
-- Paste into Supabase > SQL Editor > New query, then press Run. Safe to run more than once.
alter table public.orders add column if not exists cancel_reason text not null default '';
alter table public.orders add column if not exists emails_sent text[] not null default '{}';

-- visitors can place an order, but cannot set the admin-only fields
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

-- ask the send-email function to send the right email whenever an order is placed or its status changes
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
