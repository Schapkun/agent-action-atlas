
-- Enable RLS for document_types table
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check organization membership
CREATE OR REPLACE FUNCTION public.user_has_org_access(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = org_id 
    AND user_id = auth.uid()
  );
$$;

-- Policy for SELECT: Users can view document types from their organizations
CREATE POLICY "Users can view org document types" 
  ON public.document_types 
  FOR SELECT 
  USING (public.user_has_org_access(organization_id));

-- Policy for INSERT: Users can create document types for their organizations
CREATE POLICY "Users can create org document types" 
  ON public.document_types 
  FOR INSERT 
  WITH CHECK (public.user_has_org_access(organization_id));

-- Policy for UPDATE: Users can update document types from their organizations
CREATE POLICY "Users can update org document types" 
  ON public.document_types 
  FOR UPDATE 
  USING (public.user_has_org_access(organization_id))
  WITH CHECK (public.user_has_org_access(organization_id));

-- Policy for DELETE: Users can delete document types from their organizations
CREATE POLICY "Users can delete org document types" 
  ON public.document_types 
  FOR DELETE 
  USING (public.user_has_org_access(organization_id));
