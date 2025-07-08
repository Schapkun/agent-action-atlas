
-- Voeg missende kolommen toe aan organization_settings
ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS default_payment_terms integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS default_vat_rate numeric DEFAULT 21.00;

-- Verwijder overbodige contact-gerelateerde kolommen
ALTER TABLE public.organization_settings 
DROP COLUMN IF EXISTS contact_prefix,
DROP COLUMN IF EXISTS contact_start_number;

-- Update bestaande records met default waarden
UPDATE public.organization_settings 
SET 
  default_payment_terms = COALESCE(default_payment_terms, 30),
  default_vat_rate = COALESCE(default_vat_rate, 21.00);
