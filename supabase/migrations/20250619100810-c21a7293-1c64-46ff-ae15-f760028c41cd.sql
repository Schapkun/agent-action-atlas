
-- Voeg nieuwe kolommen toe aan clients tabel voor ontbrekende velden
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'prive',
ADD COLUMN IF NOT EXISTS address_line_2 text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS salutation text DEFAULT 'Geachte heer/mevrouw',
ADD COLUMN IF NOT EXISTS contact_name_on_invoice boolean DEFAULT false;

-- Update bestaande contacten met standaard type als het leeg is
UPDATE public.clients 
SET type = 'prive' 
WHERE type IS NULL;
