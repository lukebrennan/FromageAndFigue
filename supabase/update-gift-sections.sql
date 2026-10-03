-- Fromage & Figue: update 2. Lets each gifts category have its own heading and intro on the Boards & gifts page.
-- Paste into Supabase > SQL Editor > New query, then press Run. Safe to run more than once.
alter table public.categories add column if not exists title text not null default '';
alter table public.categories add column if not exists intro text not null default '';
update public.categories set title = 'For the *table.*', intro = 'Served on a wooden board, with bread, nuts and a preserve. Each is composed from what is at its best this week.' where id = 'board' and title = '';
update public.categories set title = 'For *giving.*', intro = 'Wrapped in paper, tied with ribbon and finished with a handwritten card. Ready to collect, or sent to your door.' where id = 'box' and title = '';
update public.categories set title = 'Let them *choose.*', intro = 'A voucher to spend in the shop, in a black envelope tied with ribbon. Choose an amount and we will have it ready.' where id = 'voucher' and title = '';
