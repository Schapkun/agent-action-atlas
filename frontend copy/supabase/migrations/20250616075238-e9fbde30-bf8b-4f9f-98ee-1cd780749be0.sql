
-- Add contact_number field to clients table and organization settings
ALTER TABLE public.clients 
ADD COLUMN contact_number VARCHAR(20);

-- Add contact numbering settings to organization_settings
ALTER TABLE public.organization_settings 
ADD COLUMN contact_prefix VARCHAR(10) DEFAULT '',
ADD COLUMN contact_start_number INTEGER DEFAULT 1;

-- Create function to generate contact numbers
CREATE OR REPLACE FUNCTION generate_contact_number(org_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
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
  
  contact_num := prefix_part || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN contact_num;
END;
$$;

-- Create trigger to auto-assign contact numbers
CREATE OR REPLACE FUNCTION auto_assign_contact_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only assign if contact_number is not already set
  IF NEW.contact_number IS NULL OR NEW.contact_number = '' THEN
    NEW.contact_number := generate_contact_number(NEW.organization_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_assign_contact_number ON public.clients;
CREATE TRIGGER trigger_auto_assign_contact_number
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_contact_number();

-- Update existing clients with contact numbers (starting from 0001)
DO $$
DECLARE
  org_record RECORD;
  client_record RECORD;
  counter INTEGER;
BEGIN
  -- For each organization
  FOR org_record IN SELECT DISTINCT organization_id FROM public.clients WHERE contact_number IS NULL LOOP
    counter := 1;
    
    -- For each client in this organization (ordered by creation date)
    FOR client_record IN 
      SELECT id FROM public.clients 
      WHERE organization_id = org_record.organization_id 
        AND contact_number IS NULL
      ORDER BY created_at ASC
    LOOP
      UPDATE public.clients 
      SET contact_number = LPAD(counter::TEXT, 4, '0')
      WHERE id = client_record.id;
      
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;
