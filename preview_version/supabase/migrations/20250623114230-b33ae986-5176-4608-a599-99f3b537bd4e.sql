
-- Uitbreiden van ai_actions tabel voor Make.com integratie
ALTER TABLE public.ai_actions 
ADD COLUMN make_scenario_id text,
ADD COLUMN webhook_url text,
ADD COLUMN action_data jsonb,
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN approved_by uuid,
ADD COLUMN executed_at timestamp with time zone,
ADD COLUMN execution_result jsonb;

-- Index toevoegen voor betere performance
CREATE INDEX idx_ai_actions_make_scenario ON public.ai_actions(make_scenario_id);
CREATE INDEX idx_ai_actions_status ON public.ai_actions(status);

-- Nieuwe tabel voor webhook configuratie
CREATE TABLE public.make_webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  workspace_id uuid,
  webhook_type text NOT NULL,
  webhook_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS policies voor make_webhooks
ALTER TABLE public.make_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view make_webhooks for their organization" 
  ON public.make_webhooks 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Organization admins can manage make_webhooks" 
  ON public.make_webhooks 
  FOR ALL 
  USING (is_org_admin_or_owner(organization_id, auth.uid()));
