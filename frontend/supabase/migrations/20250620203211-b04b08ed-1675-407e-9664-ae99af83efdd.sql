
-- Drop existing label tables and their relationships
DROP TABLE IF EXISTS public.document_template_label_assignments;
DROP TABLE IF EXISTS public.document_template_labels;

-- Add simple tags column to document_templates
ALTER TABLE public.document_templates 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Update existing templates to have empty tags array
UPDATE public.document_templates 
SET tags = '{}' 
WHERE tags IS NULL;
