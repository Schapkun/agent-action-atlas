
-- Voeg organisation_number toe aan organizations tabel
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS organization_number integer;

-- Voeg workspace_number toe aan workspaces tabel  
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS workspace_number integer;

-- Update bestaande organisaties met nummers (chronologisch gebaseerd op created_at)
UPDATE public.organizations 
SET organization_number = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM public.organizations
  WHERE organization_number IS NULL
) as subquery
WHERE public.organizations.id = subquery.id;

-- Update bestaande werkruimtes met nummers (per organisatie, chronologisch)
UPDATE public.workspaces 
SET workspace_number = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY organization_id ORDER BY created_at) as row_num
  FROM public.workspaces
  WHERE workspace_number IS NULL
) as subquery
WHERE public.workspaces.id = subquery.id;

-- Vervang de oude generate_contact_number functie met nieuwe hiërarchische versie
CREATE OR REPLACE FUNCTION public.generate_hierarchical_contact_number(org_id uuid, workspace_id uuid DEFAULT NULL::uuid)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  org_number INTEGER;
  workspace_number INTEGER;
  contact_sequence INTEGER;
  contact_num TEXT;
BEGIN
  -- Haal organisatie nummer op
  SELECT organization_number INTO org_number
  FROM public.organizations 
  WHERE id = org_id;
  
  -- Als workspace_id gegeven is, haal workspace nummer op
  IF workspace_id IS NOT NULL THEN
    SELECT w.workspace_number INTO workspace_number
    FROM public.workspaces w
    WHERE w.id = workspace_id AND w.organization_id = org_id;
    
    -- Get next sequence number voor deze workspace
    SELECT COALESCE(MAX(CAST(SPLIT_PART(contact_number, '-', 3) AS INTEGER)), 0) + 1
    INTO contact_sequence
    FROM public.clients 
    WHERE organization_id = org_id 
      AND public.clients.workspace_id = generate_hierarchical_contact_number.workspace_id
      AND contact_number LIKE LPAD(org_number::TEXT, 3, '0') || '-' || LPAD(workspace_number::TEXT, 3, '0') || '-%';
  ELSE
    -- Voor organisatie-level contacten (geen workspace)
    SELECT COALESCE(MAX(CAST(SPLIT_PART(contact_number, '-', 2) AS INTEGER)), 0) + 1
    INTO contact_sequence
    FROM public.clients 
    WHERE organization_id = org_id 
      AND workspace_id IS NULL
      AND contact_number LIKE LPAD(org_number::TEXT, 3, '0') || '-%'
      AND LENGTH(contact_number) - LENGTH(REPLACE(contact_number, '-', '')) = 1; -- Alleen org-contact format
  END IF;
  
  -- Bouw het contact nummer
  IF workspace_id IS NOT NULL AND workspace_number IS NOT NULL THEN
    -- Formaat: 001-001-001
    contact_num := LPAD(org_number::TEXT, 3, '0') || '-' || 
                   LPAD(workspace_number::TEXT, 3, '0') || '-' || 
                   LPAD(contact_sequence::TEXT, 3, '0');
  ELSE
    -- Formaat: 001-001 (organisatie level)
    contact_num := LPAD(org_number::TEXT, 3, '0') || '-' || 
                   LPAD(contact_sequence::TEXT, 3, '0');
  END IF;
  
  RETURN contact_num;
END;
$function$;

-- Update de bestaande auto_assign_contact_number trigger functie
CREATE OR REPLACE FUNCTION public.auto_assign_contact_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only assign if contact_number is not already set
  IF NEW.contact_number IS NULL OR NEW.contact_number = '' THEN
    NEW.contact_number := generate_hierarchical_contact_number(NEW.organization_id, NEW.workspace_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Voeg auto-numbering toe voor nieuwe organisaties
CREATE OR REPLACE FUNCTION public.auto_assign_organization_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.organization_number IS NULL THEN
    SELECT COALESCE(MAX(organization_number), 0) + 1 
    INTO NEW.organization_number
    FROM public.organizations;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Voeg auto-numbering toe voor nieuwe werkruimtes
CREATE OR REPLACE FUNCTION public.auto_assign_workspace_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.workspace_number IS NULL THEN
    SELECT COALESCE(MAX(workspace_number), 0) + 1 
    INTO NEW.workspace_number
    FROM public.workspaces
    WHERE organization_id = NEW.organization_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Maak triggers voor auto-numbering
DROP TRIGGER IF EXISTS auto_assign_organization_number_trigger ON public.organizations;
CREATE TRIGGER auto_assign_organization_number_trigger
  BEFORE INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_organization_number();

DROP TRIGGER IF EXISTS auto_assign_workspace_number_trigger ON public.workspaces;
CREATE TRIGGER auto_assign_workspace_number_trigger
  BEFORE INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_workspace_number();
