
-- Update de generate_contact_number functie om 3-cijfer formaat te gebruiken
CREATE OR REPLACE FUNCTION public.generate_contact_number(org_id uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  prefix_part TEXT;
  sequence_num INTEGER;
  contact_num TEXT;
BEGIN
  -- Get prefix and start number from organization settings
  SELECT 
    COALESCE(contact_prefix, ''),
    COALESCE(contact_start_number, 1)
  INTO prefix_part, sequence_num
  FROM public.organization_settings 
  WHERE organization_id = org_id;
  
  -- If no settings found, use defaults
  IF prefix_part IS NULL THEN
    prefix_part := '';
  END IF;
  
  IF sequence_num IS NULL THEN
    sequence_num := 1;
  END IF;
  
  -- Get next sequence number for this organization
  SELECT COALESCE(MAX(CAST(REPLACE(contact_number, prefix_part, '') AS INTEGER)), sequence_num - 1) + 1
  INTO sequence_num
  FROM public.clients 
  WHERE organization_id = org_id 
    AND contact_number IS NOT NULL
    AND contact_number ~ '^\d+$' OR contact_number ~ ('^' || prefix_part || '\d+$');
  
  -- Use 3-digit padding instead of 4-digit
  contact_num := prefix_part || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN contact_num;
END;
$function$;

-- Reset alle bestaande contact nummers naar 3-cijfer formaat
DO $$
DECLARE
  org_record RECORD;
  client_record RECORD;
  new_number INTEGER;
BEGIN
  -- Loop door alle organisaties
  FOR org_record IN SELECT DISTINCT organization_id FROM public.clients LOOP
    new_number := 1;
    
    -- Loop door alle clients van deze organisatie, gesorteerd op created_at
    FOR client_record IN 
      SELECT id FROM public.clients 
      WHERE organization_id = org_record.organization_id 
      ORDER BY created_at ASC
    LOOP
      -- Update met nieuwe 3-cijfer nummering
      UPDATE public.clients 
      SET contact_number = LPAD(new_number::TEXT, 3, '0')
      WHERE id = client_record.id;
      
      new_number := new_number + 1;
    END LOOP;
  END LOOP;
END $$;
