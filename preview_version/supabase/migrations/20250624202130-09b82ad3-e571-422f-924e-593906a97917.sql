
-- Stap 1: Verwijder eerst de bestaande check constraint
ALTER TABLE public.ai_settings DROP CONSTRAINT IF EXISTS ai_settings_instruction_type_check;

-- Stap 2: Update bestaande AI instructies naar nieuwe Nederlandse types
UPDATE public.ai_settings 
SET instruction_type = CASE 
  WHEN instruction_type = 'document_generation' THEN 'documenten'
  WHEN instruction_type = 'general' THEN 'emails'
  WHEN instruction_type = 'email_response' THEN 'emails'
  WHEN instruction_type = 'task_creation' THEN 'openstaande_taken'
  WHEN instruction_type = 'client_communication' THEN 'emails'
  WHEN instruction_type = 'case_analysis' THEN 'dossiers'
  ELSE instruction_type
END
WHERE instruction_type IN ('document_generation', 'general', 'email_response', 'task_creation', 'client_communication', 'case_analysis');

-- Stap 3: Voeg nieuwe check constraint toe voor de Nederlandse instruction types
ALTER TABLE public.ai_settings 
ADD CONSTRAINT ai_settings_instruction_type_check 
CHECK (instruction_type IN (
  'openstaande_taken',
  'dossiers', 
  'documenten',
  'facturen_offertes',
  'telefoongesprekken',
  'emails'
));

-- Stap 4: Verwijder duplicaten als er meerdere instructies van hetzelfde type zijn na de merge
DELETE FROM public.ai_settings 
WHERE id NOT IN (
  SELECT DISTINCT ON (organization_id, workspace_id, instruction_type) id
  FROM public.ai_settings
  ORDER BY organization_id, workspace_id, instruction_type, created_at DESC
);
