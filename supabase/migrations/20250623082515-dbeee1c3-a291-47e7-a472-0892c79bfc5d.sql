
-- Maak invoice_number nullable voor concepten
ALTER TABLE public.invoices 
ALTER COLUMN invoice_number DROP NOT NULL;

-- Maak quote_number nullable voor concepten  
ALTER TABLE public.quotes 
ALTER COLUMN quote_number DROP NOT NULL;
