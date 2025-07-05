
-- Add default label columns to organization_settings table
ALTER TABLE public.organization_settings 
ADD COLUMN default_invoice_label_id uuid REFERENCES public.document_template_labels(id),
ADD COLUMN default_quote_label_id uuid REFERENCES public.document_template_labels(id);
