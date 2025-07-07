
-- Remove foreign key constraints and columns from organization_settings first
ALTER TABLE public.organization_settings 
DROP COLUMN IF EXISTS default_invoice_label_id;

ALTER TABLE public.organization_settings 
DROP COLUMN IF EXISTS default_quote_label_id;

-- Add default_template_id column to document_types table
ALTER TABLE public.document_types 
ADD COLUMN default_template_id uuid REFERENCES public.document_templates(id);

-- Drop the document_settings table (contains label configurations)
DROP TABLE IF EXISTS public.document_settings;

-- Drop document_template_label_assignments table
DROP TABLE IF EXISTS public.document_template_label_assignments;

-- Drop document_template_labels table (now without dependencies)
DROP TABLE IF EXISTS public.document_template_labels;

-- Remove tags column from document_templates table
ALTER TABLE public.document_templates 
DROP COLUMN IF EXISTS tags;

-- Add index for better performance on the new foreign key
CREATE INDEX idx_document_types_default_template_id ON public.document_types(default_template_id);
