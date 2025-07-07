
-- Uitbreiden van emails tabel voor volledige email integratie
ALTER TABLE public.emails 
ADD COLUMN IF NOT EXISTS message_id text,
ADD COLUMN IF NOT EXISTS in_reply_to text,
ADD COLUMN IF NOT EXISTS email_references text,
ADD COLUMN IF NOT EXISTS body_html text,
ADD COLUMN IF NOT EXISTS body_text text,
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS headers jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS thread_id text,
ADD COLUMN IF NOT EXISTS folder text DEFAULT 'inbox',
ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS received_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS make_scenario_id text,
ADD COLUMN IF NOT EXISTS raw_email_data jsonb;

-- Indexes toevoegen voor betere performance
CREATE INDEX IF NOT EXISTS idx_emails_message_id ON public.emails(message_id);
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON public.emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON public.emails(received_at);
CREATE INDEX IF NOT EXISTS idx_emails_folder ON public.emails(folder);
CREATE INDEX IF NOT EXISTS idx_emails_status ON public.emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_org_workspace ON public.emails(organization_id, workspace_id);

-- RLS policies voor emails tabel
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Verwijder bestaande policies als ze bestaan
DROP POLICY IF EXISTS "Users can view emails for their organization" ON public.emails;
DROP POLICY IF EXISTS "Organization admins can manage emails" ON public.emails;

-- Nieuwe RLS policies
CREATE POLICY "Users can view emails for their organization" 
  ON public.emails 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Organization admins can manage emails" 
  ON public.emails 
  FOR ALL 
  USING (is_org_admin_or_owner(organization_id, auth.uid()));

-- Webhook endpoint tabel voor Make.com email integratie
CREATE TABLE IF NOT EXISTS public.email_webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  workspace_id uuid,
  webhook_url text NOT NULL,
  webhook_type text NOT NULL DEFAULT 'email_receive',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS voor email_webhooks
ALTER TABLE public.email_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email webhooks for their organization" 
  ON public.email_webhooks 
  FOR SELECT 
  USING (user_has_org_access(organization_id));

CREATE POLICY "Organization admins can manage email webhooks" 
  ON public.email_webhooks 
  FOR ALL 
  USING (is_org_admin_or_owner(organization_id, auth.uid()));
