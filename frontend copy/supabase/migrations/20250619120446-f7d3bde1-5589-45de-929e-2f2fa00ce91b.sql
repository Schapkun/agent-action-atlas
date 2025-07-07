
-- Update het bestaande contact naar het juiste hiërarchische formaat
UPDATE public.clients 
SET contact_number = '001-001-001'
WHERE contact_number = '001' 
  AND organization_id IN (
    SELECT id FROM public.organizations WHERE organization_number = 1
  )
  AND workspace_id IN (
    SELECT id FROM public.workspaces WHERE workspace_number = 1
  );

-- Verifieer dat alle contacten nu het juiste formaat hebben
-- Dit zou geen resultaten moeten geven na de update
SELECT id, name, contact_number 
FROM public.clients 
WHERE contact_number NOT LIKE '%-%-%' 
  AND contact_number NOT LIKE '%-%'
  AND LENGTH(contact_number) = 3;
