
-- Fix the logo CSS in the standard invoice template
UPDATE public.document_templates 
SET html_content = REPLACE(
  html_content,
  '.logo { max-width: 200px; max-height: 100px; }',
  '.logo { max-width: 200px; max-height: 100px; object-fit: contain; }'
)
WHERE name = 'Standaard Factuur Template';

-- Also fix if the problematic small logo CSS exists
UPDATE public.document_templates 
SET html_content = REPLACE(
  REPLACE(
    REPLACE(html_content, 'max-width: 20px', 'max-width: 200px'),
    'max-height: 10px', 'max-height: 100px'
  ),
  '.logo { max-width: 200px; max-height: 100px; }',
  '.logo { max-width: 200px; max-height: 100px; object-fit: contain; }'
)
WHERE name = 'Standaard Factuur Template';
