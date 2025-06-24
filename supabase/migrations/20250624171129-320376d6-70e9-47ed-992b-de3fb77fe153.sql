
-- Create support_requests table for bug reports and feature requests
CREATE TABLE public.support_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  workspace_id uuid NULL,
  user_id uuid NULL,
  request_type text NOT NULL CHECK (request_type IN ('bug_report', 'feature_request', 'contact_form')),
  subject text NOT NULL,
  description text NOT NULL,
  contact_email text NOT NULL,
  contact_name text NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for support_requests
CREATE POLICY "Users can view their own support requests" 
  ON public.support_requests 
  FOR SELECT 
  USING (user_id = auth.uid() OR user_has_org_access(organization_id));

CREATE POLICY "Users can create support requests" 
  ON public.support_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Org admins can manage support requests" 
  ON public.support_requests 
  FOR UPDATE 
  USING (is_org_admin_or_owner(organization_id, auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
