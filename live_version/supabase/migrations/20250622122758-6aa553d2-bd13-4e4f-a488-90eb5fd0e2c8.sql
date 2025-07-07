
-- Create the documents table that seems to be missing
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  document_type text,
  client_name text,
  client_email text,
  client_address text,
  client_city text,
  client_postal_code text,
  status text NOT NULL DEFAULT 'draft',
  organization_id uuid NOT NULL,
  workspace_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents access
CREATE POLICY "Users can view documents in their organization" 
  ON public.documents 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can create documents in their organization" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (user_has_org_access(organization_id));

CREATE POLICY "Users can update documents in their organization" 
  ON public.documents 
  FOR UPDATE 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Users can delete documents in their organization" 
  ON public.documents 
  FOR DELETE 
  USING (user_has_org_access(organization_id));

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
