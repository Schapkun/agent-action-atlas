
-- Create document_types table for custom document types per organization
CREATE TABLE public.document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL, -- Display name in Dutch
  organization_id UUID NOT NULL,
  workspace_id UUID NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, organization_id) -- Prevent duplicate names per organization
);

-- Add RLS policies for document_types
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

-- Add trigger to update updated_at
CREATE TRIGGER update_document_types_updated_at
  BEFORE UPDATE ON public.document_types
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default document types for existing organizations
INSERT INTO public.document_types (name, label, organization_id)
SELECT 
  document_type.name,
  document_type.label,
  org.id
FROM (
  VALUES 
    ('contract', 'Contracten'),
    ('brief', 'Brieven'),
    ('rapport', 'Rapporten'),
    ('overeenkomst', 'Overeenkomsten'),
    ('notitie', 'Notities'),
    ('factuur', 'Facturen'),
    ('offerte', 'Offertes')
) AS document_type(name, label)
CROSS JOIN public.organizations org;

-- Update document_settings to reference document_types instead of hardcoded strings
ALTER TABLE public.document_settings 
ADD COLUMN document_type_id UUID REFERENCES public.document_types(id);

-- Migrate existing document_settings to use document_type_id
UPDATE public.document_settings ds
SET document_type_id = dt.id
FROM public.document_types dt
WHERE ds.document_type = dt.name 
AND ds.organization_id = dt.organization_id;

-- Remove old document_type column after migration
ALTER TABLE public.document_settings DROP COLUMN document_type;

-- Make document_type_id required
ALTER TABLE public.document_settings ALTER COLUMN document_type_id SET NOT NULL;
