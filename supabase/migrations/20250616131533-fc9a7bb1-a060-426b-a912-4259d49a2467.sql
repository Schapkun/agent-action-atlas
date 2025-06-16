
-- Voeg bedrijfsgegevens kolommen toe aan organization_settings
ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_address text,
ADD COLUMN IF NOT EXISTS company_postal_code text,
ADD COLUMN IF NOT EXISTS company_city text,
ADD COLUMN IF NOT EXISTS company_email text,
ADD COLUMN IF NOT EXISTS company_phone text,
ADD COLUMN IF NOT EXISTS company_website text,
ADD COLUMN IF NOT EXISTS company_vat text,
ADD COLUMN IF NOT EXISTS company_kvk text,
ADD COLUMN IF NOT EXISTS company_bank text;
