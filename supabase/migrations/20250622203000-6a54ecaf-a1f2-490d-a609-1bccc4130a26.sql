
-- Add default_quote_footer_text column to organization_settings table
ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS default_quote_footer_text TEXT 
DEFAULT 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %QUOTE_NUMBER%';
