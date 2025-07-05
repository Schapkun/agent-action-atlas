
-- Fix invoice numbering function to ensure proper sequential numbering
CREATE OR REPLACE FUNCTION public.generate_invoice_number_with_gaps(org_id uuid, workspace_id uuid DEFAULT NULL::uuid)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  year_part TEXT;
  next_sequence INTEGER;
  invoice_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get the highest existing invoice number for this organization this year
  -- Use COALESCE to ensure we always get a number, starting from 0 if no invoices exist
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN SPLIT_PART(invoice_number, '-', 2) ~ '^\d+$' 
        THEN CAST(SPLIT_PART(invoice_number, '-', 2) AS INTEGER)
        ELSE 0
      END
    ), 
    0
  ) + 1
  INTO next_sequence
  FROM public.invoices 
  WHERE organization_id = org_id 
    AND invoice_number LIKE year_part || '-%';
  
  -- Ensure we never return NULL and always start from 1 minimum
  IF next_sequence IS NULL OR next_sequence < 1 THEN
    next_sequence := 1;
  END IF;
  
  invoice_num := year_part || '-' || LPAD(next_sequence::TEXT, 3, '0');
  
  RETURN invoice_num;
END;
$function$;

-- Add default footer text to organization_settings table
ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS default_footer_text TEXT 
DEFAULT 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl met omschrijving: %INVOICE_NUMBER%';
