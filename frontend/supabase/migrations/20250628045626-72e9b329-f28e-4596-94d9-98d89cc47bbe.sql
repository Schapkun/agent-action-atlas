
-- Add time component to dossier_deadlines table
ALTER TABLE public.dossier_deadlines 
ALTER COLUMN due_date TYPE timestamp with time zone USING due_date::timestamp with time zone;

-- Add deadline warning settings to organization_settings table
ALTER TABLE public.organization_settings 
ADD COLUMN deadline_red_hours integer DEFAULT 48,
ADD COLUMN deadline_orange_days integer DEFAULT 7;
