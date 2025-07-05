
-- Create document_settings table to store default label configurations per document type
CREATE TABLE public.document_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  default_label_id UUID REFERENCES public.document_template_labels(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, document_type)
);

-- Enable RLS
ALTER TABLE public.document_settings ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER update_document_settings_updated_at
  BEFORE UPDATE ON public.document_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
