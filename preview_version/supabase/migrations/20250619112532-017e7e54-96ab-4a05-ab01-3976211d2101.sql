
-- Migratie script voor hiërarchische contactnummers
-- Dit script zorgt ervoor dat elke werkruimte zijn eigen nummering krijgt die begint bij 001

-- Stap 1: Update alle contacten naar hiërarchisch formaat
DO $$
DECLARE
  org_record RECORD;
  workspace_record RECORD;
  client_record RECORD;
  contact_sequence INTEGER;
BEGIN
  -- Loop door alle organisaties
  FOR org_record IN 
    SELECT DISTINCT organization_id, organization_number 
    FROM public.clients c
    JOIN public.organizations o ON c.organization_id = o.id
    WHERE o.organization_number IS NOT NULL
  LOOP
    -- Voor elke organisatie, loop door alle werkruimtes
    FOR workspace_record IN 
      SELECT DISTINCT c.workspace_id, w.workspace_number
      FROM public.clients c
      JOIN public.workspaces w ON c.workspace_id = w.id
      WHERE c.organization_id = org_record.organization_id
        AND w.workspace_number IS NOT NULL
    LOOP
      contact_sequence := 1;
      
      -- Update contacten in deze specifieke werkruimte
      FOR client_record IN 
        SELECT id 
        FROM public.clients 
        WHERE organization_id = org_record.organization_id 
          AND workspace_id = workspace_record.workspace_id
        ORDER BY created_at ASC
      LOOP
        -- Update met nieuwe hiërarchische nummering: 001-001-001
        UPDATE public.clients 
        SET contact_number = LPAD(org_record.organization_number::TEXT, 3, '0') || '-' || 
                            LPAD(workspace_record.workspace_number::TEXT, 3, '0') || '-' || 
                            LPAD(contact_sequence::TEXT, 3, '0')
        WHERE id = client_record.id;
        
        contact_sequence := contact_sequence + 1;
      END LOOP;
    END LOOP;
    
    -- Update organisatie-level contacten (zonder werkruimte)
    contact_sequence := 1;
    FOR client_record IN 
      SELECT id 
      FROM public.clients 
      WHERE organization_id = org_record.organization_id 
        AND workspace_id IS NULL
      ORDER BY created_at ASC
    LOOP
      -- Update met organisatie-level formaat: 001-001
      UPDATE public.clients 
      SET contact_number = LPAD(org_record.organization_number::TEXT, 3, '0') || '-' || 
                          LPAD(contact_sequence::TEXT, 3, '0')
      WHERE id = client_record.id;
      
      contact_sequence := contact_sequence + 1;
    END LOOP;
  END LOOP;
END $$;
