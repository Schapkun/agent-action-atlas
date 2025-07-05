
-- First, check current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.document_templates'::regclass 
AND contype = 'c';

-- Drop existing constraint if it exists
ALTER TABLE public.document_templates 
DROP CONSTRAINT IF EXISTS document_templates_type_check;

-- Add new constraint that includes 'schapkun'
ALTER TABLE public.document_templates 
ADD CONSTRAINT document_templates_type_check 
CHECK (type IN ('factuur', 'contract', 'brief', 'custom', 'schapkun'));

-- Verify the constraint was added correctly
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.document_templates'::regclass 
AND contype = 'c';
