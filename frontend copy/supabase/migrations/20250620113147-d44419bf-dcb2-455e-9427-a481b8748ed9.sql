
-- Verwijder alle inactieve document templates behalve het "Standaard Factuur Template"
-- Dit lost het label verwijdering probleem op door de verborgen templates weg te halen

DELETE FROM public.document_template_label_assignments 
WHERE template_id IN (
  SELECT id FROM public.document_templates 
  WHERE is_active = false 
  AND name != 'Standaard Factuur Template'
);

DELETE FROM public.document_templates 
WHERE is_active = false 
AND name != 'Standaard Factuur Template';

-- Verwijder ook alle actieve templates behalve het "Standaard Factuur Template"
DELETE FROM public.document_template_label_assignments 
WHERE template_id IN (
  SELECT id FROM public.document_templates 
  WHERE name NOT IN ('Standaard Factuur Template')
);

DELETE FROM public.document_templates 
WHERE name NOT IN ('Standaard Factuur Template');
