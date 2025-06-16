
-- Controleer de huidige RLS policies voor organization_settings
DROP POLICY IF EXISTS "Users can view organization settings for their organizations" ON public.organization_settings;
DROP POLICY IF EXISTS "Users can insert organization settings for their organizations" ON public.organization_settings;
DROP POLICY IF EXISTS "Users can update organization settings for their organizations" ON public.organization_settings;

-- Voeg bedrijfsgegevens kolommen toe als ze nog niet bestaan
ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_address text,
ADD COLUMN IF NOT EXISTS company_postal_code text,
ADD COLUMN IF NOT EXISTS company_city text,
ADD COLUMN IF NOT EXISTS company_email text,
ADD COLUMN IF NOT EXISTS company_phone text,
ADD COLUMN IF NOT EXISTS company_website text,
ADD COLUMN IF NOT EXISTS company_vat text,
ADD COLUMN IF NOT EXISTS company_kvk text,
ADD COLUMN IF NOT EXISTS company_bank text;

-- Maak nieuwe RLS policies die werken met de huidige user context
CREATE POLICY "Users can view organization settings for their organizations" ON public.organization_settings
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert organization settings for their organizations" ON public.organization_settings
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner', 'member')
    )
  );

CREATE POLICY "Users can update organization settings for their organizations" ON public.organization_settings
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner', 'member')
    )
  );
