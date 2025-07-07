
-- Functie om contacten te hernummeren na verwijdering
CREATE OR REPLACE FUNCTION public.renumber_contacts_after_deletion(org_id uuid, workspace_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  contact_record RECORD;
  new_sequence INTEGER := 1;
  org_number INTEGER;
  workspace_number INTEGER;
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
    
    -- Hernummer alle contacten in deze workspace op basis van created_at
    FOR contact_record IN 
      SELECT id FROM public.clients 
      WHERE organization_id = org_id 
        AND public.clients.workspace_id = renumber_contacts_after_deletion.workspace_id
      ORDER BY created_at ASC
    LOOP
      UPDATE public.clients 
      SET contact_number = LPAD(org_number::TEXT, 3, '0') || '-' || 
                          LPAD(workspace_number::TEXT, 3, '0') || '-' || 
                          LPAD(new_sequence::TEXT, 3, '0')
      WHERE id = contact_record.id;
      
      new_sequence := new_sequence + 1;
    END LOOP;
  ELSE
    -- Hernummer organisatie-level contacten
    FOR contact_record IN 
      SELECT id FROM public.clients 
      WHERE organization_id = org_id 
        AND workspace_id IS NULL
      ORDER BY created_at ASC
    LOOP
      UPDATE public.clients 
      SET contact_number = LPAD(org_number::TEXT, 3, '0') || '-' || 
                          LPAD(new_sequence::TEXT, 3, '0')
      WHERE id = contact_record.id;
      
      new_sequence := new_sequence + 1;
    END LOOP;
  END IF;
END;
$function$;

-- Trigger functie die automatisch hernummert na verwijdering
CREATE OR REPLACE FUNCTION public.handle_contact_deletion()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Roep de hernummering functie aan voor de betreffende organisatie/workspace
  PERFORM public.renumber_contacts_after_deletion(OLD.organization_id, OLD.workspace_id);
  
  RETURN OLD;
END;
$function$;

-- Maak de trigger aan
DROP TRIGGER IF EXISTS trigger_renumber_after_contact_deletion ON public.clients;
CREATE TRIGGER trigger_renumber_after_contact_deletion
  AFTER DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_contact_deletion();
