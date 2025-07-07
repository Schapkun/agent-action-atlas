
-- Extend the dossiers table with additional fields
ALTER TABLE public.dossiers 
ADD COLUMN IF NOT EXISTS dossier_number text,
ADD COLUMN IF NOT EXISTS reference text,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date,
ADD COLUMN IF NOT EXISTS responsible_user_id uuid,
ADD COLUMN IF NOT EXISTS budget numeric(10,2),
ADD COLUMN IF NOT EXISTS is_billable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS tags text[];

-- Create function to generate dossier numbers
CREATE OR REPLACE FUNCTION public.generate_dossier_number(org_id uuid, workspace_id uuid DEFAULT NULL::uuid)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  dossier_num TEXT;
  dossier_prefix TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get dossier prefix from organization settings, default to 'DOS-'
  SELECT COALESCE(dos.dossier_prefix, 'DOS-') INTO dossier_prefix
  FROM public.organization_settings dos
  WHERE dos.organization_id = org_id;
  
  -- If no settings found, use default
  IF dossier_prefix IS NULL THEN
    dossier_prefix := 'DOS-';
  END IF;
  
  -- Get next sequence number for this organization/workspace
  SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(dossier_number, '^' || dossier_prefix || year_part || '-', '') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.dossiers 
  WHERE organization_id = org_id 
    AND (generate_dossier_number.workspace_id IS NULL OR workspace_id = generate_dossier_number.workspace_id)
    AND dossier_number LIKE dossier_prefix || year_part || '-%'
    AND REGEXP_REPLACE(dossier_number, '^' || dossier_prefix || year_part || '-', '') ~ '^\d+$';
  
  dossier_num := dossier_prefix || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN dossier_num;
END;
$function$;

-- Add dossier_prefix to organization_settings if it doesn't exist
ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS dossier_prefix text DEFAULT 'DOS-';

-- Create trigger to auto-assign dossier numbers
CREATE OR REPLACE FUNCTION public.auto_assign_dossier_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only assign if dossier_number is not already set
  IF NEW.dossier_number IS NULL OR NEW.dossier_number = '' THEN
    NEW.dossier_number := generate_dossier_number(NEW.organization_id, NEW.workspace_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_assign_dossier_number ON public.dossiers;
CREATE TRIGGER trigger_auto_assign_dossier_number
  BEFORE INSERT ON public.dossiers
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_dossier_number();
