
-- Add RLS policies for document_types table

-- Policy for SELECT: Users can view document types from their organization
CREATE POLICY "Users can view document types from their organization"
ON public.document_types
FOR SELECT
USING (
  public.is_organization_member(organization_id, auth.uid())
);

-- Policy for INSERT: Only admins and owners can create document types
CREATE POLICY "Admins and owners can create document types"
ON public.document_types
FOR INSERT
WITH CHECK (
  public.get_user_organization_role(organization_id, auth.uid()) IN ('admin', 'owner')
  AND auth.uid() IS NOT NULL
);

-- Policy for UPDATE: Only admins and owners can update document types
CREATE POLICY "Admins and owners can update document types"
ON public.document_types
FOR UPDATE
USING (
  public.is_organization_member(organization_id, auth.uid())
  AND public.get_user_organization_role(organization_id, auth.uid()) IN ('admin', 'owner')
);

-- Policy for DELETE: Only admins and owners can delete document types
CREATE POLICY "Admins and owners can delete document types"
ON public.document_types
FOR DELETE
USING (
  public.is_organization_member(organization_id, auth.uid())
  AND public.get_user_organization_role(organization_id, auth.uid()) IN ('admin', 'owner')
);
