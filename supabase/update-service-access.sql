-- Fromage & Figue: update 6. Lets the send-email function read orders and products.
-- (Supabase did not give its internal "service_role" access to the tables we created, so the function could not see
--  product photos or look up an order. This is only used by the function, never by the website.)
-- Paste into Supabase > SQL Editor > New query, then press Run. Safe to run more than once.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
