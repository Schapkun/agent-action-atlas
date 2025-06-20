
-- Remove cross-organization label assignments that cause the visibility issues
DELETE FROM document_template_label_assignments 
WHERE label_id IN (
  SELECT dtla.label_id 
  FROM document_template_label_assignments dtla
  JOIN document_template_labels dtl ON dtla.label_id = dtl.id
  JOIN document_templates dt ON dtla.template_id = dt.id
  WHERE dtl.organization_id != dt.organization_id
);

-- Ensure all templates have proper organization-scoped labels
-- This will help prevent future cross-organization issues
