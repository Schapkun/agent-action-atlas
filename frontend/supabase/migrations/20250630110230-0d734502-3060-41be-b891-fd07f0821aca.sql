
-- Voeg bearer_token kolom toe aan make_webhooks tabel
ALTER TABLE public.make_webhooks 
ADD COLUMN bearer_token text;
