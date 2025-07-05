
-- Fix invoice numbering to fill gaps like contact numbering
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
  SELECT ARRAY_AGG(CAST(SPLIT_PART(invoice_number, '-', 2) AS INTEGER))
  INTO used_numbers
  FROM public.invoices 
  WHERE organization_id = org_id 
    AND (workspace_id IS NULL OR public.invoices.workspace_id = generate_invoice_number_with_gaps.workspace_id)
    AND invoice_number LIKE year_part || '-%'
    AND SPLIT_PART(invoice_number, '-', 2) ~ '^\d+$';
  
  -- Find the lowest available number starting from 1
  sequence_num := 1;
  WHILE sequence_num = ANY(used_numbers) LOOP
    sequence_num := sequence_num + 1;
  END LOOP;
  
  invoice_num := year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN invoice_num;
END;
$function$;

-- Fix quote numbering to only use settings prefix (no year duplication)
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
  SELECT COALESCE(quote_prefix, 'OFF-') INTO quote_prefix
  FROM public.organization_settings 
  WHERE organization_id = org_id;
  
  -- Get all existing quote numbers for this organization
  SELECT ARRAY_AGG(CAST(REGEXP_REPLACE(quote_number, '^' || quote_prefix, '') AS INTEGER))
  INTO used_numbers
  FROM public.quotes 
  WHERE organization_id = org_id 
    AND (workspace_id IS NULL OR public.quotes.workspace_id = generate_quote_number_with_gaps.workspace_id)
    AND quote_number LIKE quote_prefix || '%'
    AND REGEXP_REPLACE(quote_number, '^' || quote_prefix, '') ~ '^\d+$';
  
  -- Find the lowest available number starting from 1
  sequence_num := 1;
  WHILE sequence_num = ANY(used_numbers) LOOP
    sequence_num := sequence_num + 1;
  END LOOP;
  
  quote_num := quote_prefix || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN quote_num;
END;
$function$;

-- Function to renumber invoices after deletion (fill gaps)
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
  FOR invoice_record IN 
    SELECT id FROM public.invoices 
    WHERE organization_id = org_id 
      AND (workspace_id IS NULL OR public.invoices.workspace_id = renumber_invoices_after_deletion.workspace_id)
      AND invoice_number LIKE year_part || '-%'
    ORDER BY created_at ASC
  LOOP
    UPDATE public.invoices 
    SET invoice_number = year_part || '-' || LPAD(new_sequence::TEXT, 3, '0')
    WHERE id = invoice_record.id;
    
    new_sequence := new_sequence + 1;
  END LOOP;
END;
$function$;

-- Function to renumber quotes after deletion (fill gaps)
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
  SELECT COALESCE(quote_prefix, 'OFF-') INTO quote_prefix
  FROM public.organization_settings 
  WHERE organization_id = org_id;
  
  -- Renumber all quotes in this organization/workspace based on created_at
  FOR quote_record IN 
    SELECT id FROM public.quotes 
    WHERE organization_id = org_id 
      AND (workspace_id IS NULL OR public.quotes.workspace_id = renumber_quotes_after_deletion.workspace_id)
    ORDER BY created_at ASC
  LOOP
    UPDATE public.quotes 
    SET quote_number = quote_prefix || LPAD(new_sequence::TEXT, 3, '0')
    WHERE id = quote_record.id;
    
    new_sequence := new_sequence + 1;
  END LOOP;
END;
$function$;

-- Trigger for invoice deletion renumbering
CREATE OR REPLACE FUNCTION public.handle_invoice_deletion()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Call the renumbering function for the affected organization/workspace
  PERFORM public.renumber_invoices_after_deletion(OLD.organization_id, OLD.workspace_id);
  
  RETURN OLD;
END;
$function$;

-- Trigger for quote deletion renumbering
CREATE OR REPLACE FUNCTION public.handle_quote_deletion()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Call the renumbering function for the affected organization/workspace
  PERFORM public.renumber_quotes_after_deletion(OLD.organization_id, OLD.workspace_id);
  
  RETURN OLD;
END;
$function$;

-- Create triggers for automatic renumbering after deletion
DROP TRIGGER IF EXISTS invoice_deletion_renumber ON public.invoices;
CREATE TRIGGER invoice_deletion_renumber
  AFTER DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invoice_deletion();

DROP TRIGGER IF EXISTS quote_deletion_renumber ON public.quotes;
CREATE TRIGGER quote_deletion_renumber
  AFTER DELETE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_quote_deletion();
