
-- Create ai_settings table for storing AI instructions per organization/workspace
CREATE TABLE public.ai_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  workspace_id uuid NULL,
  instruction_type text NOT NULL CHECK (instruction_type IN ('general', 'document_generation', 'email_responses')),
  instructions text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NULL
);

-- Add RLS policies
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_settings
CREATE POLICY "Users can view ai_settings for their organizations" 
  ON public.ai_settings 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Org admins can manage ai_settings" 
  ON public.ai_settings 
  FOR ALL 
  USING (is_org_admin_or_owner(organization_id, auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
