
-- Verwijder alle templates die alleen op type 'factuur' filteren zonder 'Factuur' label
DELETE FROM public.document_templates 
WHERE type = 'factuur' 
AND id NOT IN (
  SELECT DISTINCT dt.id 
  FROM public.document_templates dt
  JOIN public.document_template_label_assignments dtla ON dt.id = dtla.template_id
  JOIN public.document_template_labels dtl ON dtla.label_id = dtl.id
  WHERE dtl.name = 'Factuur'
);

-- Update alle overgebleven templates naar type 'custom' voor consistentie
UPDATE public.document_templates 
SET type = 'custom'
WHERE type = 'factuur';
