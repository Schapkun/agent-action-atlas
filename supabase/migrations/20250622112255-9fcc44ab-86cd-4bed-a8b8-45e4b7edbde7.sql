
-- Fix the ambiguous workspace_id reference in invoice numbering functions
CREATE OR REPLACE FUNCTION public.generate_invoice_number_with_gaps(org_id uuid, workspace_id uuid DEFAULT NULL::uuid)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
  used_numbers INTEGER[];
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get all existing invoice numbers for this organization this year
  -- Fix: Use table alias to avoid ambiguous column reference
  SELECT ARRAY_AGG(CAST(SPLIT_PART(i.invoice_number, '-', 2) AS INTEGER))
  INTO used_numbers
  FROM public.invoices i
  WHERE i.organization_id = org_id 
    AND (workspace_id IS NULL OR i.workspace_id = generate_invoice_number_with_gaps.workspace_id)
    AND i.invoice_number LIKE year_part || '-%'
    AND SPLIT_PART(i.invoice_number, '-', 2) ~ '^\d+$';
  
  -- Find the lowest available number starting from 1
  sequence_num := 1;
  WHILE sequence_num = ANY(used_numbers) LOOP
    sequence_num := sequence_num + 1;
  END LOOP;
  
  invoice_num := year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN invoice_num;
END;
$function$;

-- Fix the renumber function as well
CREATE OR REPLACE FUNCTION public.renumber_invoices_after_deletion(org_id uuid, workspace_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  invoice_record RECORD;
  new_sequence INTEGER := 1;
  year_part TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Renumber all invoices in this organization/workspace based on created_at
  -- Fix: Use table alias to avoid ambiguous column reference
  FOR invoice_record IN 
    SELECT i.id FROM public.invoices i
    WHERE i.organization_id = org_id 
      AND (workspace_id IS NULL OR i.workspace_id = renumber_invoices_after_deletion.workspace_id)
      AND i.invoice_number LIKE year_part || '-%'
    ORDER BY i.created_at ASC
  LOOP
    UPDATE public.invoices 
    SET invoice_number = year_part || '-' || LPAD(new_sequence::TEXT, 3, '0')
    WHERE id = invoice_record.id;
    
    new_sequence := new_sequence + 1;
  END LOOP;
END;
$function$;

-- Fix quote functions as well to prevent similar issues
CREATE OR REPLACE FUNCTION public.generate_quote_number_with_gaps(org_id uuid, workspace_id uuid DEFAULT NULL::uuid)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  quote_prefix TEXT;
  sequence_num INTEGER;
  quote_num TEXT;
  used_numbers INTEGER[];
BEGIN
  -- Get quote prefix from organization settings
  SELECT COALESCE(os.quote_prefix, 'OFF-') INTO quote_prefix
  FROM public.organization_settings os
  WHERE os.organization_id = org_id;
  
  -- Get all existing quote numbers for this organization
  -- Fix: Use table alias to avoid ambiguous column reference
  SELECT ARRAY_AGG(CAST(REGEXP_REPLACE(q.quote_number, '^' || quote_prefix, '') AS INTEGER))
  INTO used_numbers
  FROM public.quotes q
  WHERE q.organization_id = org_id 
    AND (workspace_id IS NULL OR q.workspace_id = generate_quote_number_with_gaps.workspace_id)
    AND q.quote_number LIKE quote_prefix || '%'
    AND REGEXP_REPLACE(q.quote_number, '^' || quote_prefix, '') ~ '^\d+$';
  
  -- Find the lowest available number starting from 1
  sequence_num := 1;
  WHILE sequence_num = ANY(used_numbers) LOOP
    sequence_num := sequence_num + 1;
  END LOOP;
  
  quote_num := quote_prefix || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN quote_num;
END;
$function$;

-- Fix renumber quotes function
CREATE OR REPLACE FUNCTION public.renumber_quotes_after_deletion(org_id uuid, workspace_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  quote_record RECORD;
  new_sequence INTEGER := 1;
  quote_prefix TEXT;
BEGIN
  -- Get quote prefix from organization settings
  SELECT COALESCE(os.quote_prefix, 'OFF-') INTO quote_prefix
  FROM public.organization_settings os
  WHERE os.organization_id = org_id;
  
  -- Renumber all quotes in this organization/workspace based on created_at
  -- Fix: Use table alias to avoid ambiguous column reference
  FOR quote_record IN 
    SELECT q.id FROM public.quotes q
    WHERE q.organization_id = org_id 
      AND (workspace_id IS NULL OR q.workspace_id = renumber_quotes_after_deletion.workspace_id)
    ORDER BY q.created_at ASC
  LOOP
    UPDATE public.quotes 
    SET quote_number = quote_prefix || LPAD(new_sequence::TEXT, 3, '0')
    WHERE id = quote_record.id;
    
    new_sequence := new_sequence + 1;
  END LOOP;
END;
$function$;
