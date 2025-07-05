
-- Create organization_settings table
CREATE TABLE public.organization_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_prefix text DEFAULT '2025-',
  invoice_start_number integer DEFAULT 1,
  quote_prefix text DEFAULT 'OFF-2025-',
  quote_start_number integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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
      AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Users can update organization settings for their organizations" ON public.organization_settings
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

-- Create function to update updated_at timestamp (only if it doesn't exist)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER on_organization_settings_updated
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
