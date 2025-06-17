
-- Add logo support to organization_settings table
ALTER TABLE public.organization_settings 
ADD COLUMN company_logo TEXT;

-- Add a comment to explain the column
COMMENT ON COLUMN public.organization_settings.company_logo IS 'URL or path to company logo image';
