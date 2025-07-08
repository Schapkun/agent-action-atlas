
-- Activeer bestaande templates die zijn gedeactiveerd
UPDATE public.document_templates 
SET is_active = true, updated_at = now()
WHERE is_active = false;

-- Zorg ervoor dat created_by veld niet null is voor bestaande records
UPDATE public.document_templates 
SET created_by = (
  SELECT om.user_id 
  FROM public.organization_members om 
  WHERE om.organization_id = document_templates.organization_id 
  AND om.role IN ('owner', 'admin') 
  LIMIT 1
)
WHERE created_by IS NULL;

-- Voeg RLS policies toe voor document_templates als deze nog niet bestaan
DO $$ 
BEGIN
  -- Policy voor SELECT (lezen)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'document_templates' 
    AND policyname = 'Users can view organization templates'
  ) THEN
    CREATE POLICY "Users can view organization templates" 
    ON public.document_templates 
    FOR SELECT 
    USING (
      organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- Policy voor INSERT (aanmaken)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'document_templates' 
    AND policyname = 'Users can create organization templates'
  ) THEN
    CREATE POLICY "Users can create organization templates" 
    ON public.document_templates 
    FOR INSERT 
    WITH CHECK (
      organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid()
      )
      AND created_by = auth.uid()
    );
  END IF;

  -- Policy voor UPDATE (bijwerken)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'document_templates' 
    AND policyname = 'Users can update organization templates'
  ) THEN
    CREATE POLICY "Users can update organization templates" 
    ON public.document_templates 
    FOR UPDATE 
    USING (
      organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- Policy voor DELETE (verwijderen)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'document_templates' 
    AND policyname = 'Users can delete organization templates'
  ) THEN
    CREATE POLICY "Users can delete organization templates" 
    ON public.document_templates 
    FOR DELETE 
    USING (
      organization_id IN (
        SELECT organization_id 
        FROM public.organization_members 
        WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Schakel RLS in voor document_templates als dit nog niet gebeurd is
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
