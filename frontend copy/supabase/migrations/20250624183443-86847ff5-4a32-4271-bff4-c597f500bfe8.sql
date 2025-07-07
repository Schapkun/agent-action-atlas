
-- Update jouw rol naar "owner" in alle organisaties waar je lid van bent
UPDATE public.organization_members 
SET role = 'owner' 
WHERE email = 'info@schapkun.com';

-- Zorg ervoor dat je ook owner bent van eventuele workspace memberships
UPDATE public.workspace_members 
SET role = 'owner' 
WHERE email = 'info@schapkun.com';
