
-- Add a test logo URL to verify logo functionality
-- Using a publicly available test logo
UPDATE public.organization_settings 
SET company_logo = 'https://via.placeholder.com/200x100/0066CC/FFFFFF?text=TEST+LOGO'
WHERE organization_id = (
  SELECT id FROM public.organizations LIMIT 1
);

-- If no organization_settings record exists yet, create one with the test logo
INSERT INTO public.organization_settings (organization_id, company_logo)
SELECT o.id, 'https://via.placeholder.com/200x100/0066CC/FFFFFF?text=TEST+LOGO'
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.organization_settings os 
  WHERE os.organization_id = o.id
)
LIMIT 1;
