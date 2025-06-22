
-- Fix invoice numbering to properly get the next sequential number
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
  SELECT COALESCE(
    MAX(CAST(SPLIT_PART(invoice_number, '-', 2) AS INTEGER)),
    0
  ) + 1
  INTO next_sequence
  FROM public.invoices 
  WHERE organization_id = org_id 
    AND (workspace_id IS NULL OR public.invoices.workspace_id = generate_invoice_number_with_gaps.workspace_id)
    AND invoice_number LIKE year_part || '-%'
    AND SPLIT_PART(invoice_number, '-', 2) ~ '^\d+$';
  
  -- If no invoices found, start from 1
  IF next_sequence IS NULL THEN
    next_sequence := 1;
  END IF;
  
  invoice_num := year_part || '-' || LPAD(next_sequence::TEXT, 3, '0');
  
  RETURN invoice_num;
END;
$function$;
